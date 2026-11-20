/**
 * On-device JournalStore — guest / offline (PRD: journal works offline).
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

import type {
  CreateJournalInput,
  JournalRecord,
  JournalStore,
  UpdateJournalInput,
} from "@/lib/atelier/api";

export const JOURNAL_STORAGE_KEY = "grahalens:journal:v1";

type Snapshot = {
  entries: JournalRecord[];
  seq: number;
};

function emptySnapshot(): Snapshot {
  return { entries: [], seq: 0 };
}

export type LocalJournalStore = JournalStore & {
  clearAll(): Promise<void>;
};

export function createLocalJournalStore(
  storage: Pick<
    typeof AsyncStorage,
    "getItem" | "setItem" | "removeItem"
  > = AsyncStorage,
): LocalJournalStore {
  let snapshot = emptySnapshot();
  let hydrate: Promise<void> | null = null;

  async function ensureLoaded(): Promise<void> {
    if (!hydrate) {
      hydrate = (async () => {
        try {
          const raw = await storage.getItem(JOURNAL_STORAGE_KEY);
          if (!raw) return;
          const parsed = JSON.parse(raw) as Snapshot;
          if (Array.isArray(parsed.entries) && typeof parsed.seq === "number") {
            snapshot = parsed;
          }
        } catch {
          snapshot = emptySnapshot();
        }
      })();
    }
    await hydrate;
  }

  async function persist(): Promise<void> {
    await storage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(snapshot));
  }

  function nextId(): string {
    snapshot.seq += 1;
    return `journal-${snapshot.seq}`;
  }

  return {
    async clearAll() {
      snapshot = emptySnapshot();
      hydrate = Promise.resolve();
      await storage.removeItem(JOURNAL_STORAGE_KEY);
    },

    async list(userId) {
      await ensureLoaded();
      return snapshot.entries
        .filter((e) => e.userId === userId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },

    async get(userId, entryId) {
      await ensureLoaded();
      return (
        snapshot.entries.find(
          (e) => e.id === entryId && e.userId === userId,
        ) ?? null
      );
    },

    async create(userId, input: CreateJournalInput) {
      await ensureLoaded();
      const now = new Date().toISOString();
      const entry: JournalRecord = {
        id: nextId(),
        userId,
        body: input.body,
        mood: input.mood ?? null,
        weatherSnapshot: input.weatherSnapshot ?? null,
        dashaKey: input.dashaKey ?? null,
        createdAt: now,
        updatedAt: now,
      };
      snapshot.entries.push(entry);
      await persist();
      return entry;
    },

    async update(userId, entryId, patch: UpdateJournalInput) {
      await ensureLoaded();
      const entry = snapshot.entries.find(
        (e) => e.id === entryId && e.userId === userId,
      );
      if (!entry) throw new Error("Journal entry not found");
      if (patch.body !== undefined) entry.body = patch.body;
      if (patch.mood !== undefined) entry.mood = patch.mood;
      entry.updatedAt = new Date().toISOString();
      await persist();
      return entry;
    },

    async remove(userId, entryId) {
      await ensureLoaded();
      const before = snapshot.entries.length;
      snapshot.entries = snapshot.entries.filter(
        (e) => !(e.id === entryId && e.userId === userId),
      );
      if (snapshot.entries.length === before) {
        throw new Error("Journal entry not found");
      }
      await persist();
    },
  };
}

export const localJournalStore = createLocalJournalStore();
