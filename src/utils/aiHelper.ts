/**
 * FlowMind AI — Production-grade AI Reliability & Resilience Helper
 * 
 * Smart retry logic (no retry on 429), lightweight offline fallback,
 * and clean error mapping for the frontend.
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

// Map raw API errors into clean, supportive FlowMind messages
export function mapAIError(errorMsg: string): string {
  const normalized = errorMsg.toLowerCase();
  
  if (normalized.includes("offline") || normalized.includes("network") || normalized.includes("failed to fetch")) {
    return "Offline Mode Active: Your network connection has been interrupted. Your request is safely queued and will automatically sync once your connection is restored.";
  }
  
  if (normalized.includes("api_key") || normalized.includes("key is not defined") || normalized.includes("invalid key")) {
    return "API Configuration Required: The AI service is not authorized. Please access the Settings page and verify that your GEMINI_API_KEY is correctly configured.";
  }
  
  if (normalized.includes("429") || normalized.includes("quota") || normalized.includes("rate limit") || normalized.includes("exhausted")) {
    return "AI capacity temporarily exhausted. Please retry in about a minute.";
  }

  if (normalized.includes("503") || normalized.includes("unavailable") || normalized.includes("overloaded")) {
    return "Service Temporarily Busy: FlowMind AI is experiencing high demand. Please wait a moment and try again.";
  }
  
  if (normalized.includes("timeout") || normalized.includes("timed out")) {
    return "Request Timeout: The AI service is taking longer than expected. Please try again.";
  }

  // General fallback
  return "AI temporarily unavailable. Please retry shortly.";
}

/**
 * Lightweight static fallback — no large generated responses.
 */
export function getLocalFallbackResponse(): string {
  return "AI temporarily unavailable. Please retry shortly.";
}

/**
 * Determine if an error is a quota/rate-limit error (429).
 */
export function isQuotaError(errorMsg: string): boolean {
  const normalized = errorMsg.toLowerCase();
  return normalized.includes("429") || normalized.includes("quota") || normalized.includes("exhausted") || normalized.includes("rate limit");
}

/**
 * Determine if an error is retryable.
 * Only retry: 503, ECONNRESET, ETIMEDOUT
 * Do NOT retry: 429, 401, 404
 */
function isRetryableError(status: number | null, errorMsg: string): boolean {
  const normalized = errorMsg.toLowerCase();

  // Never retry quota / auth / model errors
  if (normalized.includes("429") || normalized.includes("quota") || normalized.includes("exhausted")) return false;
  if (normalized.includes("401") || normalized.includes("api_key") || normalized.includes("invalid key")) return false;
  if (normalized.includes("404") || normalized.includes("model")) return false;

  // Retry on transient errors
  if (status === 503) return true;
  if (normalized.includes("econnreset") || normalized.includes("etimedout")) return true;
  if (normalized.includes("503") || normalized.includes("unavailable")) return true;

  return false;
}

/**
 * Executes a fetch with smart retry logic.
 * - Max 1 retry
 * - 5 second exponential backoff
 * - Only retries on 503, ECONNRESET, ETIMEDOUT
 * - Never retries 429 or auth errors
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 1,
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
      
      // If server returns an error, check if retryable
      if (!response.ok && attempt < maxRetries) {
        const errorMsg = `server_error_${response.status}`;
        if (isRetryableError(response.status, errorMsg)) {
          throw new Error(errorMsg);
        }
      }
      
      return response;
    } catch (err: any) {
      attempt++;
      const errorMsg = err.message || "Unknown error";

      // Don't retry non-retryable errors
      if (!isRetryableError(null, errorMsg) || attempt > maxRetries) {
        throw err;
      }
      
      // Notify client code about retry attempt
      if (onRetryAttempt) {
        onRetryAttempt(attempt, errorMsg);
      }
      
      // Exponential backoff: 5 seconds
      const delayMs = 5000 * attempt;
      console.log(`[Gemini Retry] Attempt ${attempt}/${maxRetries}, waiting ${delayMs}ms`);
      await delay(delayMs);
    }
  }
}
