/**
 * Journal API — list / get / create / update / remove (PRD F10).
 * Swapable store: local AsyncStorage now; Supabase later.
 */

import type { Json } from "@/lib/types/db";

export type JournalMood =
  | "clear"
  | "pressed"
  | "friction"
  | "open"
  | "steady";

export const JOURNAL_MOODS: readonly JournalMood[] = [
  "clear",
  "pressed",
  "friction",
  "open",
  "steady",
] as const;

export const JOURNAL_MOOD_LABELS: Record<JournalMood, string> = {
  clear: "Clear",
  pressed: "Pressed",
  friction: "Friction",
  open: "Open",
  steady: "Steady",
};

export type WeatherSnapshot = {
  date: string;
  dominant: string;
  axes: Record<string, number>;
  prompt?: string;
};

export type JournalRecord = {
  id: string;
  userId: string;
  body: string;
  mood: JournalMood | null;
  weatherSnapshot: WeatherSnapshot | null;
  dashaKey: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateJournalInput = {
  body: string;
  mood?: JournalMood | null;
  weatherSnapshot?: WeatherSnapshot | null;
  dashaKey?: string | null;
};

export type UpdateJournalInput = {
  body?: string;
  mood?: JournalMood | null;
};

export interface JournalStore {
  list(userId: string): Promise<JournalRecord[]>;
  get(userId: string, entryId: string): Promise<JournalRecord | null>;
  create(userId: string, input: CreateJournalInput): Promise<JournalRecord>;
  update(
    userId: string,
    entryId: string,
    patch: UpdateJournalInput,
  ): Promise<JournalRecord>;
  remove(userId: string, entryId: string): Promise<void>;
}

export function isJournalMood(value: string): value is JournalMood {
  return (JOURNAL_MOODS as readonly string[]).includes(value);
}

function normalizeBody(body: string): string {
  const normalized = body.trim();
  if (!normalized) throw new Error("Journal body is required");
  if (normalized.length > 8000) {
    throw new Error("Journal body must be 8000 characters or fewer");
  }
  return normalized;
}

export function weatherSnapshotToJson(
  snapshot: WeatherSnapshot | null | undefined,
): Json | null {
  if (!snapshot) return null;
  return snapshot as unknown as Json;
}

export function createJournalApi(store: JournalStore) {
  return {
    list(userId: string): Promise<JournalRecord[]> {
      return store.list(userId);
    },

    get(userId: string, entryId: string): Promise<JournalRecord | null> {
      return store.get(userId, entryId);
    },

    async create(
      userId: string,
      input: CreateJournalInput,
    ): Promise<JournalRecord> {
      return store.create(userId, {
        body: normalizeBody(input.body),
        mood: input.mood ?? null,
        weatherSnapshot: input.weatherSnapshot ?? null,
        dashaKey: input.dashaKey ?? null,
      });
    },

    async update(
      userId: string,
      entryId: string,
      input: UpdateJournalInput,
    ): Promise<JournalRecord> {
      const patch: UpdateJournalInput = {};
      if (input.body !== undefined) patch.body = normalizeBody(input.body);
      if (input.mood !== undefined) patch.mood = input.mood;
      return store.update(userId, entryId, patch);
    },

    remove(userId: string, entryId: string): Promise<void> {
      return store.remove(userId, entryId);
    },
  };
}

export type JournalApi = ReturnType<typeof createJournalApi>;
