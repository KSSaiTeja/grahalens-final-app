import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Icon } from "@/components/icons/Icon";
import { SkyHeader, SkyWeatherField } from "@/components/sky";
import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Hairline } from "@/components/ui/Hairline";
import { civilDateInTz } from "@/lib/sky/archive";
import { computeDaySky } from "@/lib/sky/daily-notes";
import { AXIS_LABELS, WEATHER_ICON } from "@/lib/sky/format";
import { useResolvedNatal } from "@/lib/sky/resolve-natal";
import {
  WEATHER_AXES,
  WEATHER_RULE_CATALOG,
  shouldWeatherDrift,
} from "@/lib/sky/sky-weather";
import { useTheme, space } from "@/theme";

/**
 * S2 — Full weather axes + rule explanations from WEATHER_RULE_CATALOG.
 */
export default function SkyWeatherScreen() {
  const { colors, fontsLoaded, type } = useTheme();
  const meta = type("meta");
  const body = type("body");
  const title = type("title");
  const { natal, usingFixture } = useResolvedNatal();

  const today = useMemo(
    () => civilDateInTz(new Date(), natal.tz),
    [natal.tz],
  );
  const day = useMemo(() => computeDaySky(natal, today), [natal, today]);
  const opening = day.weather.axes.opening.value;
  const drift = shouldWeatherDrift(day.weather);

  if (!fontsLoaded) {
    return <View style={[styles.fill, { backgroundColor: colors.void }]} />;
  }

  return (
    <AtmosphericBackground atmosphere="neutral">
      <SafeAreaView style={styles.fill} edges={["top"]}>
        <View style={styles.pad}>
          <SkyHeader
            title="Sky Weather"
            subtitle={usingFixture ? `${today} · Fixture A` : today}
          />
        </View>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <SkyWeatherField weather={day.weather} />

          {WEATHER_AXES.map((id) => {
            const axis = day.weather.axes[id];
            return (
              <View key={id} style={styles.section}>
                <View style={styles.axisHead}>
                  <Icon
                    name={WEATHER_ICON[id]}
                    size={20}
                    color={
                      id === day.weather.dominant
                        ? colors.accent
                        : colors.text1
                    }
                  />
                  <Text
                    style={{
                      marginLeft: 10,
                      fontFamily: title.fontFamily,
                      fontSize: 18,
                      color: colors.text1,
                      flex: 1,
                    }}
                  >
                    {AXIS_LABELS[id]}
                  </Text>
                  <Text
                    style={{
                      fontFamily: meta.fontFamily,
                      fontSize: 12,
                      color: colors.text2,
                    }}
                  >
                    {(axis.value * 100).toFixed(0)}
                  </Text>
                </View>

                {axis.reasons.length === 0 ? (
                  <Text
                    style={{
                      marginTop: 8,
                      fontFamily: body.fontFamily,
                      fontSize: 14,
                      color: colors.text2,
                    }}
                  >
                    Quiet on this axis today.
                  </Text>
                ) : (
                  axis.reasons.map((r, i) => {
                    const catalog = WEATHER_RULE_CATALOG[r.ruleId];
                    return (
                      <GlassPanel
                        key={`${r.ruleId}-${i}`}
                        style={styles.reason}
                      >
                        <Text
                          style={{
                            fontFamily: meta.fontFamily,
                            fontSize: 10,
                            letterSpacing: meta.letterSpacing,
                            color: colors.accent,
                            textTransform: "uppercase",
                          }}
                        >
                          {catalog?.title ?? r.ruleId}
                        </Text>
                        <Text
                          style={{
                            marginTop: 6,
                            fontFamily: body.fontFamily,
                            fontSize: body.fontSize,
                            lineHeight: body.lineHeight,
                            color: colors.text1,
                          }}
                        >
                          {catalog?.body ?? r.summary}
                        </Text>
                        <Text
                          style={{
                            marginTop: 8,
                            fontFamily: meta.fontFamily,
                            fontSize: 10,
                            color: colors.text3,
                          }}
                        >
                          {r.summary}
                          {r.weight >= 0 ? " · +" : " · "}
                          {r.weight.toFixed(2)}
                        </Text>
                      </GlassPanel>
                    );
                  })
                )}
                <Hairline style={{ marginTop: space.md }} />
              </View>
            );
          })}
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
    paddingBottom: 48,
  },
  section: {
    marginTop: 24,
  },
  axisHead: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  reason: {
    marginTop: 10,
    borderRadius: 20,
  },
});
