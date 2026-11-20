import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ChartHeader, TransitDay } from "@/components/chart";
import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { civilDateInTz, formatCivilLabel } from "@/lib/sky/archive";
import { useResolvedNatal } from "@/lib/sky/resolve-natal";
import { useTheme } from "@/theme";

/**
 * C5 — Transit choreography day view (real computeTransits).
 */
export default function TransitsScreen() {
  const { colors, fontsLoaded, type } = useTheme();
  const meta = type("meta");
  const { natal, usingFixture } = useResolvedNatal();
  const at = useMemo(() => new Date(), []);
  const civil = useMemo(
    () => civilDateInTz(at, natal.tz),
    [at, natal.tz],
  );

  if (!fontsLoaded) {
    return <View style={[styles.fill, { backgroundColor: colors.void }]} />;
  }

  return (
    <AtmosphericBackground atmosphere="neutral">
      <SafeAreaView style={styles.fill} edges={["top"]}>
        <View style={styles.pad}>
          <ChartHeader
            title="Transits"
            subtitle={
              usingFixture
                ? `${formatCivilLabel(civil, natal.tz)} · Fixture A`
                : formatCivilLabel(civil, natal.tz)
            }
          />
        </View>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
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
            Choreography · whole-sign from Lagna
          </Text>
          <TransitDay natal={natal} at={at} />
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
