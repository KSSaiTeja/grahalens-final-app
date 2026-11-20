import { RASI_IDS, RASI_LABELS } from '@/lib/ephemeris/constants';
import { normalizeDegrees } from '@/lib/ephemeris/math';

function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

export type Dms = {
  degrees: number;
  minutes: number;
  seconds: number;
};

/** Split a non-negative degree measure into tabular DMS parts. */
export function toDms(deg: number): Dms {
  const absolute = Math.abs(deg);
  let degrees = Math.floor(absolute);
  let minutesFloat = (absolute - degrees) * 60;
  let minutes = Math.floor(minutesFloat);
  let seconds = Math.round((minutesFloat - minutes) * 60);
  if (seconds === 60) {
    seconds = 0;
    minutes += 1;
  }
  if (minutes === 60) {
    minutes = 0;
    degrees += 1;
  }
  return { degrees, minutes, seconds };
}

/**
 * Tabular DMS for mono display — zero-padded, no sign name.
 * Example: `08°16′42″`
 */
export function formatDms(deg: number): string {
  const { degrees, minutes, seconds } = toDms(deg);
  return `${pad2(degrees)}°${pad2(minutes)}′${pad2(seconds)}″`;
}

/**
 * Full ecliptic longitude with sign label + tabular degree-in-sign.
 * Example: `Leo 28°16′42″`
 */
export function formatLongitude(lon: number): string {
  const n = normalizeDegrees(lon);
  const signIndex = Math.floor(n / 30) % 12;
  const inSign = n % 30;
  const rasi = RASI_IDS[signIndex]!;
  return `${RASI_LABELS[rasi]} ${formatDms(inSign)}`;
}

/** Degree-in-sign only (already 0–30). */
export function formatDegreeInSign(degreeInSign: number): string {
  return formatDms(degreeInSign);
}
