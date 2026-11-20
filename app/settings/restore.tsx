import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { RestoreButton } from "@/components/billing/RestoreButton";
import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { space, useTheme } from "@/theme";

/** X8 — Restore purchases entry. */
export default function RestoreSettingsScreen() {
  const router = useRouter();
  const { colors, fontsLoaded, type } = useTheme();
  const body = type("body");

  if (!fontsLoaded) {
    return <View style={[styles.fill, { backgroundColor: colors.void }]} />;
  }

  return (
    <AtmosphericBackground atmosphere="neutral">
      <SafeAreaView style={styles.fill} edges={["top"]} testID="settings-restore">
        <ScreenHeader title="Restore" onBack={() => router.back()} />
        <View style={styles.body}>
          <GlassPanel style={styles.card}>
            <Text
              style={{
                fontFamily: body.fontFamily,
                fontSize: body.fontSize,
                lineHeight: body.lineHeight,
                color: colors.text2,
              }}
            >
              If you already purchased Grahalens Private on this store account,
              restore reapplies the entitlement without buying again.
            </Text>
            <RestoreButton
              testID="settings-restore-button"
              onSuccess={() => router.replace("/paywall/success")}
              style={styles.restore}
            />
          </GlassPanel>
        </View>
      </SafeAreaView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  body: {
    paddingHorizontal: space.lg,
  },
  card: {
    borderRadius: 24,
  },
  restore: {
    marginTop: space.lg,
  },
});
