import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { SkyHeader } from "@/components/sky";
import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { EmptyState } from "@/components/ui/EmptyState";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { capitalize, formatMuhurtaWindow, KIND_LABELS } from "@/lib/sky/format";
import { computeMuhurtaMoments } from "@/lib/sky/muhurta-moments";
import { civilDateInTz, noonOnCivilDate } from "@/lib/sky/archive";
import { useResolvedNatal } from "@/lib/sky/resolve-natal";
import { useTheme, space } from "@/theme";

/**
 * S3 — Single muhurta window detail.
 * Id format: `{date}:{kind}:{startHHmm}` from computeMuhurtaMoments.
 */
export default function MuhurtaDetailScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const decoded = id ? decodeURIComponent(id) : "";

  const { colors, fontsLoaded, type } = useTheme();
  const meta = type("meta");
  const body = type("body");
  const title = type("title");
  const { natal, usingFixture } = useResolvedNatal();

  const moment = useMemo(() => {
    if (!decoded) return null;
    const datePart = decoded.split(":")[0];
    if (!datePart || !/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      const today = civilDateInTz(new Date(), natal.tz);
      const day = computeMuhurtaMoments(
        natal,
        noonOnCivilDate(today, natal.tz),
      );
      return day.moments.find((m) => m.id === decoded) ?? null;
    }
    const day = computeMuhurtaMoments(
      natal,
      noonOnCivilDate(datePart, natal.tz),
    );
    return day.moments.find((m) => m.id === decoded) ?? null;
  }, [decoded, natal]);

  if (!fontsLoaded) {
    return <View style={[styles.fill, { backgroundColor: colors.void }]} />;
  }

  if (!moment) {
    return (
      <AtmosphericBackground atmosphere="neutral">
        <SafeAreaView style={styles.fill} edges={["top"]}>
          <View style={styles.pad}>
            <SkyHeader title="Muhurta" />
          </View>
          <EmptyState
            title="Window not found"
            body="That muhurta id is not on the civil day grid for this chart."
            withOrb={false}
          />
        </SafeAreaView>
      </AtmosphericBackground>
    );
  }

  return (
    <AtmosphericBackground atmosphere="neutral">
      <SafeAreaView style={styles.fill} edges={["top"]}>
        <View style={styles.pad}>
          <SkyHeader
            title={KIND_LABELS[moment.kind]}
            subtitle={
              usingFixture
                ? `${formatMuhurtaWindow(moment, natal.tz)} · Fixture A`
                : formatMuhurtaWindow(moment, natal.tz)
            }
          />
        </View>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <GlassPanel floating style={styles.featureCard}>
            <Text
              style={{
                fontFamily: meta.fontFamily,
                fontSize: 10,
                letterSpacing: meta.letterSpacing,
                color: colors.text3,
                textTransform: "uppercase",
              }}
            >
              Strength
            </Text>
            <Text
              style={{
                marginTop: 6,
                fontFamily: title.fontFamily,
                fontSize: 28,
                color: colors.text1,
              }}
            >
              {(moment.score * 100).toFixed(0)}%
            </Text>
            <Text
              style={{
                marginTop: space.md,
                fontFamily: meta.fontFamily,
                fontSize: 10,
                letterSpacing: meta.letterSpacing,
                color: colors.text3,
                textTransform: "uppercase",
              }}
            >
              Hora lord
            </Text>
            <Text
              style={{
                marginTop: 6,
                fontFamily: body.fontFamily,
                fontSize: body.fontSize,
                color: colors.text1,
              }}
            >
              {capitalize(moment.lord)}
            </Text>
          </GlassPanel>

          <Text
            style={{
              marginTop: 28,
              marginBottom: 10,
              fontFamily: meta.fontFamily,
              fontSize: 10,
              letterSpacing: meta.letterSpacing,
              color: colors.text3,
              textTransform: "uppercase",
            }}
          >
            Presses
          </Text>
          {moment.presses.length === 0 ? (
            <Text
              style={{
                fontFamily: body.fontFamily,
                fontSize: body.fontSize,
                color: colors.text2,
              }}
            >
              No transit presses tagged for this hora.
            </Text>
          ) : (
            moment.presses.map((p, i) => (
              <GlassPanel
                key={`${p.graha}-${p.house}-${i}`}
                style={styles.press}
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
                  {capitalize(p.graha)} · house {p.house}
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
                  {p.summary}
                </Text>
              </GlassPanel>
            ))
          )}

          <Text
            style={{
              marginTop: 24,
              fontFamily: meta.fontFamily,
              fontSize: 10,
              color: colors.text3,
            }}
            selectable
          >
            {moment.id}
          </Text>
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
  press: {
    marginBottom: 10,
    borderRadius: 20,
  },
  featureCard: {
    borderRadius: 28,
  },
});
