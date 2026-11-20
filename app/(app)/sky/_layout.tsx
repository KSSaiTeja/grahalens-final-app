import React from "react";
import { Stack } from "expo-router";

import { useTheme } from "@/theme";

/** Sky tab stack — S1–S5. */
export default function SkyLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.void, flex: 1 },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="weather" />
      <Stack.Screen name="muhurta/[id]" />
      <Stack.Screen name="day/[date]" />
      <Stack.Screen name="inbox" />
    </Stack>
  );
}
