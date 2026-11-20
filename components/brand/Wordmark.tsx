import React from 'react';
import { Text, StyleSheet, type StyleProp, type TextStyle, View } from 'react-native';

import { useTheme } from '@/theme';
import { LensOrb, type LensOrbState } from './LensOrb';

type Props = {
  size?: number;
  /** Replace the brand-orange period with a tiny Lens orb */
  periodAsOrb?: boolean;
  orbState?: LensOrbState;
  style?: StyleProp<TextStyle>;
};

/**
 * Wordmark: `grahalens.` — always lowercase; period is brand orange (or Lens orb).
 */
export function Wordmark({
  size,
  periodAsOrb = false,
  orbState = 'idle',
  style,
}: Props) {
  const { colors, type } = useTheme();
  const base = type('wordmark');
  const fontSize = size ?? base.fontSize;

  return (
    <View
      style={styles.row}
      accessibilityRole="header"
      accessibilityLabel="grahalens"
    >
      <Text
        style={[
          {
            fontFamily: base.fontFamily,
            fontSize,
            lineHeight: fontSize * 1.15,
            letterSpacing: base.letterSpacing,
            color: colors.text1,
          },
          style,
        ]}
      >
        grahalens
      </Text>
      {periodAsOrb ? (
        <View style={[styles.orbPeriod, { marginLeft: fontSize * 0.06 }]}>
          <LensOrb size={Math.max(8, fontSize * 0.35)} state={orbState} />
        </View>
      ) : (
        <Text
          style={{
            fontFamily: base.fontFamily,
            fontSize,
            lineHeight: fontSize * 1.15,
            letterSpacing: base.letterSpacing,
            color: colors.accent,
          }}
        >
          .
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  orbPeriod: {
    alignSelf: 'center',
  },
});
