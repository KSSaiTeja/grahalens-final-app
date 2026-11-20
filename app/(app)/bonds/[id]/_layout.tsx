import React from "react";
import { Stack } from "expo-router";

import { useTheme } from "@/theme";

export default function BondDetailLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.void, flex: 1 },
      }}
    />
  );
}
