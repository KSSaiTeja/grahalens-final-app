/**
 * On-device BondStore — guest / missing Supabase.
 * Synastry payload stored beside the bond (synastry_cache shape).
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

import type { BondRecord, BondStore, CreateBondInput } from "@/lib/bonds/api";

export const BONDS_STORAGE_KEY = "grahalens:bonds:v1";

type Snapshot = {
  bonds: BondRecord[];
  seq: number;
};

function emptySnapshot(): Snapshot {
  return { bonds: [], seq: 0 };
}

export type LocalBondStore = BondStore & {
  clearAll(): Promise<void>;
};

export function createLocalBondStore(
  storage: Pick<
    typeof AsyncStorage,
    "getItem" | "setItem" | "removeItem"
  > = AsyncStorage,
): LocalBondStore {
  let snapshot = emptySnapshot();
  let hydrate: Promise<void> | null = null;

  async function ensureLoaded(): Promise<void> {
    if (!hydrate) {
      hydrate = (async () => {
        try {
          const raw = await storage.getItem(BONDS_STORAGE_KEY);
          if (!raw) return;
          const parsed = JSON.parse(raw) as Snapshot;
          if (Array.isArray(parsed.bonds) && typeof parsed.seq === "number") {
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
    await storage.setItem(BONDS_STORAGE_KEY, JSON.stringify(snapshot));
  }

  function nextId(): string {
    snapshot.seq += 1;
    return `bond-${snapshot.seq}`;
  }

  return {
    async clearAll() {
      snapshot = emptySnapshot();
      hydrate = Promise.resolve();
      await storage.removeItem(BONDS_STORAGE_KEY);
    },

    async list(userId) {
      await ensureLoaded();
      return snapshot.bonds
        .filter((b) => b.userId === userId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },

    async get(userId, bondId) {
      await ensureLoaded();
      return (
        snapshot.bonds.find((b) => b.id === bondId && b.userId === userId) ??
        null
      );
    },

    async create(userId, input: CreateBondInput) {
      await ensureLoaded();
      const bond: BondRecord = {
        id: nextId(),
        userId,
        label: input.label,
        createdAt: new Date().toISOString(),
        theirBirth: input.theirBirth,
        theirNatal: input.theirNatal,
        synastry: input.synastry,
      };
      snapshot.bonds.push(bond);
      await persist();
      return bond;
    },

    async remove(userId, bondId) {
      await ensureLoaded();
      const before = snapshot.bonds.length;
      snapshot.bonds = snapshot.bonds.filter(
        (b) => !(b.id === bondId && b.userId === userId),
      );
      if (snapshot.bonds.length === before) {
        throw new Error("Bond not found");
      }
      await persist();
    },
  };
}

export const localBondStore = createLocalBondStore();
