import React, { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { gradients } from '@/theme';

export type WashKind = keyof typeof gradients;

type Props = {
  children?: ReactNode;
  /** ABY-style wash: calm | sunrise | journey */
  kind?: WashKind;
  style?: StyleProp<ViewStyle>;
};

/**
 * Soft mesh-like wash for onboarding / welcome (ABY Journal language).
 * Solid app chrome stays on `colors.void` — use this only for atmosphere screens.
 */
export function GradientWash({ children, kind = 'calm', style }: Props) {
  const colors = gradients[kind];
  return (
    <View style={[styles.fill, style]}>
      <LinearGradient
        colors={colors}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
