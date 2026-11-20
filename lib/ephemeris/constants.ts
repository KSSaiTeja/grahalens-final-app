/** Whole-sign Lahiri constants — grahas, rasis, nakshatras, Vimshottari. */

export const GRAHA_IDS = [
  'sun',
  'moon',
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'rahu',
  'ketu',
] as const;

export type GrahaId = (typeof GRAHA_IDS)[number];

export const RASI_IDS = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
] as const;

export type RasiId = (typeof RASI_IDS)[number];

export const RASI_LABELS: Record<RasiId, string> = {
  aries: 'Aries',
  taurus: 'Taurus',
  gemini: 'Gemini',
  cancer: 'Cancer',
  leo: 'Leo',
  virgo: 'Virgo',
  libra: 'Libra',
  scorpio: 'Scorpio',
  sagittarius: 'Sagittarius',
  capricorn: 'Capricorn',
  aquarius: 'Aquarius',
  pisces: 'Pisces',
};

/** 27 nakshatras, 13°20′ each. Index 0 = Ashwini at 0° Aries sidereal. */
export const NAKSHATRA_NAMES = [
  'Ashwini',
  'Bharani',
  'Krittika',
  'Rohini',
  'Mrigashira',
  'Ardra',
  'Punarvasu',
  'Pushya',
  'Ashlesha',
  'Magha',
  'Purva Phalguni',
  'Uttara Phalguni',
  'Hasta',
  'Chitra',
  'Swati',
  'Vishakha',
  'Anuradha',
  'Jyeshtha',
  'Mula',
  'Purva Ashadha',
  'Uttara Ashadha',
  'Shravana',
  'Dhanishta',
  'Shatabhisha',
  'Purva Bhadrapada',
  'Uttara Bhadrapada',
  'Revati',
] as const;

export type NakshatraName = (typeof NAKSHATRA_NAMES)[number];

export const NAKSHATRA_SPAN_DEG = 360 / 27;
export const PADA_SPAN_DEG = NAKSHATRA_SPAN_DEG / 4;

/**
 * Vimshottari lord order (Ashwini → Ketu). Cycles every 9 nakshatras.
 * Years sum to 120.
 */
export const VIMSHOTTARI_ORDER = [
  'ketu',
  'venus',
  'sun',
  'moon',
  'mars',
  'rahu',
  'jupiter',
  'saturn',
  'mercury',
] as const satisfies readonly GrahaId[];

export const VIMSHOTTARI_YEARS: Record<GrahaId, number> = {
  ketu: 7,
  venus: 20,
  sun: 6,
  moon: 10,
  mars: 7,
  rahu: 18,
  jupiter: 16,
  saturn: 19,
  mercury: 17,
};

export const VIMSHOTTARI_TOTAL_YEARS = 120;

export const NAKSHATRA_LORDS: GrahaId[] = Array.from({ length: 27 }, (_, i) => {
  return VIMSHOTTARI_ORDER[i % 9]!;
});

export const CHART_SYSTEM = 'lahiri_whole_sign' as const;
