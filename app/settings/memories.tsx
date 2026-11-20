import React from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { MemoriesManager } from "@/components/lens/MemoriesManager";
import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { useTheme } from "@/theme";

/** X6 — Same memory manager as L5, settings entry. */
export default function SettingsMemoriesScreen() {
  const router = useRouter();
  const { colors, fontsLoaded } = useTheme();

  if (!fontsLoaded) {
    return <View style={[styles.fill, { backgroundColor: colors.void }]} />;
  }

  return (
    <AtmosphericBackground atmosphere="neutral">
      <SafeAreaView
        style={styles.fill}
        edges={["top"]}
        testID="settings-memories"
      >
        <ScreenHeader
          title="Memories"
          subtitle="Soft context for Lens"
          onBack={() => router.back()}
        />
        <MemoriesManager />
      </SafeAreaView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
