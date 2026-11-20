import React from 'react';
import { StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme, radii, space } from '@/theme';
import { SoftPress } from './SoftPress';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * Soft selection chip — ABY-style rounded pill, not decorative clusters.
 */
export function Pill({ label, selected = false, onPress, style }: Props) {
  const { colors, type } = useTheme();
  const meta = type('meta');

  const content = (
    <Text
      style={{
        fontFamily: meta.fontFamily,
        fontSize: 13,
        lineHeight: 16,
        color: selected ? colors.accent : colors.text2,
      }}
    >
      {label}
    </Text>
  );

  if (!onPress) {
    return (
      <SoftPress
        disabled
        accessibilityRole="text"
        accessibilityState={{ selected }}
        style={[
          styles.base,
          {
            backgroundColor: selected ? colors.accentSoft : colors.raised,
            borderColor: selected ? colors.accent : colors.hairline,
          },
          style,
        ]}
        scale={false}
      >
        {content}
      </SoftPress>
    );
  }

  return (
    <SoftPress
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[
        styles.base,
        {
          backgroundColor: selected ? colors.accentSoft : colors.raised,
          borderColor: selected ? colors.accent : colors.hairline,
        },
        style,
      ]}
    >
      {content}
    </SoftPress>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    paddingHorizontal: space.md,
    paddingVertical: space.sm + 2,
    borderRadius: radii.pill,
    borderWidth: 1,
    minHeight: 36,
    justifyContent: 'center',
  },
});
