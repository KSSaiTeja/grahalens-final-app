/**
 * On-device usage counters — guest / missing Supabase.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

import type { UsageCounterStore } from "@/lib/billing/quotas";

export const USAGE_STORAGE_KEY = "grahalens:usage:v1";

type Snapshot = Record<string, number>;

export type LocalUsageCounterStore = UsageCounterStore & {
  clearAll(): Promise<void>;
};

export function createLocalUsageCounterStore(
  storage: Pick<
    typeof AsyncStorage,
    "getItem" | "setItem" | "removeItem"
  > = AsyncStorage,
): LocalUsageCounterStore {
  let counts: Snapshot = {};
  let hydrate: Promise<void> | null = null;

  async function ensureLoaded(): Promise<void> {
    if (!hydrate) {
      hydrate = (async () => {
        try {
          const raw = await storage.getItem(USAGE_STORAGE_KEY);
          if (!raw) return;
          const parsed = JSON.parse(raw) as Snapshot;
          if (parsed && typeof parsed === "object") counts = parsed;
        } catch {
          counts = {};
        }
      })();
    }
    await hydrate;
  }

  async function persist(): Promise<void> {
    await storage.setItem(USAGE_STORAGE_KEY, JSON.stringify(counts));
  }

  function key(userId: string, day: string): string {
    return `${userId}:${day}`;
  }

  return {
    async clearAll() {
      counts = {};
      hydrate = Promise.resolve();
      await storage.removeItem(USAGE_STORAGE_KEY);
    },

    async getLensCount(userId, day) {
      await ensureLoaded();
      return counts[key(userId, day)] ?? 0;
    },

    async incrementLensCount(userId, day, limit) {
      await ensureLoaded();
      const k = key(userId, day);
      const current = counts[k] ?? 0;
      if (current >= limit) return null;
      const next = current + 1;
      counts[k] = next;
      await persist();
      return next;
    },
  };
}

export const localUsageCounterStore = createLocalUsageCounterStore();
