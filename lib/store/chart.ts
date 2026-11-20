/**
 * Chart / birth client store.
 * Birth is source of truth; natal is a session memo after compute
 * (PLAN: recompute from birth — memo is not authoritative).
 */
import { create } from "zustand";

import type { NatalBirthInput, NatalChart } from "@/lib/ephemeris/types";

export type StoredBirth = NatalBirthInput & {
  /** Civil date YYYY-MM-DD (onboarding display / edit). */
  date: string;
  /** Civil time HH:mm or null when unknown. */
  time: string | null;
  placeLabel: string;
};

type ChartStore = {
  birth: StoredBirth | null;
  /** Session memo of last compute — Prompt 11 verify: chart payload in store. */
  natal: NatalChart | null;
  setComputed: (birth: StoredBirth, natal: NatalChart) => void;
  hydrate: (birth: StoredBirth | null, natal: NatalChart | null) => void;
  clear: () => void;
};

export const useChartStore = create<ChartStore>((set) => ({
  birth: null,
  natal: null,
  setComputed: (birth, natal) => set({ birth, natal }),
  hydrate: (birth, natal) => set({ birth, natal }),
  clear: () => set({ birth: null, natal: null }),
}));
