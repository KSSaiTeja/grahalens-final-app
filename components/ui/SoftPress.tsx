import React, { type ReactNode } from 'react';
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { useTheme, motion } from '@/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = Omit<PressableProps, 'style'> & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Disable scale (e.g. full-bleed rows) */
  scale?: boolean;
};

/**
 * ABY-soft press: gentle scale + opacity, respects reduceMotion.
 */
export function SoftPress({
  children,
  style,
  scale = true,
  disabled,
  onPressIn,
  onPressOut,
  ...rest
}: Props) {
  const { reduceMotion } = useTheme();
  const s = useSharedValue(1);
  const o = useSharedValue(1);

  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: s.value }],
    opacity: o.value,
  }));

  return (
    <AnimatedPressable
      disabled={disabled}
      onPressIn={(e) => {
        if (!disabled && !reduceMotion) {
          s.value = withTiming(scale ? motion.press.scale : 1, {
            duration: motion.press.durationMs,
            easing: Easing.out(Easing.quad),
          });
          o.value = withTiming(motion.press.opacity, {
            duration: motion.press.durationMs,
          });
        } else if (!disabled) {
          o.value = motion.press.opacity;
        }
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        if (!reduceMotion) {
          s.value = withTiming(1, {
            duration: motion.press.durationMs,
            easing: Easing.out(Easing.quad),
          });
          o.value = withTiming(1, { duration: motion.press.durationMs });
        } else {
          o.value = 1;
        }
        onPressOut?.(e);
      }}
      style={[anim, style]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
