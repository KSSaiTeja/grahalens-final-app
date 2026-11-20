import React, { useEffect, type ReactNode } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { useTheme, motion } from '@/theme';

type Props = {
  children: ReactNode;
  /** Stagger index for sibling enters */
  index?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Soft fade + rise on mount — ABY calm entrances.
 */
export function ScreenEnter({ children, index = 0, style }: Props) {
  const { reduceMotion } = useTheme();
  const progress = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) {
      progress.value = 1;
      return;
    }
    progress.value = withDelay(
      index * motion.staggerMs,
      withTiming(1, {
        duration: motion.enter.durationMs,
        easing: Easing.bezier(...motion.enter.bezier),
      }),
    );
  }, [index, progress, reduceMotion]);

  const anim = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      {
        translateY: reduceMotion
          ? 0
          : (1 - progress.value) * motion.enter.translateY,
      },
    ],
  }));

  return (
    <Animated.View style={[styles.fill, anim, style]}>{children}</Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: {
  },
});
