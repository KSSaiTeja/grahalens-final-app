/**
 * Color + geometry — ABY Journal aesthetic (Mobbin).
 * Soft gray void, solid white squircles, black pill CTAs,
 * lavender used sparingly. No loud washes on daily chrome.
 */

export type ThemeName = 'ink' | 'dawn';

export type ColorTokens = {
  void: string;
  surface: string;
  raised: string;
  hairline: string;
  hairlineStrong: string;
  text1: string;
  text2: string;
  text3: string;
  accent: string;
  accentSoft: string;
  cta: string;
  onCta: string;
  glass: string;
  thinking: string;
  positive: string;
  caution: string;
  critical: string;
  info: string;
  surfaceChrome: string;
  skyWash: string;
  scrim: string;
};

export const semantic = {
  positive: '#9BC4A8',
  caution: '#E2C07A',
  critical: '#E08A7A',
  info: '#9BB0C9',
} as const;

/** Quiet ABY pastels — washes only, never full-bleed neon */
export const pastels = {
  lavender: '#D4CBF5',
  mistBlue: '#C5D8EC',
  peach: '#F2D4C4',
  cream: '#F3E9D4',
  sage: '#C5D9C0',
  coral: '#E9B0A4',
  sunrise: '#F0C9A0',
  gold: '#EBD89A',
} as const;

export const gradients = {
  calm: [pastels.lavender, pastels.mistBlue, '#F7F7F5'] as const,
  sunrise: [pastels.peach, pastels.cream, '#F7F7F5'] as const,
  journey: [pastels.sage, pastels.lavender, '#F7F7F5'] as const,
} as const;

export const dawn: ColorTokens = {
  void: '#F2F2F0',
  surface: '#FFFFFF',
  raised: '#EBEBEA',
  hairline: 'rgba(10,10,10,0.06)',
  hairlineStrong: 'rgba(10,10,10,0.10)',
  text1: '#1A1A1A',
  text2: '#6E6E6E',
  text3: '#757575',
  accent: '#A394D9',
  accentSoft: 'rgba(163,148,217,0.14)',
  cta: '#0A0A0A',
  onCta: '#FFFFFF',
  glass: '#FFFFFF',
  thinking: '#C4B8EB',
  ...semantic,
  surfaceChrome: '#FFFFFF',
  skyWash: '#ECEAF3',
  scrim: 'rgba(10,10,10,0.28)',
};

export const ink: ColorTokens = {
  void: '#141416',
  surface: '#1E1E22',
  raised: '#2A2A30',
  hairline: 'rgba(255,255,255,0.07)',
  hairlineStrong: 'rgba(255,255,255,0.12)',
  text1: '#F4F4F5',
  text2: '#A0A0A6',
  text3: '#9A9AA0',
  accent: '#B8A9E8',
  accentSoft: 'rgba(184,169,232,0.18)',
  cta: '#F4F4F5',
  onCta: '#0A0A0A',
  glass: '#1E1E22',
  thinking: '#C7B8F5',
  ...semantic,
  surfaceChrome: '#1E1E22',
  skyWash: '#1A1824',
  scrim: 'rgba(0,0,0,0.55)',
};

export const themes: Record<ThemeName, ColorTokens> = {
  ink,
  dawn,
};

/** ABY squircles — large radii everywhere */
export const radii = {
  sm: 16,
  md: 22,
  lg: 28,
  xl: 32,
  pill: 999,
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const shadows = {
  card: {
    shadowColor: '#0A0A0A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  float: {
    shadowColor: '#0A0A0A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.07,
    shadowRadius: 28,
    elevation: 5,
  },
  tab: {
    shadowColor: '#0A0A0A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },
} as const;

export const layout = {
  minHit: 44,
  ctaHeight: 56,
  ctaRadius: radii.pill,
  tabBarHeight: 64,
  tabIconDraw: 22,
  tabIconViewBox: 24,
  chartMaxDiameter: 340,
  chartInset: 48,
  sheetGrabberWidth: 36,
  sheetGrabberHeight: 4,
  screenPad: 20,
} as const;
