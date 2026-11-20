import { MakeTime, type FlexibleDateTime } from 'astronomy-engine';

/**
 * Lahiri (Chitrapaksha) ayanamsa in degrees.
 *
 * Anchored to the ICRC Lahiri constant at J2000.0 (JD 2451545.0):
 *   23.853222°
 * with Newcomb-aligned precession ≈ 50.290966″ / tropical year.
 *
 * Accurate well within the project 0.5° natal tolerance for modern dates.
 */
const LAHIRI_J2000_DEG = 23.853222;
const PRECESSION_ARCSEC_PER_YEAR = 50.290966;

export function lahiriAyanamsa(date: FlexibleDateTime): number {
  const t = MakeTime(date);
  const yearsFromJ2000 = t.tt / 365.25;
  return LAHIRI_J2000_DEG + (PRECESSION_ARCSEC_PER_YEAR / 3600) * yearsFromJ2000;
}
