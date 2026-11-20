import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AspectTable, ChartHeader } from "@/components/chart";
import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { useResolvedNatal } from "@/lib/sky/resolve-natal";
import { useTheme } from "@/theme";

/**
 * C6 — Natal aspect table (real natalAspects).
 */
export default function AspectsScreen() {
  const { colors, fontsLoaded, type } = useTheme();
  const meta = type("meta");
  const { natal, usingFixture } = useResolvedNatal();

  if (!fontsLoaded) {
    return <View style={[styles.fill, { backgroundColor: colors.void }]} />;
  }

  return (
    <AtmosphericBackground atmosphere="neutral">
      <SafeAreaView style={styles.fill} edges={["top"]}>
        <View style={styles.pad}>
          <ChartHeader
            title="Aspects"
            subtitle={usingFixture ? "Natal · Fixture A" : "Natal"}
          />
        </View>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <GlassPanel style={styles.intro}>
          <Text
            style={{
              marginBottom: 16,
              fontFamily: meta.fontFamily,
              fontSize: 10,
              letterSpacing: meta.letterSpacing,
              color: colors.text3,
              textTransform: "uppercase",
            }}
          >
            Major aspects · orb table
          </Text>
          </GlassPanel>
          <AspectTable chart={natal} />
        </ScrollView>
      </SafeAreaView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  pad: { paddingHorizontal: 24 },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  intro: {
    marginBottom: 16,
    borderRadius: 20,
  },
});
