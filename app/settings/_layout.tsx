import React from "react";
import { Stack } from "expo-router";

import { useTheme } from "@/theme";

export default function SettingsLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { flex: 1, backgroundColor: colors.void },
      }}
    />
  );
}
