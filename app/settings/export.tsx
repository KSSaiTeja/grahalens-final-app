import React, { useState } from "react";
import { Alert, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { LockGlyph } from "@/components/billing/LockGlyph";
import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import {
  requirePrivate,
  useIsPrivate,
} from "@/lib/billing/entitlements";
import { localJournalStore } from "@/lib/atelier/local-store";
import { useJournalUserId } from "@/lib/atelier/queries";
import { createMemoryApi } from "@/lib/memory";
import { resolveMemoryStore, useLensUserId } from "@/lib/lens/session";
import { space, useTheme } from "@/theme";

/**
 * X14 — Export journal/memories JSON. PRIVATE via requirePrivate("export").
 */
export default function ExportSettingsScreen() {
  const router = useRouter();
  const { colors, fontsLoaded, type } = useTheme();
  const isPrivate = useIsPrivate();
  const journalUserId = useJournalUserId();
  const lensUserId = useLensUserId();
  const [busy, setBusy] = useState(false);
  const title = type("title");
  const body = type("body");
  const bodySm = type("bodySm");

  const openPaywall = () => {
    const gate = requirePrivate("export");
    if (!gate.allowed) {
      router.push(gate.href as Href);
    }
  };

  const onExport = async () => {
    const gate = requirePrivate("export");
    if (!gate.allowed) {
      router.push(gate.href as Href);
      return;
    }
    setBusy(true);
    try {
      const [entries, memories] = await Promise.all([
        localJournalStore.list(journalUserId),
        createMemoryApi(resolveMemoryStore()).list(lensUserId),
      ]);
      const payload = JSON.stringify(
        {
          exportedAt: new Date().toISOString(),
          journal: entries,
          memories,
        },
        null,
        2,
      );
      await Share.share({
        message: payload,
        title: "Grahalens export",
      });
    } catch (e) {
      Alert.alert(
        "Export failed",
        e instanceof Error ? e.message : "Could not build export.",
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
      <SafeAreaView style={styles.fill} edges={["top"]} testID="settings-export">
        <ScreenHeader title="Export" onBack={() => router.back()} />
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {isPrivate ? (
            <GlassPanel style={styles.card}>
              <Text
                style={{
                  fontFamily: title.fontFamily,
                  fontSize: 22,
                  lineHeight: 28,
                  color: colors.text1,
                }}
              >
                Observatory export
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
                Shares your local journal entries and Lens memories as JSON.
              </Text>
              <Button
                testID="export-run"
                label="Share JSON export"
                onPress={() => void onExport()}
                loading={busy}
                style={styles.cta}
              />
            </GlassPanel>
          ) : (
            <GlassPanel style={styles.locked}>
              <LockGlyph
                size={22}
                onPress={openPaywall}
                accessibilityLabel="Unlock export with Private"
              />
              <Text
                style={{
                  marginTop: space.sm,
                  fontFamily: title.fontFamily,
                  fontSize: 22,
                  lineHeight: 28,
                  color: colors.text1,
                  textAlign: "center",
                }}
              >
                Export is Private
              </Text>
              <Text
                style={{
                  marginTop: space.sm,
                  fontFamily: bodySm.fontFamily,
                  fontSize: bodySm.fontSize,
                  lineHeight: bodySm.lineHeight,
                  color: colors.text2,
                  textAlign: "center",
                }}
              >
                Free keeps your notes on device. Private unlocks a JSON export
                of journal and memories.
              </Text>
              <Button
                testID="export-gate-cta"
                label="Open with Private"
                onPress={openPaywall}
                style={styles.cta}
              />
            </GlassPanel>
          )}
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
  locked: {
    borderRadius: 28,
    alignItems: "center",
  },
  cta: {
    alignSelf: "stretch",
    marginTop: space.lg,
  },
});
