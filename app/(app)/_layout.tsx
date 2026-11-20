import React from "react";
import { Tabs } from "expo-router";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

import { ObservatoryTabBar } from "@/components/brand/ObservatoryTabBar";
import { useTheme } from "@/theme";

/**
 * Five-tab observatory shell — G1. Custom ObservatoryTabBar only.
 * Paywall / auth / onboarding live outside this group (no tabs).
 */
export default function AppTabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      tabBar={(props: BottomTabBarProps) => <ObservatoryTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.void },
        tabBarStyle: { position: "absolute", backgroundColor: "transparent" },
      }}
    >
      <Tabs.Screen name="sky" options={{ title: "Sky" }} />
      <Tabs.Screen name="chart" options={{ title: "Chart" }} />
      <Tabs.Screen name="lens" options={{ title: "Lens" }} />
      <Tabs.Screen name="bonds" options={{ title: "Bonds" }} />
      <Tabs.Screen name="atelier" options={{ title: "Atelier" }} />
    </Tabs>
  );
}
