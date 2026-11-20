import React from "react";
import { Stack } from "expo-router";

import { useTheme } from "@/theme";

/** Lens tab stack — L1–L5 (L6 = paywall sheet). */
export default function LensLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.void, flex: 1 },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="threads" />
      <Stack.Screen name="thread/[id]" />
      <Stack.Screen name="starters" />
      <Stack.Screen name="memories" />
    </Stack>
  );
}
