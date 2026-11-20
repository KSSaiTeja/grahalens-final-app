/**
 * Groq client — thin wrapper (PLAN §1 step 6).
 * No GROQ_API_KEY → callers use deterministic fallbacks (BRAND §11 L2).
 */

import Groq from "groq-sdk";

/** Default model for short sky / Lens notes. */
export const GROQ_MODEL_FAST = "llama-3.1-8b-instant";

/** Heavier model for longer companion turns (Prompt 18). */
export const GROQ_MODEL_DEFAULT = "llama-3.3-70b-versatile";

const DEFAULT_TIMEOUT_MS = 12_000;

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

/**
 * Narrow surface so tests can inject a stub without the full SDK.
 */
export type GroqChatClient = {
  chat: {
    completions: {
      create(body: Record<string, unknown>): Promise<{
        choices: { message: { content: string | null } }[];
      }>;
    };
  };
};

export type ChatCompletionParams = {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  /** Injected in tests. */
  client?: GroqChatClient;
};

export class GroqUnavailableError extends Error {
  constructor(message = "GROQ_API_KEY is not set") {
    super(message);
    this.name = "GroqUnavailableError";
  }
}

/**
 * Resolve Groq API key.
 * Expo Go / client bundles only inline `EXPO_PUBLIC_*` — bare `GROQ_API_KEY`
 * works in Node/Jest but is invisible on device unless also published.
 */
export function resolveGroqApiKey(): string | null {
  const candidates = [
    process.env.EXPO_PUBLIC_GROQ_API_KEY,
    process.env.GROQ_API_KEY,
  ];
  for (const raw of candidates) {
    if (typeof raw === "string" && raw.trim().length > 0) {
      return raw.trim();
    }
  }
  return null;
}

/** True when a non-empty API key is present in the environment. */
export function hasGroqKey(): boolean {
  return resolveGroqApiKey() != null;
}

/**
 * Build a Groq SDK client, or null when no key (honest offline / L2).
 * Injected `client` always wins.
 */
export function getGroqClient(
  injected?: GroqChatClient,
): GroqChatClient | null {
  if (injected) return injected;
  const apiKey = resolveGroqApiKey();
  if (!apiKey) return null;
  return new Groq({
    apiKey,
    maxRetries: 0,
  }) as unknown as GroqChatClient;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(
      () => reject(new Error(`Groq timed out after ${ms}ms`)),
      ms,
    );
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timer !== undefined) clearTimeout(timer);
  });
}

/**
 * Chat completion. Returns null when no key / empty content / failure —
 * never throws for missing key (callers fall back).
 */
export async function chatCompletion(
  params: ChatCompletionParams,
): Promise<string | null> {
  const client = getGroqClient(params.client);
  if (!client) return null;

  const model = params.model ?? GROQ_MODEL_FAST;
  const timeoutMs = params.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  try {
    const res = await withTimeout(
      client.chat.completions.create({
        model,
        messages: params.messages,
        temperature: params.temperature ?? 0.4,
        max_tokens: params.maxTokens ?? 220,
      }),
      timeoutMs,
    );
    const content = res.choices[0]?.message?.content;
    if (typeof content !== "string") return null;
    const trimmed = content.trim();
    return trimmed.length > 0 ? trimmed : null;
  } catch {
    return null;
  }
}
