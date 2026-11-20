/**
 * Zustand entitlement snapshot — PLAN §2 client-truth lane.
 * RevenueCat / mockStore remain source of truth; this is a cache for UI.
 */

import { create } from "zustand";

import type { EntitlementSnapshot, PurchasePhase } from "@/lib/billing/types";
import { EMPTY_ENTITLEMENT } from "@/lib/billing/types";

type EntitlementStore = EntitlementSnapshot & {
  applySnapshot: (
    snap: Partial<EntitlementSnapshot> &
      Pick<EntitlementSnapshot, "isPrivate" | "hydrated">,
  ) => void;
  setPhase: (phase: PurchasePhase, lastError?: string | null) => void;
  reset: () => void;
};

export const useEntitlementStore = create<EntitlementStore>((set) => ({
  ...EMPTY_ENTITLEMENT,

  applySnapshot: (snap) =>
    set((s) => ({
      ...s,
      ...snap,
      hydrated: true,
    })),

  setPhase: (phase, lastError = null) =>
    set({
      phase,
      lastError: lastError ?? null,
    }),

  reset: () => set({ ...EMPTY_ENTITLEMENT }),
}));
