import React from "react";
import { Stack } from "expo-router";

import { useTheme } from "@/theme";

/** Chart tab stack — C1–C7. */
export default function ChartLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.void, flex: 1 },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="planet/[name]" />
      <Stack.Screen name="dasha" />
      <Stack.Screen name="dasha/[key]" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="transits" />
      <Stack.Screen name="aspects" />
    </Stack>
  );
}
