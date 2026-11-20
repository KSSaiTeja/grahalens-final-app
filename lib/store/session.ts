/**
 * Zustand lane — session / guest identity (PLAN §2).
 * Never store ephemeris here; chart presence is a boolean flag only.
 */
import { create } from "zustand";

export type SessionMode = "anonymous" | "guest" | "authenticated";

export type SessionUser = {
  id: string;
  email: string | null;
};

type SessionStore = {
  hydrated: boolean;
  mode: SessionMode;
  user: SessionUser | null;
  isGuest: boolean;
  hasChart: boolean;
  hasSeenWelcome: boolean;
  skippedWelcomePaywall: boolean;
  setHydrated: (hydrated: boolean) => void;
  setFromLocal: (flags: {
    isGuest: boolean;
    hasChart: boolean;
    hasSeenWelcome: boolean;
    skippedWelcomePaywall: boolean;
  }) => void;
  setAuthenticated: (user: SessionUser) => void;
  setGuest: () => void;
  setHasChart: (hasChart: boolean) => void;
  setHasSeenWelcome: (seen: boolean) => void;
  setSkippedWelcomePaywall: (skipped: boolean) => void;
  clearSession: () => void;
};

export const useSessionStore = create<SessionStore>((set) => ({
  hydrated: false,
  mode: "anonymous",
  user: null,
  isGuest: false,
  hasChart: false,
  hasSeenWelcome: false,
  skippedWelcomePaywall: false,

  setHydrated: (hydrated) => set({ hydrated }),

  setFromLocal: ({
    isGuest,
    hasChart,
    hasSeenWelcome,
    skippedWelcomePaywall,
  }) =>
    set((s) => ({
      isGuest,
      hasChart,
      hasSeenWelcome,
      skippedWelcomePaywall,
      // Prefer authenticated if already set from Supabase; else guest/anonymous
      mode:
        s.mode === "authenticated"
          ? "authenticated"
          : isGuest
            ? "guest"
            : "anonymous",
    })),

  setAuthenticated: (user) =>
    set({
      mode: "authenticated",
      user,
      isGuest: false,
    }),

  setGuest: () =>
    set({
      mode: "guest",
      isGuest: true,
      user: null,
    }),

  setHasChart: (hasChart) => set({ hasChart }),

  setHasSeenWelcome: (hasSeenWelcome) => set({ hasSeenWelcome }),

  setSkippedWelcomePaywall: (skippedWelcomePaywall) =>
    set({ skippedWelcomePaywall }),

  clearSession: () =>
    set({
      mode: "anonymous",
      user: null,
      isGuest: false,
      // keep hasChart / welcome / paywall skip — local observatory may still exist
    }),
}));
