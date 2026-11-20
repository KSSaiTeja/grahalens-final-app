import React, { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme, radii, shadows, space } from '@/theme';

type Props = {
  children: ReactNode;
  /** flat = no shadow (inset lists); card = soft elevate; float = stronger */
  elevation?: 'none' | 'card' | 'float';
  tone?: 'surface' | 'raised' | 'void';
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * ABY surface — solid white squircle, soft diffuse shadow.
 */
export function Surface({
  children,
  elevation = 'card',
  tone = 'surface',
  padded = true,
  style,
}: Props) {
  const { colors, theme } = useTheme();
  const bg =
    tone === 'raised'
      ? colors.raised
      : tone === 'void'
        ? colors.void
        : colors.surface;

  const shadow =
    elevation === 'none'
      ? null
      : elevation === 'float'
        ? shadows.float
        : shadows.card;

  const shadowStyle =
    shadow && theme === 'ink'
      ? { ...shadow, shadowOpacity: (shadow.shadowOpacity ?? 0.04) * 1.6 }
      : shadow;

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: bg,
          borderColor: colors.hairline,
          borderWidth: elevation === 'none' ? StyleSheet.hairlineWidth : 0,
          padding: padded ? space.lg : 0,
        },
        shadowStyle ?? undefined,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.xl,
    overflow: 'visible',
  },
});
