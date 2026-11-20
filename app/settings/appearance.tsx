import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { space, useTheme } from "@/theme";

/** X4 — Ink / Dawn appearance. */
export default function AppearanceSettingsScreen() {
  const router = useRouter();
  const { colors, fontsLoaded, theme, type } = useTheme();
  const title = type("title");
  const body = type("body");
  const bodySm = type("bodySm");
  const meta = type("meta");

  if (!fontsLoaded) {
    return <View style={[styles.fill, { backgroundColor: colors.void }]} />;
  }

  return (
    <AtmosphericBackground atmosphere="neutral">
      <SafeAreaView
        style={styles.fill}
        edges={["top"]}
        testID="settings-appearance"
      >
        <ScreenHeader title="Appearance" onBack={() => router.back()} />
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <GlassPanel style={styles.card}>
            <Text
              style={{
                fontFamily: meta.fontFamily,
                fontSize: 10,
                letterSpacing: meta.letterSpacing,
                color: colors.text3,
                textTransform: "uppercase",
              }}
            >
              Theme
            </Text>
            <Text
              style={{
                marginTop: space.sm,
                fontFamily: title.fontFamily,
                fontSize: 24,
                lineHeight: 30,
                color: colors.text1,
              }}
            >
              {theme === "dawn" ? "Dawn" : "Ink"}
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
              Dawn is the default observatory light. Ink is the quiet evening
              mode — same craft, lower glow.
            </Text>
            <View style={styles.toggle}>
              <ThemeToggle />
            </View>
          </GlassPanel>
          <Text
            style={{
              marginTop: space.lg,
              fontFamily: bodySm.fontFamily,
              fontSize: bodySm.fontSize,
              lineHeight: bodySm.lineHeight,
              color: colors.text3,
            }}
          >
            Preference persists on this device.
          </Text>
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
  toggle: {
    marginTop: space.lg,
  },
});
