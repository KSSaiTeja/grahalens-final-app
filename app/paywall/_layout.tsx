import React from "react";
import { Stack } from "expo-router";

import { useTheme } from "@/theme";

/**
 * Paywall stack — no tab bar (BRAND §07). Soft welcome + later P1–P4.
 */
export default function PaywallLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        contentStyle: { backgroundColor: colors.void, flex: 1 },
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="plans" />
      <Stack.Screen name="success" />
      <Stack.Screen name="unavailable" />
      <Stack.Screen
        name="sheet"
        options={{
          presentation: "transparentModal",
          animation: "fade",
          contentStyle: { backgroundColor: "transparent" },
        }}
      />
    </Stack>
  );
}
