import React from "react";
import { View } from "react-native";
import { Redirect } from "expo-router";

import { useTheme } from "@/theme";

/**
 * Entry → auth splash (A1). Splash owns session-based routing.
 */
export default function IndexScreen() {
  const { colors, fontsLoaded } = useTheme();

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.void }} />;
  }

  return <Redirect href="/(auth)/splash" />;
}
