import React, { useMemo } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop, Rect } from 'react-native-svg';

import { useTheme } from '@/theme';

type Props = {
  /** Opening axis 0–1; accent hint only when > 0.6 (BRAND §03 / §06) */
  opening?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

/**
 * Soft ink grain + low-contrast sky wash. Never full-bleed nebula photography.
 */
export function ObservatoryGrain({ opening = 0, style, children }: Props) {
  const { colors, theme } = useTheme();
  const showAccentHint = opening > 0.6;

  const dots = useMemo(() => {
    const out: Array<{ cx: number; cy: number; r: number; o: number }> = [];
    let seed = 17;
    for (let i = 0; i < 48; i++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      const cx = (seed % 1000) / 10;
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      const cy = (seed % 1000) / 10;
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      const r = 0.15 + (seed % 100) / 400;
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      const o = 0.04 + (seed % 100) / 2000;
      out.push({ cx, cy, r, o });
    }
    return out;
  }, []);

  const grainColor = theme === 'ink' ? '#FFF8F3' : '#2D2D2D';

  return (
    <View style={[styles.root, { backgroundColor: colors.void }, style]}>
      <Svg
        style={StyleSheet.absoluteFill}
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <Defs>
          <RadialGradient id="skyWash" cx="48%" cy="38%" rx="62%" ry="55%">
            <Stop offset="0%" stopColor={colors.skyWash} stopOpacity="1" />
            <Stop offset="100%" stopColor={colors.void} stopOpacity="1" />
          </RadialGradient>
          {showAccentHint ? (
            <RadialGradient id="accentHint" cx="55%" cy="42%" rx="40%" ry="35%">
              <Stop offset="0%" stopColor={colors.accent} stopOpacity="0.04" />
              <Stop offset="100%" stopColor={colors.accent} stopOpacity="0" />
            </RadialGradient>
          ) : null}
        </Defs>
        <Rect x="0" y="0" width="100" height="100" fill="url(#skyWash)" />
        {showAccentHint ? (
          <Rect x="0" y="0" width="100" height="100" fill="url(#accentHint)" />
        ) : null}
        {dots.map((d, i) => (
          <Circle
            key={i}
            cx={d.cx}
            cy={d.cy}
            r={d.r}
            fill={grainColor}
            opacity={d.o}
          />
        ))}
      </Svg>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
  },
});
