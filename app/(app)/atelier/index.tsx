import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  BookOpenText,
  HeartPulse,
  NotebookPen,
  Sparkles,
} from "lucide-react-native";

import { HubTile } from "@/components/atelier";
import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { useIsPrivate } from "@/lib/billing/entitlements";
import { space, useTheme } from "@/theme";

/** R1 — Atelier hub: journal, check-in, soul (GATE), patterns (GATE). */
export default function AtelierHubScreen() {
  const router = useRouter();
  const { colors, fontsLoaded, type } = useTheme();
  const isPrivate = useIsPrivate();
  const display = type("displayL");
  const body = type("body");
  const meta = type("meta");

  if (!fontsLoaded) {
    return <View style={[styles.fill, { backgroundColor: colors.void }]} />;
  }

  return (
    <AtmosphericBackground atmosphere="neutral">
      <SafeAreaView style={styles.fill} edges={["top"]} testID="atelier-hub">
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <OfflineBanner />
          <Text
            style={{
              fontFamily: meta.fontFamily,
              fontSize: 10,
              letterSpacing: meta.letterSpacing,
              color: colors.text3,
              textTransform: "uppercase",
            }}
          >
            Reflect
          </Text>
          <Text
            style={{
              marginTop: space.sm,
              fontFamily: display.fontFamily,
              fontSize: display.fontSize,
              lineHeight: display.lineHeight,
              letterSpacing: display.letterSpacing,
              color: colors.text1,
            }}
          >
            Atelier
          </Text>
          <Text
            style={{
              marginTop: space.sm,
              fontFamily: body.fontFamily,
              fontSize: body.fontSize,
              lineHeight: body.lineHeight,
              color: colors.text2,
              maxWidth: 340,
            }}
          >
            A quiet notebook beside the sky — journal, check-in, Soul
            Cartography, and the Pattern Thread.
          </Text>

          <View style={styles.tiles}>
            <HubTile
              title="Journal"
              body="Field notes linked to today’s weather."
              icon={NotebookPen}
              testID="atelier-journal"
              onPress={() => router.push("/(app)/atelier/journal" as Href)}
            />
            <HubTile
              title="Check-in"
              body="Name the grain of the day — feeds Lens memory."
              icon={HeartPulse}
              testID="atelier-check-in"
              onPress={() => router.push("/(app)/atelier/check-in" as Href)}
            />
            <HubTile
              title="Soul Cartography"
              body="Preview free. Full portrait with Private."
              icon={Sparkles}
              gated={!isPrivate}
              testID="atelier-soul"
              onPress={() => router.push("/(app)/atelier/soul" as Href)}
            />
            <HubTile
              title="Pattern Thread"
              body="Weekly braid of moods and sky — Private."
              icon={BookOpenText}
              gated={!isPrivate}
              testID="atelier-patterns"
              onPress={() => router.push("/(app)/atelier/patterns" as Href)}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.xxl,
  },
  tiles: {
    marginTop: space.xl,
    gap: space.sm,
  },
});
