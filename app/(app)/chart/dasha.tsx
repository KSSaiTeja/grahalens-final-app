import React, { useCallback, useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { ChartHeader, DashaRibbon } from "@/components/chart";
import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { computeDasha } from "@/lib/ephemeris/dasha";
import { useResolvedNatal } from "@/lib/sky/resolve-natal";
import { useTheme } from "@/theme";

/**
 * C3 — Full Dasha Ribbon + period prose (real compute only).
 * Deep read C4 (dasha/[key]) arrives in Prompt 16.
 */
export default function DashaScreen() {
  const router = useRouter();
  const { colors, fontsLoaded } = useTheme();
  const { natal, usingFixture } = useResolvedNatal();

  const timeline = useMemo(() => computeDasha(natal, 2), [natal]);
  const at = useMemo(() => new Date(), []);
  const onSelectPeriod = useCallback(
    (key: string) => {
      router.push({
        pathname: "/(app)/chart/dasha/[key]",
        params: { key },
      });
    },
    [router],
  );

  if (!fontsLoaded) {
    return <View style={[styles.fill, { backgroundColor: colors.void }]} />;
  }

  return (
    <AtmosphericBackground atmosphere="neutral">
      <SafeAreaView style={styles.fill} edges={["top"]}>
        <View style={styles.pad}>
          <ChartHeader
            title="Dasha"
            subtitle={
              usingFixture
                ? `${timeline.nakshatra} · Fixture A`
                : timeline.nakshatra
            }
          />
        </View>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <DashaRibbon
            timeline={timeline}
            at={at}
            onSelectPeriod={onSelectPeriod}
          />
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
});
