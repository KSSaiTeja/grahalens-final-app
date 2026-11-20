/**
 * Lens starters + local store persistence (Prompt 19 verify helpers).
 */

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

import fixture from "@/fixtures/chart-a.json";
import { createLocalChatStore } from "@/lib/ai/chat-local-store";
import { sendCompanionTurn } from "@/lib/ai/companion";
import { createLocalUsageCounterStore } from "@/lib/billing/quota-local-store";
import {
  canSendLens,
  FREE_LENS_DAILY_LIMIT,
  incrementLens,
} from "@/lib/billing/quotas";
import {
  computeNatal,
  type NatalBirthInput,
} from "@/lib/ephemeris/natal";
import { chartGroundedStarters } from "@/lib/lens/starters";

const FROZEN_AT = new Date("2026-07-29T12:00:00.000Z");

describe("Lens starters are chart-grounded", () => {
  it("cites Venus / Sun / Moon signs from natal", () => {
    const natal = computeNatal(fixture.input as NatalBirthInput);
    const starters = chartGroundedStarters(natal);
    expect(starters).toHaveLength(3);
    for (const s of starters) {
      expect(s.prompt.length).toBeGreaterThan(20);
      expect(s.prompt).toMatch(/Venus|Sun|Moon/);
    }
  });
});

describe("Lens free quota gate (6th message)", () => {
  const userId = "guest-local";
  const memory = new Map<string, string>();
  const storage = {
    getItem: async (key: string) => memory.get(key) ?? null,
    setItem: async (key: string, value: string) => {
      memory.set(key, value);
    },
    removeItem: async (key: string) => {
      memory.delete(key);
    },
  };

  beforeEach(() => {
    memory.clear();
  });

  it("allows five increments then blocks the sixth", async () => {
    const store = createLocalUsageCounterStore(storage);
    const now = FROZEN_AT;

    for (let i = 0; i < FREE_LENS_DAILY_LIMIT; i += 1) {
      expect(await canSendLens(userId, { now, store })).toBe(true);
      await incrementLens(userId, { now, store });
    }

    expect(await canSendLens(userId, { now, store })).toBe(false);
  });

  it("persists threads across store instances", async () => {
    const chatA = createLocalChatStore(storage);
    const natal = computeNatal(fixture.input as NatalBirthInput);

    const turn = await sendCompanionTurn({
      userId,
      natal,
      content: "What is the quiet pressure today?",
      at: FROZEN_AT,
      forceFallback: true,
      store: chatA,
    });

    const chatB = createLocalChatStore(storage);
    const threads = await chatB.listThreads(userId);
    expect(threads.some((t) => t.id === turn.thread.id)).toBe(true);
    const messages = await chatB.listMessages(turn.thread.id);
    expect(messages.length).toBeGreaterThanOrEqual(2);
  });
});
