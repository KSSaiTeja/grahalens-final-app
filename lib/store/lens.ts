/**
 * Zustand lane — Lens orb + active thread (PLAN §2).
 * Messages/threads stay in TanStack Query + ChatStore.
 */

import { create } from "zustand";

import type { LensOrbState } from "@/components/brand/LensOrb";

type LensStore = {
  activeThreadId: string | null;
  orbState: LensOrbState;
  setActiveThreadId: (threadId: string | null) => void;
  setOrbState: (state: LensOrbState) => void;
};

export const useLensStore = create<LensStore>((set) => ({
  activeThreadId: null,
  orbState: "idle",
  setActiveThreadId: (activeThreadId) => set({ activeThreadId }),
  setOrbState: (orbState) => set({ orbState }),
}));
