import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { useTheme, layout, fontFamilies, shadows, space } from '@/theme';
import { SoftPress } from './SoftPress';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

type Props = Omit<PressableProps, 'style'> & {
  label: string;
  variant?: Variant;
  loading?: boolean;
  icon?: LucideIcon;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  variant = 'primary',
  loading = false,
  icon: Glyph,
  disabled,
  style,
  ...rest
}: Props) {
  const { colors, type } = useTheme();
  const body = type('body');
  const isDisabled = disabled || loading;

  const bg =
    variant === 'primary'
      ? colors.cta
      : variant === 'secondary'
        ? colors.surface
        : variant === 'danger'
          ? colors.critical
          : 'transparent';

  const fg =
    variant === 'primary' || variant === 'danger'
      ? colors.onCta
      : colors.text1;

  const borderColor =
    variant === 'secondary'
      ? colors.hairline
      : variant === 'ghost'
        ? colors.hairline
        : 'transparent';

  return (
    <SoftPress
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: loading }}
      disabled={isDisabled}
      style={[
        styles.base,
        variant === 'secondary' ? shadows.card : null,
        {
          backgroundColor: bg,
          borderColor,
          borderWidth: variant === 'ghost' || variant === 'secondary' ? StyleSheet.hairlineWidth : 0,
          opacity: isDisabled ? 0.45 : 1,
          height: layout.ctaHeight,
          borderRadius: layout.ctaRadius,
        },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.labelRow}>
          {Glyph ? <Glyph size={19} color={fg} strokeWidth={2} /> : null}
          <Text
            style={{
              fontFamily: fontFamilies.bodySemi,
              fontSize: body.fontSize,
              lineHeight: body.lineHeight,
              color: fg,
            }}
          >
            {label}
          </Text>
        </View>
      )}
    </SoftPress>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.lg,
    minWidth: layout.minHit,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
  },
});
