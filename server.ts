import dotenv from "dotenv";
import path from "path";

// Initialize environment variables from .env.local and .env files
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

console.log("Gemini Key Loaded:", !!process.env.GEMINI_API_KEY);

import express, { Request, Response } from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
app.use(express.json());

const PORT = 3000;

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
  }
  return aiInstance;
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
    clientError = "Service busy. Your requests have temporarily exceeded the rate limit. Please try again in a moment.";
  } else if (msg.includes("503") || msg.includes("ServiceUnavailable") || msg.includes("unavailable") || msg.includes("overloaded")) {
    statusCode = 503;
    clientError = "FlowMind AI is currently experiencing high demand. Your request is temporarily delayed. Please retry in a few moments.";
  } else if (msg.includes("fetch") || msg.includes("network")) {
    statusCode = 502;
    clientError = "Connection unresponsive. Please check your network connection and try again.";
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

// 1. CHATBOT ASSISTANT ENDPOINT
app.post("/api/gemini/chat", async (req: Request, res: Response) => {
  try {
    const { contents, systemInstruction } = req.body;
    if (!contents || !Array.isArray(contents)) {
      res.status(400).json({ error: "Missing or invalid 'contents' in request body." });
      return;
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: systemInstruction || "You are a professional, calm, and supportive AI Productivity Coach inside 'FlowMind AI'. Help the user with planning, focus, and stress management.",
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
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

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Perform a professional prioritization and deadline risk assessment on these tasks.
The user is currently feeling: "${mood || 'focused'}".

Adjust the workload dynamically. For example:
- If tired or stressed, reduce priorityScore on complex tasks, or suggest longer adjusted durations for recovery.
- If energetic or focused, increase capacity.

Tasks to prioritize:
${JSON.stringify(tasks, null, 2)}`,
      config: {
        systemInstruction: "You are FlowMind's AI Productivity Engine. Analyze the given list of tasks and return a JSON structured object with a list of prioritized parameters. Calculate priority scores (0 to 100), risk level (low, medium, high), risk percentage (0 to 100), risk reason, workload score, adjusted duration (in minutes), and a short corrective action.",
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
                  priorityScore: { type: Type.INTEGER, description: "A score from 0-100 indicating task importance/urgency based on deadline risk, category, mood, and procrastination count." },
                  riskLevel: { type: Type.STRING, description: "Must be 'low', 'medium', or 'high'." },
                  riskPercentage: { type: Type.INTEGER, description: "Predict probability of missing the deadline from 0 to 100." },
                  riskReason: { type: Type.STRING, description: "Reason why the task is at risk or safe." },
                  correctiveAction: { type: Type.STRING, description: "Actionable step to overcome procrastination or complete this task." },
                  dynamicWorkload: { type: Type.INTEGER, description: "Adjusted mental workload score (1 to 10) considering user mood." },
                  adjustedDuration: { type: Type.INTEGER, description: "Optimal duration in minutes, lengthened or shortened based on user mood." },
                  dynamicReasoning: { type: Type.STRING, description: "Brief explanation of how the user's mood and procrastination patterns affected this prioritization." }
                }
              }
            }
          }
        }
      }
    });

    res.json(parseGeminiResponse(response.text));
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

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate an intelligent, highly optimized, customized day schedule for standard hours: ${workHoursStart || '09:00'} to ${workHoursEnd || '17:00'}.
User mood: "${mood || 'focused'}".
User self-reported stress level: "${stressLevel || 'medium'}".
Break preference: "${breakPreference || 'regular'}".
Focus consistency metrics: "${focusConsistency || 'medium'}".

Tasks available (including priority, procrastinationCount, description):
${JSON.stringify(tasks, null, 2)}

Provide a structured schedule. Rules:
1. Chronological order from ${workHoursStart || '09:00'} to ${workHoursEnd || '17:00'}.
2. Inject 'work', 'break', 'buffer', or 'routine' blocks.
3. Automatically insert Pomodoro focus blocks (type 'work', specify focusIntensity 1-5 where 5 is high deep work).
4. For stressed, tired, or high-stress states, reduce focusIntensity on complex tasks, and insert explicit 'break' recovery blocks (breathing, stretching, rest).
5. Detect if the total duration of tasks exceeds available work hours (Overload). If so, flag 'high' burnoutRisk, write an empathetic warning in burnoutWarning, and list low-priority tasks that are recommended to be postponed/deferred to another day.
6. For each task, calculate an estimated probability of completion (0-100%) considering priority, procrastination count, stress level, and workload density.
7. Fill in explanations for why prioritized, why recovery was placed, and tailored productivity tactics.`,
      config: {
        systemInstruction: "You are the FlowMind AI Day Planner. You generate complete, personalized schedules based on workload density, mood, and deadline risks. You always return a valid, robust JSON object matching the requested schema. Ensure timestamps use HH:MM 24-hour format.",
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
              description: "The complete hour-by-hour timeline blocks.",
              items: {
                type: Type.OBJECT,
                required: ["title", "startTime", "endTime", "type", "description", "focusIntensity"],
                properties: {
                  taskId: { type: Type.STRING, description: "ID of the task linked to this block, if any. Otherwise null." },
                  title: { type: Type.STRING, description: "Display name of the block." },
                  startTime: { type: Type.STRING, description: "HH:MM format" },
                  endTime: { type: Type.STRING, description: "HH:MM format" },
                  type: { type: Type.STRING, description: "Must be: 'work', 'break', 'buffer', or 'routine'." },
                  description: { type: Type.STRING, description: "Supportive advice or productivity focus tips for this block." },
                  focusIntensity: { type: Type.INTEGER, description: "Scale of 1-5, where 5 is high-focus work and 1 is complete relaxation." }
                }
              }
            },
            burnoutRisk: { type: Type.STRING, description: "Burnout evaluation risk. Must be 'low', 'medium', or 'high'." },
            burnoutWarning: { type: Type.STRING, description: "A warning or analysis about overload, suggesting postponements for low-priority items if necessary." },
            confidenceEstimate: { type: Type.INTEGER, description: "Overall confidence score (0-100%) of the user completing this planned schedule successfully." },
            workloadDensity: { type: Type.INTEGER, description: "Density percentage (0-100%) showing how packed the work hours are." },
            whyPrioritized: { type: Type.STRING, description: "Detailed explanation of why certain tasks were prioritized based on high-risk, deadlines, and procrastination metrics." },
            whyRecovery: { type: Type.STRING, description: "Detailed explanation of why specific breaks or recovery blocks were scheduled." },
            tactics: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of 3 suggested psychological productivity tactics tailored to the user's specific state."
            },
            completionProbability: {
              type: Type.ARRAY,
              description: "Completion probability prediction per task.",
              items: {
                type: Type.OBJECT,
                required: ["taskId", "title", "probability"],
                properties: {
                  taskId: { type: Type.STRING },
                  title: { type: Type.STRING },
                  probability: { type: Type.INTEGER, description: "0-100 percentage likelihood of finishing." }
                }
              }
            }
          }
        }
      }
    });

    res.json(parseGeminiResponse(response.text));
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

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Break down the goal/task: "${title}"
Details: "${description || 'None'}"
Convert this into 4 to 6 actionable subtasks with durations.`,
      config: {
        systemInstruction: "You are FlowMind's task planner. Deconstruct large goals into precise, highly-actionable milestones. For each subtask, estimate its typical duration (in minutes) and sequential order. Return JSON structured data.",
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
                  title: { type: Type.STRING, description: "Concise actionable subtask name." },
                  durationMin: { type: Type.INTEGER, description: "Estimated completion time in minutes." },
                  order: { type: Type.INTEGER, description: "Execution order index (e.g. 1, 2, 3)." }
                }
              }
            }
          }
        }
      }
    });

    res.json(parseGeminiResponse(response.text));
  } catch (error: any) {
    sanitizeAndRespondError(res, error, "Gemini Breakdown Error");
  }
});

// 5. SMART INSIGHTS & REVIEW GENERATION
app.post("/api/gemini/insights", async (req: Request, res: Response) => {
  try {
    const { completedTasksCount, pendingTasksCount, categoriesRatio, stats } = req.body;

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a Weekly Review and Productivity Diagnosis.
Stats context:
- Completed tasks: ${completedTasksCount || 0}
- Pending tasks: ${pendingTasksCount || 0}
- Focus hours logged: ${stats?.focusHours || 0} hours
- Pomodoro sessions completed: ${stats?.pomoSessions || 0}
- Habit streak: ${stats?.habitStreak || 0} days
- XP earned: ${stats?.xp || 0}`,
      config: {
        systemInstruction: "You are FlowMind's Chief Productivity Coach. Provide a supportive, deep evaluation of the user's performance. Formulate a customized productivity score (0-100), a focus score (0-100), an inspiring weekly analysis (including constructive suggestions), a realistic burnout warning indicator or stress warning, and bullet-pointed performance insights. Return a JSON structure.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["productivityScore", "focusScore", "weeklyAnalysis", "burnoutWarning", "performanceInsights"],
          properties: {
            productivityScore: { type: Type.INTEGER },
            focusScore: { type: Type.INTEGER },
            weeklyAnalysis: { type: Type.STRING, description: "A couple of highly engaging, supportive, and analytical sentences on their achievements and pitfalls." },
            burnoutWarning: { type: Type.STRING, description: "A direct assessment of burnout risk (e.g. 'Low risk. Your stress recovery slots are well planned.' or 'HIGH RISK: Critical procrastination counts detected on major work items. Add recovery blocks immediately.')" },
            performanceInsights: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of 3-4 bullet points containing concrete advice, observations on habit consistency, or actionable behavioral tips."
            }
          }
        }
      }
    });

    res.json(parseGeminiResponse(response.text));
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
  });
}

startServer();
