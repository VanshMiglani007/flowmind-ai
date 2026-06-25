/**
 * FlowMind AI — Centralized Gemini Request Queue
 * 
 * Ensures at most 1 active Gemini API call at a time with a minimum
 * 3-second cooldown between requests. Prevents parallel calls and
 * burst-induced quota exhaustion on the free tier.
 */

const MAX_QUEUE_DEPTH = 10;
const COOLDOWN_MS = 3000; // 3 seconds between requests

interface QueueEntry<T> {
  fn: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: any) => void;
  enqueuedAt: number;
}

let isProcessing = false;
let lastRequestTime = 0;
const queue: QueueEntry<any>[] = [];

function getQueueSize(): number {
  return queue.length;
}

async function processQueue(): Promise<void> {
  if (isProcessing) return;
  if (queue.length === 0) return;

  isProcessing = true;

  while (queue.length > 0) {
    const entry = queue.shift()!;

    // Enforce cooldown
    const elapsed = Date.now() - lastRequestTime;
    if (elapsed < COOLDOWN_MS) {
      const waitTime = COOLDOWN_MS - elapsed;
      console.log(`[Gemini Cooldown] Waiting ${waitTime}ms before next request`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    const startTime = Date.now();
    lastRequestTime = Date.now();

    try {
      console.log(`[Gemini Request Started] Queue remaining: ${queue.length}`);
      const result = await entry.fn();
      const duration = Date.now() - startTime;
      console.log(`[Gemini Success] Response time: ${duration}ms | Queue remaining: ${queue.length}`);
      entry.resolve(result);
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[Gemini Error] After ${duration}ms:`, (error as Error).message);
      entry.reject(error);
    }
  }

  isProcessing = false;
}

/**
 * Enqueue a Gemini API call. The function will be executed when all
 * preceding requests have completed and the cooldown has elapsed.
 * 
 * Rejects immediately if the queue is full (> MAX_QUEUE_DEPTH).
 */
export function enqueueGeminiRequest<T>(fn: () => Promise<T>): Promise<T> {
  if (queue.length >= MAX_QUEUE_DEPTH) {
    console.warn(`[Gemini Rate Limited] Queue full (${MAX_QUEUE_DEPTH} pending). Rejecting request.`);
    return Promise.reject(new Error(
      "Too many pending AI requests. Please wait a moment before trying again."
    ));
  }

  return new Promise<T>((resolve, reject) => {
    console.log(`[Gemini Queued] Position: ${queue.length + 1} | Queue size: ${queue.length + 1}`);
    queue.push({ fn, resolve, reject, enqueuedAt: Date.now() });
    processQueue();
  });
}

export { getQueueSize };
