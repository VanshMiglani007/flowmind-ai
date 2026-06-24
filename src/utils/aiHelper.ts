/**
 * FlowMind AI - Production-grade AI Reliability & Resilience Helper
 * Handles automatic silent retries, offline state detection, queueing,
 * and mapping raw API errors into supportive, emotionally intelligent, futuristic messages.
 */

// Helper to delay execution (cooldown / backoff)
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Type for queued requests
export interface QueuedPrompt {
  id: string;
  contents: any[];
  systemInstruction?: string;
  timestamp: number;
}

// Queue state in memory + synced to localStorage
const OFFLINE_QUEUE_KEY = "flowmind_offline_queue";

export function getOfflineQueue(): QueuedPrompt[] {
  try {
    const saved = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveOfflineQueue(queue: QueuedPrompt[]) {
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error("Failed to save offline queue", err);
  }
}

export function pushToOfflineQueue(contents: any[], systemInstruction?: string): QueuedPrompt {
  const queue = getOfflineQueue();
  const newItem: QueuedPrompt = {
    id: `prompt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    contents,
    systemInstruction,
    timestamp: Date.now()
  };
  queue.push(newItem);
  saveOfflineQueue(queue);
  return newItem;
}

// Map raw API errors into beautiful, supportive, and professional FlowMind prompts
export function mapAIError(errorMsg: string): string {
  const normalized = errorMsg.toLowerCase();
  
  if (normalized.includes("offline") || normalized.includes("network") || normalized.includes("failed to fetch")) {
    return "Offline Mode Active: Your network connection has been interrupted. Your request is safely queued and will automatically sync once your connection is restored.";
  }
  
  if (normalized.includes("api_key") || normalized.includes("key is not defined") || normalized.includes("invalid key")) {
    return "API Configuration Required: The AI service is not authorized. Please access the Settings page and verify that your GEMINI_API_KEY is correctly configured.";
  }
  
  if (normalized.includes("503") || normalized.includes("unavailable") || normalized.includes("overloaded") || normalized.includes("429") || normalized.includes("rate limit")) {
    return "Service Temporarily Busy: FlowMind AI is currently experiencing high demand. Your request has been queued—please wait a brief moment for the queue to clear.";
  }
  
  if (normalized.includes("timeout")) {
    return "Request Timeout: The AI service is taking longer than expected to respond. We are still trying to connect. You can try adjusting your prompt or re-submitting.";
  }

  // General elegant fallback
  return "Connection Disrupted: An unexpected error occurred. FlowMind is attempting to restore the connection. In the meantime, you can continue managing your priorities locally.";
}

// Emotionally intelligent local fallback response generator
export function getLocalFallbackResponse(query: string, tasks: any[], habits: any[]): string {
  const queryLower = query.toLowerCase();
  const activeTasksText = tasks && tasks.length > 0 
    ? tasks.slice(0, 3).map(t => `• ${t.title} (${t.priority || 'medium'} priority)`).join("\n")
    : "No urgent tasks scheduled.";
    
  const habitsText = habits && habits.length > 0
    ? habits.slice(0, 3).map(h => `• ${h.title} (Streak: ${h.streak || 0} days)`).join("\n")
    : "No active habits tracked.";

  if (queryLower.includes("procrastinate") || queryLower.includes("stuck") || queryLower.includes("motivation")) {
    return `### [FLOWMIND OFFLINE ASSISTANT]
Procrastination detected. While we re-establish a connection with our live AI service, here is a quick focus-recovery plan:

1. **Reduce Friction**: Choose the smallest, 5-minute step you can take right now to get started.
2. **Current Priorities**:
${activeTasksText}
3. **Focus Timer**: Start a 25-minute Pomodoro focus session. Don't worry about finishing—just focus on beginning.

Remember: *Momentum is built step by step.* Let's tackle just one small action together.`;
  }

  if (queryLower.includes("stress") || queryLower.includes("exhausted") || queryLower.includes("tired")) {
    return `### [FLOWMIND OFFLINE CALM GUIDE]
It sounds like your energy or stress levels are high. Here is a quick wellness and decompression strategy:

1. **Take a Breath**: Close your eyes and complete a 4-7-8 breathing sequence right now (Inhale for 4s, Hold for 7s, Exhale for 8s).
2. **Simplify Your List**: Let's focus only on what is critical. Your main tasks are:
${activeTasksText}
3. **Hydrate & Disconnect**: Step away from your desk for 5 minutes. Physical wellbeing is the foundation of sustainable focus.

Take a guilt-free break to recharge. Your tasks will be waiting when you return.`;
  }

  // Default scannable helpful feedback
  return `### [FLOWMIND OFFLINE PLANNER]
The AI is currently offline, but we have organized your local workspace to help you maintain momentum:

**1. Immediate Priorities:**
${activeTasksText}

**2. Active Habits:**
${habitsText}

**3. Recommended Next Steps:**
- Dedicate 10 minutes to review your high-priority items.
- Start a Pomodoro focus timer to clear any quick, actionable tasks.
- Use our Planner tool to schedule breaks between tasks.

We will automatically reconnect and update your coach as soon as your connection is restored!`;
}

/**
 * Executes a fetch to the AI API with silent retries, cooldown delays, and offline handling
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 2,
  onRetryAttempt?: (attempt: number, errorMsg: string) => void
): Promise<Response> {
  // Check online status first
  if (!navigator.onLine) {
    throw new Error("offline");
  }

  let attempt = 0;
  while (true) {
    try {
      const response = await fetch(url, options);
      
      // If server returns rate-limit or temporary overload, we treat it as retryable
      if (!response.ok && (response.status === 429 || response.status === 503 || response.status === 502) && attempt < maxRetries) {
        throw new Error(`server_error_${response.status}`);
      }
      
      return response;
    } catch (err: any) {
      attempt++;
      if (attempt > maxRetries) {
        throw err;
      }
      
      // Notify client code about retry attempt to trigger cool UI status
      if (onRetryAttempt) {
        onRetryAttempt(attempt, err.message || "Unknown error");
      }
      
      // Cooldown delay with progressive/exponential backoff: 1.5s, 4.0s
      const delayMs = attempt === 1 ? 1500 : 4000;
      await delay(delayMs);
    }
  }
}

