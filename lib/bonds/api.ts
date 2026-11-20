/**
 * Bonds API — list / create / get / remove with free-tier gate (PRD F13).
 * Persistence is Swapable (local AsyncStorage now; Supabase later).
 */

import type { StoredBirth } from "@/lib/store/chart";
import type { NatalChart } from "@/lib/ephemeris/types";
import type { SynastryCachePayload } from "@/lib/bonds/synastry";

export const FREE_BOND_LIMIT = 1;

export type BondRecord = {
  id: string;
  userId: string;
  label: string;
  createdAt: string;
  theirBirth: StoredBirth;
  theirNatal: NatalChart;
  synastry: SynastryCachePayload;
};

export type CreateBondInput = {
  label: string;
  theirBirth: StoredBirth;
  theirNatal: NatalChart;
  synastry: SynastryCachePayload;
};

export interface BondStore {
  list(userId: string): Promise<BondRecord[]>;
  get(userId: string, bondId: string): Promise<BondRecord | null>;
  create(userId: string, input: CreateBondInput): Promise<BondRecord>;
  remove(userId: string, bondId: string): Promise<void>;
}

export function canAddBond(count: number, isPrivate: boolean): boolean {
  if (isPrivate) return true;
  return count < FREE_BOND_LIMIT;
}

function normalizeLabel(label: string): string {
  const normalized = label.trim();
  if (!normalized) throw new Error("Bond name is required");
  if (normalized.length > 48) {
    throw new Error("Bond name must be 48 characters or fewer");
  }
  return normalized;
}

export function createBondApi(store: BondStore) {
  return {
    list(userId: string): Promise<BondRecord[]> {
      return store.list(userId);
    },

    get(userId: string, bondId: string): Promise<BondRecord | null> {
      return store.get(userId, bondId);
    },

    async create(userId: string, input: CreateBondInput): Promise<BondRecord> {
      return store.create(userId, {
        label: normalizeLabel(input.label),
        theirBirth: input.theirBirth,
        theirNatal: input.theirNatal,
        synastry: input.synastry,
      });
    },

    remove(userId: string, bondId: string): Promise<void> {
      return store.remove(userId, bondId);
    },
  };
}

export type BondApi = ReturnType<typeof createBondApi>;
