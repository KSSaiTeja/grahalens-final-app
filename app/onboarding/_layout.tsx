import React from "react";
import { Stack } from "expo-router";

import { useTheme } from "@/theme";

/** Onboarding stack — A6–A10 birth path. */
export default function OnboardingLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.void, flex: 1 },
        animation: "fade",
      }}
    >
      <Stack.Screen name="date" />
      <Stack.Screen name="time" />
      <Stack.Screen name="place" />
      <Stack.Screen name="confirm" />
      <Stack.Screen name="computing" />
    </Stack>
  );
}
