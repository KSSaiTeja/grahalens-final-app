import React from "react";
import { Stack } from "expo-router";

import { useTheme } from "@/theme";

/**
 * Auth stack — no tab bar (BRAND §07). Observatory void background.
 */
export default function AuthLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        contentStyle: { backgroundColor: colors.void, flex: 1 },
      }}
    >
      <Stack.Screen name="splash" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="guest" />
    </Stack>
  );
}
