/**
 * Type scale — ABY Journal: bold sentence-case display, soft body leading.
 * Display + body: Inter · Mono: IBM Plex Mono (degrees only).
 */

export const fontFamilies = {
  display: 'Inter_700Bold',
  displayMedium: 'Inter_600SemiBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemi: 'Inter_600SemiBold',
  mono: 'IBMPlexMono_400Regular',
  monoMedium: 'IBMPlexMono_500Medium',
} as const;

export type TypeRole =
  | 'displayXl'
  | 'displayL'
  | 'title'
  | 'body'
  | 'bodySm'
  | 'meta'
  | 'degree'
  | 'tabLabel'
  | 'wordmark';

export type TypeStyle = {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing?: number;
  fontVariant?: Array<'tabular-nums'>;
  textTransform?: 'uppercase' | 'none';
};

export const typeScale: Record<TypeRole, TypeStyle> = {
  displayXl: {
    fontFamily: fontFamilies.display,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.8,
  },
  displayL: {
    fontFamily: fontFamilies.display,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.55,
  },
  title: {
    fontFamily: fontFamilies.displayMedium,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.25,
  },
  body: {
    fontFamily: fontFamilies.body,
    fontSize: 16,
    lineHeight: 26,
  },
  bodySm: {
    fontFamily: fontFamilies.body,
    fontSize: 14,
    lineHeight: 21,
  },
  meta: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: 13,
    lineHeight: 17,
    letterSpacing: 0.05,
    textTransform: 'none',
  },
  degree: {
    fontFamily: fontFamilies.mono,
    fontSize: 12,
    lineHeight: 16,
    fontVariant: ['tabular-nums'],
  },
  tabLabel: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 0.1,
  },
  wordmark: {
    fontFamily: fontFamilies.display,
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.4,
  },
};
