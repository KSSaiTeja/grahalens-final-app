import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";

import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { useIsPrivate } from "@/lib/billing/entitlements";
import { wipeLocalObservatory } from "@/lib/settings/wipe";
import { space, useTheme } from "@/theme";

/**
 * X13 — Delete account + wipe local (store sub stays until cancelled in store).
 */
export default function DeleteSettingsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { colors, fontsLoaded, type } = useTheme();
  const isPrivate = useIsPrivate();
  const [busy, setBusy] = useState(false);
  const title = type("title");
  const body = type("body");
  const bodySm = type("bodySm");

  const confirmWipe = () => {
    const subWarning = isPrivate
      ? "\n\nYou still have Grahalens Private on this store account. Cancel billing in Apple/Google settings — wiping the app does not cancel the subscription."
      : "";

    Alert.alert(
      "Delete observatory?",
      `This erases birth, chart, journal, memories, Bonds, Lens threads, and local prefs on this device.${subWarning}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Wipe everything",
          style: "destructive",
          onPress: () => void runWipe(),
        },
      ],
    );
  };

  const runWipe = async () => {
    setBusy(true);
    try {
      await wipeLocalObservatory();
      queryClient.clear();
      router.replace("/(auth)/welcome" as Href);
    } catch (e) {
      Alert.alert(
        "Wipe failed",
        e instanceof Error ? e.message : "Could not clear local data.",
      );
    } finally {
      setBusy(false);
    }
  };

  if (!fontsLoaded) {
    return <View style={[styles.fill, { backgroundColor: colors.void }]} />;
  }

  return (
    <AtmosphericBackground atmosphere="neutral">
      <SafeAreaView style={styles.fill} edges={["top"]} testID="settings-delete">
        <ScreenHeader title="Delete" onBack={() => router.back()} />
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <GlassPanel style={styles.card}>
            <Text
              style={{
                fontFamily: title.fontFamily,
                fontSize: 22,
                lineHeight: 28,
                color: colors.text1,
              }}
            >
              Wipe this observatory
            </Text>
            <Text
              style={{
                marginTop: space.sm,
                fontFamily: body.fontFamily,
                fontSize: body.fontSize,
                lineHeight: body.lineHeight,
                color: colors.text2,
              }}
            >
              Removes on-device chart and notes, signs you out, and returns to
              welcome so you can run onboarding again. Export first if you need
              a JSON copy (Private).
            </Text>
            {isPrivate ? (
              <Text
                style={{
                  marginTop: space.md,
                  fontFamily: bodySm.fontFamily,
                  fontSize: bodySm.fontSize,
                  lineHeight: bodySm.lineHeight,
                  color: colors.caution,
                }}
              >
                Private is active — cancel auto-renew in the store separately.
              </Text>
            ) : null}
          </GlassPanel>

          <Button
            testID="delete-wipe"
            label="Delete account & wipe local"
            variant="danger"
            onPress={confirmWipe}
            loading={busy}
            style={styles.cta}
          />
        </ScrollView>
      </SafeAreaView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: {
    paddingHorizontal: space.lg,
    paddingBottom: space.xxl,
  },
  card: {
    borderRadius: 24,
  },
  cta: {
    marginTop: space.xl,
    alignSelf: "stretch",
  },
});
