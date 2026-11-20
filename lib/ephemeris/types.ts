/**
 * Ephemeris shared types — lowercase GrahaId placements (Prompt 04+).
 * Do not switch to PascalCase graha fields; sky/AI modules depend on `id`.
 */

import type { GrahaId, NakshatraName, RasiId } from './constants';
import { CHART_SYSTEM } from './constants';

export type NakshatraPlacement = {
  index: number; // 0–26
  name: NakshatraName;
  pada: number; // 1–4
  degreeInNakshatra: number; // 0–13.333…
};

export type BodyPlacement = {
  id: GrahaId | 'lagna';
  /** Sidereal ecliptic longitude degrees [0, 360). */
  longitude: number;
  /** Ecliptic latitude degrees (0 for lagna / nodes). */
  latitude: number;
  sign: RasiId;
  signIndex: number; // 0–11
  /** Degrees within sign [0, 30). */
  degreeInSign: number;
  /** Whole-sign house 1–12 from Lagna. */
  house: number;
  retrograde: boolean;
  nakshatra: NakshatraPlacement;
};

export type NatalBirthInput = {
  /** ISO-8601 instant (UTC or offset). Calendar date read in `tz` when time unknown. */
  birthAt: string;
  lat: number;
  lng: number;
  /** IANA timezone, e.g. Asia/Kolkata. */
  tz: string;
  /** When true, compute at local noon and flag lagnaApproximate. */
  timeUnknown?: boolean;
};

export type NatalChart = {
  system: typeof CHART_SYSTEM;
  ayanamsa: number;
  lagnaApproximate: boolean;
  /** UTC ISO used for computation. */
  birthAt: string;
  lat: number;
  lng: number;
  tz: string;
  /** Lagna + 9 grahas. */
  placements: BodyPlacement[];
};

export function getPlacement(
  chart: Pick<NatalChart, 'placements'>,
  id: GrahaId | 'lagna',
): BodyPlacement {
  const found = chart.placements.find((p) => p.id === id);
  if (!found) {
    throw new Error(`Placement missing: ${id}`);
  }
  return found;
}

/** @deprecated Prefer NatalBirthInput. */
export type BirthInput = NatalBirthInput;
