import React, { useEffect, type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { motion, useTheme } from "@/theme";

export type Atmosphere = "calm" | "sunrise" | "journey" | "neutral";

type Props = {
  children: ReactNode;
  atmosphere?: Atmosphere;
  /** BRAND §06 weather-drift — Sky only when Opening > 0.6 */
  drift?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * ABY fields: daily chrome is flat soft gray.
 * Special scenes get a whisper of pastel that settles into the void.
 * Optional weather-drift wash (disabled under reduce motion).
 */
const LIGHT_FIELDS = {
  calm: ["#F2F2F0", "#F0EEF5", "#F2F2F0"],
  sunrise: ["#F2F2F0", "#F4EEE8", "#F2F2F0"],
  journey: ["#F2F2F0", "#EEF2EC", "#F2F2F0"],
  neutral: ["#F2F2F0", "#F2F2F0", "#F2F2F0"],
} as const;

const DARK_FIELDS = {
  calm: ["#141416", "#16141C", "#141416"],
  sunrise: ["#141416", "#1A1714", "#141416"],
  journey: ["#141416", "#141816", "#141416"],
  neutral: ["#141416", "#141416", "#141416"],
} as const;

const LIGHT_DRIFT = ["#F0EEF5", "#ECEAF3", "#F2F2F0"] as const;
const DARK_DRIFT = ["#16141C", "#1A1824", "#141416"] as const;

export function AtmosphericBackground({
  children,
  atmosphere = "neutral",
  drift = false,
  style,
}: Props) {
  const { theme, reduceMotion } = useTheme();
  const colors =
    theme === "ink" ? DARK_FIELDS[atmosphere] : LIGHT_FIELDS[atmosphere];
  const driftColors = theme === "ink" ? DARK_DRIFT : LIGHT_DRIFT;
  const progress = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(progress);
    if (!drift || reduceMotion) {
      progress.value = 0;
      return;
    }
    progress.value = 0;
    progress.value = withRepeat(
      withTiming(1, {
        duration: motion.weatherDrift.durationMs,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );
  }, [drift, reduceMotion, progress]);

  const driftStyle = useAnimatedStyle(() => ({
    opacity: drift && !reduceMotion ? 0.18 + progress.value * 0.22 : 0,
    transform: [
      {
        translateX:
          drift && !reduceMotion ? (progress.value - 0.5) * 12 : 0,
      },
    ],
  }));

  return (
    <View style={[styles.fill, style]}>
      <LinearGradient
        colors={[...colors]}
        locations={[0, 0.5, 1]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {drift ? (
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, driftStyle]}
          importantForAccessibility="no-hide-descendants"
        >
          <LinearGradient
            colors={[...driftColors]}
            locations={[0, 0.45, 1]}
            start={{ x: 0, y: 0.2 }}
            end={{ x: 1, y: 0.9 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    overflow: "hidden",
  },
});
