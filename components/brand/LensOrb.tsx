import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';

import { useTheme } from '@/theme';

export type LensOrbState =
  | 'idle'
  | 'reading'
  | 'thinking'
  | 'speaking'
  | 'found'
  | 'alert';

type Props = {
  size?: number;
  state?: LensOrbState;
};

/**
 * Optical orb — soft disc + thin glass ring. No face, no stars.
 * Reduced motion: static; state via accessibility label only.
 */
export function LensOrb({ size = 40, state = 'idle' }: Props) {
  const { colors, reduceMotion, motion } = useTheme();
  const breathe = useSharedValue(1);
  const ringOpacity = useSharedValue(0.55);
  const scan = useSharedValue(0);
  const flare = useSharedValue(0);

  const label =
    state === 'idle'
      ? 'Lens present'
      : state === 'reading'
        ? 'Lens reading chart'
        : state === 'thinking'
          ? 'Lens thinking'
          : state === 'speaking'
            ? 'Lens speaking'
            : state === 'found'
              ? 'Lens found insight'
              : 'Lens needs attention';

  useEffect(() => {
    cancelAnimation(breathe);
    cancelAnimation(ringOpacity);
    cancelAnimation(scan);
    cancelAnimation(flare);

    if (reduceMotion) {
      breathe.value = 1;
      ringOpacity.value = state === 'alert' ? 0.9 : 0.6;
      scan.value = 0;
      flare.value = 0;
      return;
    }

    if (state === 'idle' || state === 'speaking') {
      breathe.value = withRepeat(
        withSequence(
          withTiming(motion.breathe.to, {
            duration: motion.breathe.durationMs / 2,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(motion.breathe.from, {
            duration: motion.breathe.durationMs / 2,
            easing: Easing.inOut(Easing.ease),
          }),
        ),
        -1,
        false,
      );
    } else {
      breathe.value = 1;
    }

    if (state === 'thinking') {
      ringOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.45, {
            duration: 700,
            easing: Easing.inOut(Easing.ease),
          }),
        ),
        -1,
        false,
      );
    } else if (state === 'alert') {
      ringOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 500 }),
          withTiming(0.35, { duration: 500 }),
        ),
        -1,
        false,
      );
    } else {
      ringOpacity.value = 0.55;
    }

    if (state === 'reading') {
      scan.value = withRepeat(
        withTiming(1, {
          duration: motion.readingScan.durationMs,
          easing: Easing.linear,
        }),
        -1,
        false,
      );
    } else {
      scan.value = 0;
    }

    if (state === 'found') {
      flare.value = withSequence(
        withTiming(1, { duration: 400 }),
        withTiming(0, { duration: motion.flare.durationMs - 400 }),
      );
    } else {
      flare.value = 0;
    }
  }, [
    state,
    reduceMotion,
    breathe,
    ringOpacity,
    scan,
    flare,
    motion.breathe.from,
    motion.breathe.to,
    motion.breathe.durationMs,
    motion.readingScan.durationMs,
    motion.flare.durationMs,
  ]);

  const discStyle = useAnimatedStyle(() => ({
    opacity: breathe.value,
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
  }));

  const scanStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + scan.value * 0.35,
    transform: [{ rotate: `${scan.value * 360}deg` }],
  }));

  const flareStyle = useAnimatedStyle(() => ({
    opacity: flare.value * 0.55,
    transform: [{ scale: 1 + flare.value * 0.35 }],
  }));

  const ringColor =
    state === 'alert'
      ? colors.info
      : state === 'thinking'
        ? colors.thinking
        : colors.accent;

  return (
    <View
      style={{ width: size, height: size }}
      accessibilityRole="image"
      accessibilityLabel={label}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.flare,
          {
            borderRadius: size / 2,
            backgroundColor: colors.accentSoft,
          },
          flareStyle,
        ]}
      />
      <Animated.View
        style={[
          styles.disc,
          {
            width: size * 0.72,
            height: size * 0.72,
            borderRadius: size * 0.36,
            backgroundColor: colors.glass,
            top: size * 0.14,
            left: size * 0.14,
          },
          discStyle,
        ]}
      />
      <Animated.View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: ringColor,
            borderWidth: Math.max(1, size * 0.035),
          },
          ringStyle,
        ]}
      />
      {state === 'reading' && !reduceMotion ? (
        <Animated.View
          style={[
            styles.scan,
            {
              width: size * 0.5,
              height: 1,
              top: size / 2,
              left: size * 0.25,
              backgroundColor: colors.text2,
            },
            scanStyle,
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  disc: {
    position: 'absolute',
  },
  ring: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  scan: {
    position: 'absolute',
  },
  flare: {
    position: 'absolute',
  },
});
