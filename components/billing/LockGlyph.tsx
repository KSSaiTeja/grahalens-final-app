import React from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Lock } from 'lucide-react-native';

import { useTheme } from '@/theme';

type Props = {
  size?: number;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

/**
 * Champagne stroke lock — never a neon badge (BRAND §14).
 */
export function LockGlyph({
  size = 14,
  onPress,
  style,
  accessibilityLabel = 'Opens with Private',
}: Props) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'image'}
      accessibilityLabel={accessibilityLabel}
      hitSlop={12}
      style={({ pressed }) => [
        styles.wrap,
        { opacity: pressed ? 0.7 : 1 },
        style,
      ]}
    >
      <Lock size={size} color={colors.accent} strokeWidth={1.5} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
    minHeight: 48,
  },
});
