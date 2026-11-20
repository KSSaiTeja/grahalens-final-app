/**
 * Bond add-wizard draft — Zustand lane (PLAN §2).
 * Cleared after successful create; never a substitute for persisted bond.
 */
import { create } from "zustand";

import type { OnboardingPlace } from "@/lib/store/onboarding";

type BondDraft = {
  label: string | null;
  date: string | null;
  time: string | null;
  timeUnknown: boolean;
  place: OnboardingPlace | null;
  setLabel: (label: string) => void;
  setDate: (date: string) => void;
  setTime: (time: string | null, timeUnknown: boolean) => void;
  setPlace: (place: OnboardingPlace) => void;
  reset: () => void;
};

const initial = {
  label: null as string | null,
  date: null as string | null,
  time: null as string | null,
  timeUnknown: false,
  place: null as OnboardingPlace | null,
};

export const useBondDraftStore = create<BondDraft>((set) => ({
  ...initial,
  setLabel: (label) => set({ label }),
  setDate: (date) => set({ date }),
  setTime: (time, timeUnknown) => set({ time, timeUnknown }),
  setPlace: (place) => set({ place }),
  reset: () => set({ ...initial }),
}));
