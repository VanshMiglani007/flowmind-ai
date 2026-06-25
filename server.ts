import dotenv from "dotenv";
import path from "path";

// Initialize environment variables from .env.local and .env files
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

console.log("Gemini Key Loaded:", !!process.env.GEMINI_API_KEY);

import express, { Request, Response } from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { enqueueGeminiRequest, getQueueSize } from "./src/server/requestQueue";
import { generateCacheKey, getCached, setCache } from "./src/server/responseCache";
import { getLocalSmartResponse } from "./src/server/localResponses";

const app = express();

// Security: Limit request body size to 50kb
app.use(express.json({ limit: "50kb" }));

const PORT = 3000;

// Centralized model constant — use cheapest model for free-tier stability
const GEMINI_MODEL = "gemini-2.0-flash-lite";
console.log(`[Gemini] Active model: ${GEMINI_MODEL}`);

// Maximum prompt size (chars) accepted by the server
const MAX_PROMPT_CHARS = 3000;

// Gemini request timeout (ms)
const GEMINI_TIMEOUT_MS = 30000;

// Lazy initialization of Gemini client
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please add it in the Secrets panel (Settings > Secrets).");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log(`Gemini model initialized successfully: ${GEMINI_MODEL}`);
  }
  return aiInstance;
}

/**
 * Estimate token count from a string (rough: 1 token ≈ 4 chars)
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function sanitizeAndRespondError(res: Response, error: any, context: string) {
  console.error(`[FlowMind Server] ${context}:`, error);
  
  const msg = error.message || "";
  let statusCode = 500;
  let clientError = "An unexpected instability occurred in the cognitive matrix.";
  
  if (msg.includes("API_KEY") || msg.includes("key is not defined") || msg.includes("API key not valid")) {
    statusCode = 401;
    clientError = "API key configuration required. Please verify your GEMINI_API_KEY is set correctly inside Settings.";
  } else if (msg.includes("ResourceExhausted") || msg.includes("quota") || msg.includes("429")) {
    statusCode = 429;
    clientError = "AI capacity temporarily exhausted. Please retry in about a minute.";
  } else if (msg.includes("503") || msg.includes("ServiceUnavailable") || msg.includes("unavailable") || msg.includes("overloaded")) {
    statusCode = 503;
    clientError = "FlowMind AI is currently experiencing high demand. Please retry in a few moments.";
  } else if (msg.includes("Too many pending")) {
    statusCode = 429;
    clientError = "Too many pending requests. Please wait a moment before trying again.";
  } else if (msg.includes("fetch") || msg.includes("network")) {
    statusCode = 502;
    clientError = "Connection unresponsive. Please check your network connection and try again.";
  } else if (msg.includes("timed out") || msg.includes("abort")) {
    statusCode = 504;
    clientError = "Request timed out. The AI service is taking too long. Please try again.";
  } else {
    // Other errors, don't leak internals or stack traces
    clientError = `Connection interrupted: ${msg.slice(0, 150)}`;
  }

  res.status(statusCode).json({ error: clientError });
}

function parseGeminiResponse(text: string | undefined): any {
  if (!text) return {};
  
  let cleaned = text.trim();
  
  // Remove markdown code block wrappers if present (e.g., ```json ... ``` or ``` ... ```)
  if (cleaned.startsWith("```")) {
    const match = cleaned.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
    if (match && match[1]) {
      cleaned = match[1].trim();
    } else {
      cleaned = cleaned.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    }
  }
  
  try {
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("[FlowMind Server] JSON parsing failed. Cleaned string was:", cleaned);
    throw error;
  }
}

/**
 * Validate prompt size. Returns true if valid, sends error response and returns false if not.
 */
function validatePromptSize(res: Response, content: string): boolean {
  if (content.length > MAX_PROMPT_CHARS) {
    console.warn(`[Gemini Rejected] Prompt too large: ${content.length} chars (max ${MAX_PROMPT_CHARS})`);
    res.status(400).json({ error: `Prompt too large (${content.length} chars). Maximum is ${MAX_PROMPT_CHARS} characters.` });
    return false;
  }
  return true;
}

/**
 * Execute a Gemini request with AbortController timeout protection.
 */
async function executeGeminiWithTimeout(fn: () => Promise<any>): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Gemini request timed out after " + GEMINI_TIMEOUT_MS + "ms"));
    }, GEMINI_TIMEOUT_MS);

    try {
      const result = await fn();
      clearTimeout(timeout);
      resolve(result);
    } catch (error) {
      clearTimeout(timeout);
      reject(error);
    }
  });
}

// Backend test and health endpoints
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.get("/api/test", (req: Request, res: Response) => {
  res.json({ message: "FlowMind backend operational" });
});

// 1. CHATBOT ASSISTANT ENDPOINT
app.post("/api/gemini/chat", async (req: Request, res: Response) => {
  try {
    const { contents, systemInstruction } = req.body;
    if (!contents || !Array.isArray(contents)) {
      res.status(400).json({ error: "Missing or invalid 'contents' in request body." });
      return;
    }

    // Validate prompt size (serialize contents for size check)
    const contentStr = JSON.stringify(contents);
    if (!validatePromptSize(res, contentStr)) return;

    // Check cache
    const cacheKey = generateCacheKey(contentStr + (systemInstruction || ""));
    const cached = getCached(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    try {
      const result = await enqueueGeminiRequest(async () => {
        const ai = getGeminiClient();
        const tokenEstimate = estimateTokens(contentStr);
        console.log(`[Gemini Chat] Token estimate: ~${tokenEstimate} | Contents: ${contents.length} messages`);

        return executeGeminiWithTimeout(async () => {
          const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents,
            config: {
              systemInstruction: systemInstruction || "You are a professional, calm AI Productivity Coach inside FlowMind AI. Help with planning, focus, and stress management. Keep responses concise and actionable.",
              temperature: 0.7,
            },
          });
          return { text: response.text, source: "gemini" };
        });
      });

      console.log("[Gemini Live Response]");
      // Cache the response
      setCache(cacheKey, result);
      res.json(result);
    } catch (geminiError: any) {
      const msg = geminiError.message || "";
      console.log(`[Fallback Activated] Gemini failed, error: ${msg}`);

      let isQuota = false;
      if (msg.includes("ResourceExhausted") || msg.includes("quota") || msg.includes("429") || msg.includes("Too many pending")) {
        isQuota = true;
      }

      const lastUserMessage = contents
        .filter((c: any) => c.role === "user")
        .map((c: any) => c.parts?.map((p: any) => p.text).join(" ") || "")
        .pop() || "";
      
      const localResponse = getLocalSmartResponse(lastUserMessage);
      const fallbackText = localResponse || "AI temporarily unavailable. Please retry shortly.";

      res.json({
        text: fallbackText,
        source: "fallback",
        quotaExhausted: isQuota
      });
    }
  } catch (error: any) {
    sanitizeAndRespondError(res, error, "Gemini Chat Error");
  }
});

// 2. TASK PRIORITIZATION & RISK PREDICTION ENDPOINT
app.post("/api/gemini/prioritize", async (req: Request, res: Response) => {
  try {
    const { tasks, mood } = req.body;
    if (!tasks || !Array.isArray(tasks)) {
      res.status(400).json({ error: "Missing or invalid 'tasks' array." });
      return;
    }

    // Build compact prompt
    const compactTasks = tasks.map((t: any) => ({
      id: t.id, title: t.title, priority: t.priority,
      dueDate: t.dueDate, duration: t.duration,
      procrastinationCount: t.procrastinationCount
    }));
    const promptContent = `Prioritize these tasks. User mood: "${mood || 'focused'}".\nTasks: ${JSON.stringify(compactTasks)}`;

    if (!validatePromptSize(res, promptContent)) return;

    // Check cache
    const cacheKey = generateCacheKey(promptContent);
    const cached = getCached(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    const result = await enqueueGeminiRequest(async () => {
      const ai = getGeminiClient();
      const tokenEstimate = estimateTokens(promptContent);
      console.log(`[Gemini Prioritize] Token estimate: ~${tokenEstimate} | Tasks: ${tasks.length}`);

      return executeGeminiWithTimeout(async () => {
        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: promptContent,
          config: {
            systemInstruction: "You are FlowMind's AI Productivity Engine. Analyze tasks and return JSON with prioritized parameters: priorityScore (0-100), riskLevel, riskPercentage (0-100), riskReason, correctiveAction, dynamicWorkload (1-10), adjustedDuration (minutes), dynamicReasoning. Adjust for user mood.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              required: ["prioritizedTasks"],
              properties: {
                prioritizedTasks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: ["taskId", "priorityScore", "riskLevel", "riskPercentage", "riskReason", "correctiveAction", "dynamicWorkload", "adjustedDuration", "dynamicReasoning"],
                    properties: {
                      taskId: { type: Type.STRING },
                      priorityScore: { type: Type.INTEGER },
                      riskLevel: { type: Type.STRING },
                      riskPercentage: { type: Type.INTEGER },
                      riskReason: { type: Type.STRING },
                      correctiveAction: { type: Type.STRING },
                      dynamicWorkload: { type: Type.INTEGER },
                      adjustedDuration: { type: Type.INTEGER },
                      dynamicReasoning: { type: Type.STRING }
                    }
                  }
                }
              }
            }
          }
        });
        return parseGeminiResponse(response.text);
      });
    });

    setCache(cacheKey, result);
    res.json(result);
  } catch (error: any) {
    sanitizeAndRespondError(res, error, "Gemini Prioritize Error");
  }
});

// 3. DAILY SCHEDULE GENERATOR (TIME-BLOCKING)
app.post("/api/gemini/plan", async (req: Request, res: Response) => {
  try {
    const { tasks, mood, workHoursStart, workHoursEnd, breakPreference, stressLevel, focusConsistency } = req.body;
    if (!tasks || !Array.isArray(tasks)) {
      res.status(400).json({ error: "Missing or invalid 'tasks' array." });
      return;
    }

    // Build compact task list for prompt
    const compactTasks = tasks.map((t: any) => ({
      id: t.id, title: t.title, priority: t.priority,
      duration: t.duration, procrastinationCount: t.procrastinationCount
    }));
    const promptContent = `Generate a day schedule from ${workHoursStart || '09:00'} to ${workHoursEnd || '17:00'}.
Mood: "${mood || 'focused'}", Stress: "${stressLevel || 'medium'}", Breaks: "${breakPreference || 'regular'}", Focus: "${focusConsistency || 'medium'}".
Tasks: ${JSON.stringify(compactTasks)}`;

    if (!validatePromptSize(res, promptContent)) return;

    const cacheKey = generateCacheKey(promptContent);
    const cached = getCached(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    const result = await enqueueGeminiRequest(async () => {
      const ai = getGeminiClient();
      const tokenEstimate = estimateTokens(promptContent);
      console.log(`[Gemini Plan] Token estimate: ~${tokenEstimate} | Tasks: ${tasks.length}`);

      return executeGeminiWithTimeout(async () => {
        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: promptContent,
          config: {
            systemInstruction: "You are FlowMind's Day Planner. Generate complete personalized schedules with work/break/buffer blocks. Return valid JSON. Use HH:MM 24-hour format. Include burnout risk assessment, productivity tactics, and completion probability.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              required: [
                "schedule",
                "burnoutRisk",
                "burnoutWarning",
                "confidenceEstimate",
                "workloadDensity",
                "whyPrioritized",
                "whyRecovery",
                "tactics",
                "completionProbability"
              ],
              properties: {
                schedule: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: ["title", "startTime", "endTime", "type", "description", "focusIntensity"],
                    properties: {
                      taskId: { type: Type.STRING },
                      title: { type: Type.STRING },
                      startTime: { type: Type.STRING },
                      endTime: { type: Type.STRING },
                      type: { type: Type.STRING },
                      description: { type: Type.STRING },
                      focusIntensity: { type: Type.INTEGER }
                    }
                  }
                },
                burnoutRisk: { type: Type.STRING },
                burnoutWarning: { type: Type.STRING },
                confidenceEstimate: { type: Type.INTEGER },
                workloadDensity: { type: Type.INTEGER },
                whyPrioritized: { type: Type.STRING },
                whyRecovery: { type: Type.STRING },
                tactics: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                completionProbability: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: ["taskId", "title", "probability"],
                    properties: {
                      taskId: { type: Type.STRING },
                      title: { type: Type.STRING },
                      probability: { type: Type.INTEGER }
                    }
                  }
                }
              }
            }
          }
        });
        return parseGeminiResponse(response.text);
      });
    });

    setCache(cacheKey, result);
    res.json(result);
  } catch (error: any) {
    sanitizeAndRespondError(res, error, "Gemini Schedule Plan Error");
  }
});

// 4. SMART GOAL BREAKDOWN
app.post("/api/gemini/breakdown", async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;
    if (!title) {
      res.status(400).json({ error: "Missing task 'title' for breakdown." });
      return;
    }

    const promptContent = `Break down: "${title}". Details: "${(description || 'None').slice(0, 500)}". Create 4-6 actionable subtasks with durations.`;

    if (!validatePromptSize(res, promptContent)) return;

    const cacheKey = generateCacheKey(promptContent);
    const cached = getCached(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    const result = await enqueueGeminiRequest(async () => {
      const ai = getGeminiClient();
      const tokenEstimate = estimateTokens(promptContent);
      console.log(`[Gemini Breakdown] Token estimate: ~${tokenEstimate} | Task: "${title}"`);

      return executeGeminiWithTimeout(async () => {
        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: promptContent,
          config: {
            systemInstruction: "You are FlowMind's task planner. Deconstruct goals into precise actionable milestones with estimated durations (minutes) and order. Return JSON.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              required: ["subtasks"],
              properties: {
                subtasks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: ["title", "durationMin", "order"],
                    properties: {
                      title: { type: Type.STRING },
                      durationMin: { type: Type.INTEGER },
                      order: { type: Type.INTEGER }
                    }
                  }
                }
              }
            }
          }
        });
        return parseGeminiResponse(response.text);
      });
    });

    setCache(cacheKey, result);
    res.json(result);
  } catch (error: any) {
    sanitizeAndRespondError(res, error, "Gemini Breakdown Error");
  }
});

// 5. SMART INSIGHTS & REVIEW GENERATION
app.post("/api/gemini/insights", async (req: Request, res: Response) => {
  try {
    const { completedTasksCount, pendingTasksCount, stats } = req.body;

    const promptContent = `Weekly Review: Completed: ${completedTasksCount || 0}, Pending: ${pendingTasksCount || 0}, Focus hours: ${stats?.focusHours || 0}, Pomodoros: ${stats?.pomoSessions || 0}, Habit streak: ${stats?.habitStreak || 0} days, XP: ${stats?.xp || 0}`;

    if (!validatePromptSize(res, promptContent)) return;

    const cacheKey = generateCacheKey(promptContent);
    const cached = getCached(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    const result = await enqueueGeminiRequest(async () => {
      const ai = getGeminiClient();
      const tokenEstimate = estimateTokens(promptContent);
      console.log(`[Gemini Insights] Token estimate: ~${tokenEstimate}`);

      return executeGeminiWithTimeout(async () => {
        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: promptContent,
          config: {
            systemInstruction: "You are FlowMind's Productivity Coach. Provide a productivityScore (0-100), focusScore (0-100), weeklyAnalysis, burnoutWarning, and 3-4 performanceInsights bullet points. Return JSON.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              required: ["productivityScore", "focusScore", "weeklyAnalysis", "burnoutWarning", "performanceInsights"],
              properties: {
                productivityScore: { type: Type.INTEGER },
                focusScore: { type: Type.INTEGER },
                weeklyAnalysis: { type: Type.STRING },
                burnoutWarning: { type: Type.STRING },
                performanceInsights: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              }
            }
          }
        });
        return parseGeminiResponse(response.text);
      });
    });

    setCache(cacheKey, result);
    res.json(result);
  } catch (error: any) {
    sanitizeAndRespondError(res, error, "Gemini Insights Error");
  }
});

// Integration of Vite Dev Server / Static Files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Serve index.html for React SPA
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[FlowMind AI] Server running at http://localhost:${PORT}`);
    console.log(`[FlowMind AI] Gemini model: ${GEMINI_MODEL}`);
    console.log(`[FlowMind AI] Rate limiter: active (3s cooldown, max queue: 10)`);
    console.log(`[FlowMind AI] Response cache: active (10min TTL)`);
  });
}

startServer();
