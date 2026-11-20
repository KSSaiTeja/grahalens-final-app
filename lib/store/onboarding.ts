/**
 * Onboarding draft — Zustand lane (PLAN §2).
 * Lives until confirm/compute; never a substitute for persisted birth.
 */
import { create } from "zustand";

export type OnboardingPlace = {
  label: string;
  lat: number;
  lng: number;
  tz: string;
};

/** `settings-recompute` returns to sky after compute instead of soft paywall. */
export type OnboardingSource = "fresh" | "settings-recompute";

type OnboardingDraft = {
  date: string | null; // YYYY-MM-DD
  time: string | null; // HH:mm
  timeUnknown: boolean;
  place: OnboardingPlace | null;
  source: OnboardingSource;
  setDate: (date: string) => void;
  setTime: (time: string | null, timeUnknown: boolean) => void;
  setPlace: (place: OnboardingPlace) => void;
  setSource: (source: OnboardingSource) => void;
  reset: () => void;
};

const initial = {
  date: null as string | null,
  time: null as string | null,
  timeUnknown: false,
  place: null as OnboardingPlace | null,
  source: "fresh" as OnboardingSource,
};

export const useOnboardingStore = create<OnboardingDraft>((set) => ({
  ...initial,
  setDate: (date) => set({ date }),
  setTime: (time, timeUnknown) => set({ time, timeUnknown }),
  setPlace: (place) => set({ place }),
  setSource: (source) => set({ source }),
  reset: () => set({ ...initial }),
}));
