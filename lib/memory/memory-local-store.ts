/**
 * On-device MemoryStore — guest / missing Supabase.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

import type { MemoryStore, UpdateMemoryInput } from "@/lib/memory/api";
import type { Memory } from "@/lib/types/db";

export const MEMORIES_STORAGE_KEY = "grahalens:memories:v1";

type Snapshot = {
  memories: Memory[];
  seq: number;
};

function emptySnapshot(): Snapshot {
  return { memories: [], seq: 0 };
}

export type LocalMemoryStore = MemoryStore & {
  clearAll(): Promise<void>;
};

export function createLocalMemoryStore(
  storage: Pick<
    typeof AsyncStorage,
    "getItem" | "setItem" | "removeItem"
  > = AsyncStorage,
): LocalMemoryStore {
  let snapshot = emptySnapshot();
  let hydrate: Promise<void> | null = null;

  async function ensureLoaded(): Promise<void> {
    if (!hydrate) {
      hydrate = (async () => {
        try {
          const raw = await storage.getItem(MEMORIES_STORAGE_KEY);
          if (!raw) return;
          const parsed = JSON.parse(raw) as Snapshot;
          if (Array.isArray(parsed.memories) && typeof parsed.seq === "number") {
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
    await storage.setItem(MEMORIES_STORAGE_KEY, JSON.stringify(snapshot));
  }

  function nextId(): string {
    snapshot.seq += 1;
    return `mem-${snapshot.seq}`;
  }

  return {
    async clearAll() {
      snapshot = emptySnapshot();
      hydrate = Promise.resolve();
      await storage.removeItem(MEMORIES_STORAGE_KEY);
    },

    async list(userId) {
      await ensureLoaded();
      return snapshot.memories
        .filter((m) => m.user_id === userId)
        .sort((a, b) => {
          if (b.salience !== a.salience) return b.salience - a.salience;
          return b.created_at.localeCompare(a.created_at);
        });
    },

    async create(userId, input) {
      await ensureLoaded();
      const memory: Memory = {
        id: nextId(),
        user_id: userId,
        body: input.body,
        source: input.source,
        salience: input.salience,
        created_at: new Date().toISOString(),
      };
      snapshot.memories.push(memory);
      await persist();
      return memory;
    },

    async update(userId, memoryId, patch: UpdateMemoryInput) {
      await ensureLoaded();
      const memory = snapshot.memories.find(
        (m) => m.id === memoryId && m.user_id === userId,
      );
      if (!memory) throw new Error("Memory not found");
      if (patch.body !== undefined) memory.body = patch.body;
      if (patch.salience !== undefined) memory.salience = patch.salience;
      await persist();
      return memory;
    },

    async remove(userId, memoryId) {
      await ensureLoaded();
      const before = snapshot.memories.length;
      snapshot.memories = snapshot.memories.filter(
        (m) => !(m.id === memoryId && m.user_id === userId),
      );
      if (snapshot.memories.length === before) {
        throw new Error("Memory not found");
      }
      await persist();
    },
  };
}

export const localMemoryStore = createLocalMemoryStore();
