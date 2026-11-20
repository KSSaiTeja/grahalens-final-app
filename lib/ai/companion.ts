/**
 * Lens companion — grounded chat turns (PLAN §1 step 8).
 * Groq when available; ungrounded LLM copy withheld; no key → quieter + dasha.
 * Persists user + assistant messages via ChatStore.
 */

import type { ChatStore } from "@/lib/ai/chat-api";
import { quietLensFallback } from "@/lib/ai/fallbacks";
import {
  chatCompletion,
  GROQ_MODEL_DEFAULT,
  type ChatMessage as GroqMessage,
  type GroqChatClient,
} from "@/lib/ai/groq";
import {
  collectPlacementFacts,
  groundText,
  type GroundingResult,
  type PlacementFact,
} from "@/lib/ai/grounding";
import {
  computeDasha,
  currentDasha,
  type CurrentDasha,
} from "@/lib/ephemeris/dasha";
import { RASI_LABELS } from "@/lib/ephemeris/constants";
import type { NatalChart } from "@/lib/ephemeris/types";
import { computeTransits } from "@/lib/ephemeris/transits";
import type { ChatMessage, ChatThread, Memory } from "@/lib/types/db";

async function defaultChatStore(): Promise<ChatStore> {
  const { resolveChatStore } = await import("@/lib/lens/session");
  return resolveChatStore();
}

export type CompanionSource = "groq" | "fallback";

export type CompanionTurn = {
  thread: ChatThread;
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
  text: string;
  source: CompanionSource;
  /** Always true for returned text — ungrounded copy is never shipped. */
  grounded: true;
  grounding: GroundingResult;
  model: string | null;
};

export type CompanionMemory = Pick<Memory, "body" | "salience">;

export type CompanionTurnOptions = {
  userId: string;
  natal: NatalChart;
  /** User utterance for this turn. */
  content: string;
  /** Existing thread; omitted → create from first line. */
  threadId?: string;
  /** Instant for transit facts + dasha (defaults to now). */
  at?: Date;
  /** Retrieved memories (caller uses lib/memory). Top by salience. */
  memories?: ReadonlyArray<CompanionMemory>;
  /** Injected Groq stub for tests. */
  client?: GroqChatClient;
  /** Skip live Groq even if key present (force quieter L2). */
  forceFallback?: boolean;
  /** Injected persistence (defaults to Supabase). */
  store?: ChatStore;
};

const SYSTEM_PROMPT = [
  "You are Lens, Grahalens' observatory companion (BRAND-BOOK §05).",
  "Reply in 2–4 short paragraphs max. Calm, precise, adult — never snark, guru, fear, or emoji.",
  "Vocabulary: clarity, pressure, friction, opening, ribbon, window, lens.",
  "You may offer one gentle follow-up question at most.",
  "STRICT: You may only cite graha placements listed under ALLOWED PLACEMENTS.",
  "Do not invent signs, houses, or nakshatras. If unsure, omit the placement cite.",
  "Use MEMORIES only as soft context — never invent facts not present there or in placements.",
  "Return plain text only — no JSON, no markdown fences.",
].join("\n");

const MAX_HISTORY = 12;
const MAX_MEMORIES = 8;

function factsBlock(facts: readonly PlacementFact[]): string {
  return facts
    .map((f) => {
      const sign = RASI_LABELS[f.sign];
      return `- ${f.role} ${f.body}: ${sign}, house ${f.house}, ${f.nakshatra}`;
    })
    .join("\n");
}

function memoriesBlock(
  memories: ReadonlyArray<CompanionMemory>,
): string {
  if (memories.length === 0) return "(none)";
  return [...memories]
    .sort((a, b) => b.salience - a.salience)
    .slice(0, MAX_MEMORIES)
    .map((m) => `- ${m.body}`)
    .join("\n");
}

function resolveDasha(natal: NatalChart, at: Date): CurrentDasha {
  return currentDasha(computeDasha(natal), at);
}

function titleFromContent(content: string): string {
  const line = content.trim().split(/\n/)[0] ?? "Lens";
  return line.length > 60 ? `${line.slice(0, 57)}…` : line || "Lens";
}

function historyToGroq(
  messages: readonly ChatMessage[],
): GroqMessage[] {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .slice(-MAX_HISTORY)
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));
}

async function ensureThread(
  options: CompanionTurnOptions,
  store: ChatStore,
  content: string,
): Promise<ChatThread> {
  if (options.threadId) {
    const existing = await store.getThread(options.userId, options.threadId);
    if (!existing) throw new Error("Chat thread not found");
    return existing;
  }
  return store.createThread(options.userId, {
    title: titleFromContent(content),
  });
}

async function persistAssistant(args: {
  options: CompanionTurnOptions;
  store: ChatStore;
  thread: ChatThread;
  userMessage: ChatMessage;
  text: string;
  source: CompanionSource;
  grounding: GroundingResult;
  model: string | null;
}): Promise<CompanionTurn> {
  const assistantMessage = await args.store.appendMessage(args.thread.id, {
    role: "assistant",
    content: args.text,
    grounded: true,
  });
  const thread = await args.store.touchThread(
    args.options.userId,
    args.thread.id,
  );

  return {
    thread,
    userMessage: args.userMessage,
    assistantMessage,
    text: args.text,
    source: args.source,
    grounded: true,
    grounding: args.grounding,
    model: args.model,
  };
}

/**
 * One grounded companion turn: persist user → reply → persist assistant.
 */
export async function sendCompanionTurn(
  options: CompanionTurnOptions,
): Promise<CompanionTurn> {
  const store = options.store ?? (await defaultChatStore());
  const at = options.at ?? new Date();
  const content = options.content.trim();
  if (!content) throw new Error("Message content is required");

  const transit = computeTransits(options.natal, at);
  const facts = collectPlacementFacts(options.natal, transit);
  const dasha = resolveDasha(options.natal, at);

  let fallbackText = quietLensFallback({ dasha });
  let fallbackGround = groundText(fallbackText, facts);
  if (!fallbackGround.ok) {
    fallbackText = quietLensFallback();
    fallbackGround = groundText(fallbackText, facts);
  }

  const thread = await ensureThread(options, store, content);

  const userMessage = await store.appendMessage(thread.id, {
    role: "user",
    content,
    grounded: false,
  });
  await store.touchThread(options.userId, thread.id);

  const shipFallback = () =>
    persistAssistant({
      options,
      store,
      thread,
      userMessage,
      text: fallbackText,
      source: "fallback",
      grounding: fallbackGround,
      model: null,
    });

  if (options.forceFallback) {
    return shipFallback();
  }

  const prior = await store.listMessages(thread.id);
  const history = historyToGroq(
    prior.filter((m) => m.id !== userMessage.id),
  );

  const userPrompt = [
    "ALLOWED PLACEMENTS (natal + transit):",
    factsBlock(facts),
    "",
    `Current dasha ribbon: ${dasha.maha.lord} / ${dasha.antar.lord}`,
    "",
    "MEMORIES:",
    memoriesBlock(options.memories ?? []),
    "",
    "Reply to the user now.",
  ].join("\n");

  const llm = await chatCompletion({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
      ...history,
      { role: "user", content },
    ],
    client: options.client,
    model: GROQ_MODEL_DEFAULT,
    temperature: 0.45,
    maxTokens: 420,
  });

  if (!llm) {
    return shipFallback();
  }

  const grounding = groundText(llm, facts);
  if (!grounding.ok) {
    return shipFallback();
  }

  return persistAssistant({
    options,
    store,
    thread,
    userMessage,
    text: llm,
    source: "groq",
    grounding,
    model: GROQ_MODEL_DEFAULT,
  });
}

/** Load messages for a thread (Prompt 19 UI). */
export async function loadCompanionThread(
  userId: string,
  threadId: string,
  store?: ChatStore,
): Promise<{ thread: ChatThread; messages: ChatMessage[] }> {
  const resolved = store ?? (await defaultChatStore());
  const thread = await resolved.getThread(userId, threadId);
  if (!thread) throw new Error("Chat thread not found");
  const messages = await resolved.listMessages(threadId);
  return { thread, messages };
}
