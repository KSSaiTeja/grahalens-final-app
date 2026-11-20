import fixture from "@/fixtures/chart-a.json";
import { createChatApi, type ChatStore } from "@/lib/ai/chat-api";
import { sendCompanionTurn } from "@/lib/ai/companion";
import { quietLensFallback } from "@/lib/ai/fallbacks";
import { groundText, collectPlacementFacts } from "@/lib/ai/grounding";
import {
  computeNatal,
  type NatalBirthInput,
} from "@/lib/ephemeris/natal";
import { computeDasha, currentDasha } from "@/lib/ephemeris/dasha";
import { computeTransits } from "@/lib/ephemeris/transits";
import type { ChatMessage, ChatThread } from "@/lib/types/db";

/** Frozen clock — same as sky / transit suite. */
const FROZEN_AT = new Date("2026-07-29T12:00:00.000Z");

class InMemoryChatStore implements ChatStore {
  threads: ChatThread[] = [];
  messages: ChatMessage[] = [];
  private seq = 0;

  private nextId(prefix: string): string {
    this.seq += 1;
    return `${prefix}-${this.seq}`;
  }

  async listThreads(userId: string): Promise<ChatThread[]> {
    return this.threads
      .filter((t) => t.user_id === userId)
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  }

  async getThread(
    userId: string,
    threadId: string,
  ): Promise<ChatThread | null> {
    return (
      this.threads.find(
        (t) => t.id === threadId && t.user_id === userId,
      ) ?? null
    );
  }

  async createThread(
    userId: string,
    input?: { title?: string },
  ): Promise<ChatThread> {
    const now = FROZEN_AT.toISOString();
    const thread: ChatThread = {
      id: this.nextId("thread"),
      user_id: userId,
      title: input?.title?.trim() || "Lens",
      updated_at: now,
      created_at: now,
    };
    this.threads.push(thread);
    return thread;
  }

  async touchThread(userId: string, threadId: string): Promise<ChatThread> {
    const thread = await this.getThread(userId, threadId);
    if (!thread) throw new Error("Chat thread not found");
    thread.updated_at = new Date(FROZEN_AT.getTime() + 1000).toISOString();
    return thread;
  }

  async listMessages(threadId: string): Promise<ChatMessage[]> {
    return this.messages
      .filter((m) => m.thread_id === threadId)
      .sort((a, b) => a.created_at.localeCompare(b.created_at));
  }

  async appendMessage(
    threadId: string,
    input: {
      role: ChatMessage["role"];
      content: string;
      grounded?: boolean;
    },
  ): Promise<ChatMessage> {
    const message: ChatMessage = {
      id: this.nextId("msg"),
      thread_id: threadId,
      role: input.role,
      content: input.content,
      grounded: input.grounded ?? false,
      created_at: FROZEN_AT.toISOString(),
    };
    this.messages.push(message);
    return message;
  }
}

describe("companion quieter fallback + dasha", () => {
  const input = fixture.input as NatalBirthInput;
  let natal: ReturnType<typeof computeNatal>;

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(FROZEN_AT);
    natal = computeNatal(input);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("quietLensFallback cites real maha/antar lords", () => {
    const dasha = currentDasha(computeDasha(natal), FROZEN_AT);
    const text = quietLensFallback({ dasha });
    const transit = computeTransits(natal, FROZEN_AT);
    const facts = collectPlacementFacts(natal, transit);

    expect(text).toMatch(/quieter mode/i);
    expect(text).toMatch(new RegExp(dasha.maha.lord, "i"));
    expect(text).toMatch(new RegExp(dasha.antar.lord, "i"));
    expect(text).toMatch(/Ribbon:/i);
    expect(groundText(text, facts).ok).toBe(true);
  });

  it("no-key / forceFallback turn persists quieter reply with real dasha", async () => {
    const prev = process.env.GROQ_API_KEY;
    const prevPublic = process.env.EXPO_PUBLIC_GROQ_API_KEY;
    delete process.env.GROQ_API_KEY;
    delete process.env.EXPO_PUBLIC_GROQ_API_KEY;

    const store = new InMemoryChatStore();
    const dasha = currentDasha(computeDasha(natal), FROZEN_AT);

    const turn = await sendCompanionTurn({
      userId: "user-1",
      natal,
      content: "What does my ribbon ask of me today?",
      at: FROZEN_AT,
      store,
      forceFallback: true,
    });

    expect(turn.source).toBe("fallback");
    expect(turn.grounded).toBe(true);
    expect(turn.grounding.ok).toBe(true);
    expect(turn.text).toMatch(/quieter mode/i);
    expect(turn.text).toMatch(new RegExp(dasha.maha.lord, "i"));
    expect(turn.text).toMatch(new RegExp(dasha.antar.lord, "i"));
    expect(turn.assistantMessage.grounded).toBe(true);

    const messages = await store.listMessages(turn.thread.id);
    expect(messages).toHaveLength(2);
    expect(messages[0]!.role).toBe("user");
    expect(messages[1]!.role).toBe("assistant");
    expect(messages[1]!.content).toBe(turn.text);

    if (prev !== undefined) process.env.GROQ_API_KEY = prev;
    else delete process.env.GROQ_API_KEY;
    if (prevPublic !== undefined) process.env.EXPO_PUBLIC_GROQ_API_KEY = prevPublic;
    else delete process.env.EXPO_PUBLIC_GROQ_API_KEY;
  });

  it("withholds invented LLM placements and ships quieter fallback", async () => {
    const store = new InMemoryChatStore();
    const fakeClient = {
      chat: {
        completions: {
          async create() {
            return {
              choices: [
                {
                  message: {
                    content:
                      "Mars in Pisces invents a storm; Moon in Capricorn too.",
                  },
                },
              ],
            };
          },
        },
      },
    };

    const dasha = currentDasha(computeDasha(natal), FROZEN_AT);
    const turn = await sendCompanionTurn({
      userId: "user-1",
      natal,
      content: "Read my chart.",
      at: FROZEN_AT,
      store,
      client: fakeClient,
    });

    expect(turn.source).toBe("fallback");
    expect(turn.grounding.ok).toBe(true);
    expect(turn.text).not.toMatch(/Mars in Pisces/i);
    expect(turn.text).toMatch(new RegExp(dasha.maha.lord, "i"));
  });

  it("persists a second turn on the same thread", async () => {
    const store = new InMemoryChatStore();
    const first = await sendCompanionTurn({
      userId: "user-1",
      natal,
      content: "First question",
      at: FROZEN_AT,
      store,
      forceFallback: true,
    });

    const second = await sendCompanionTurn({
      userId: "user-1",
      natal,
      content: "Follow-up",
      threadId: first.thread.id,
      at: FROZEN_AT,
      store,
      forceFallback: true,
    });

    expect(second.thread.id).toBe(first.thread.id);
    expect(await store.listMessages(first.thread.id)).toHaveLength(4);

    const api = createChatApi(store);
    expect(await api.listThreads("user-1")).toHaveLength(1);
  });
});
