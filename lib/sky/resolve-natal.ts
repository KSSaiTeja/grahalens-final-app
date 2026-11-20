/**
 * Resolve natal for Sky screens — store preferred, Chart A fixture fallback
 * (same verify path as Chart C1).
 */

import { useMemo } from "react";

import chartA from "@/fixtures/chart-a.json";
import { computeNatal } from "@/lib/ephemeris/natal";
import type { NatalBirthInput, NatalChart } from "@/lib/ephemeris/types";
import { useChartStore } from "@/lib/store/chart";

export type ResolvedNatal = {
  natal: NatalChart;
  usingFixture: boolean;
};

export function resolveNatalFromStore(
  stored: NatalChart | null,
): ResolvedNatal {
  if (stored) return { natal: stored, usingFixture: false };
  const natal = computeNatal(chartA.input as NatalBirthInput);
  return { natal, usingFixture: true };
}

/** Hook: chart store → natal (fixture when empty). */
export function useResolvedNatal(): ResolvedNatal {
  const stored = useChartStore((s) => s.natal);
  return useMemo(() => resolveNatalFromStore(stored), [stored]);
}
