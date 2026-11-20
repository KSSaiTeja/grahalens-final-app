import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { LockGlyph } from "@/components/billing/LockGlyph";
import { ChartHeader } from "@/components/chart";
import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { GlassPanel } from "@/components/ui/GlassPanel";
import {
  requirePrivate,
  useIsPrivate,
} from "@/lib/billing/entitlements";
import {
  buildDashaDeepRead,
  findDashaPeriod,
  softGateParagraphs,
} from "@/lib/chart/deep-read";
import { computeDasha } from "@/lib/ephemeris/dasha";
import { useResolvedNatal } from "@/lib/sky/resolve-natal";
import { space, useTheme } from "@/theme";

/** C4 — selected maha/antar read. First paragraph remains free. */
export default function DashaDeepReadScreen() {
  const { key } = useLocalSearchParams<{ key: string }>();
  const router = useRouter();
  const { colors, fontsLoaded, type } = useTheme();
  const { natal, usingFixture } = useResolvedNatal();
  const body = type("body");
  const bodySm = type("bodySm");
  const meta = type("meta");
  const isPrivate = useIsPrivate();
  const timeline = useMemo(() => computeDasha(natal, 2), [natal]);
  const period = useMemo(
    () => (key ? findDashaPeriod(timeline, key) : null),
    [key, timeline],
  );
  const read = useMemo(
    () => (period ? buildDashaDeepRead(period, natal) : null),
    [natal, period],
  );
  const gated = useMemo(
    () => softGateParagraphs(read?.paragraphs ?? [], isPrivate),
    [isPrivate, read],
  );

  const openPaywall = () => {
    const gate = requirePrivate("dasha_deep_read");
    if (!gate.allowed) {
      router.push(gate.href as Href);
    }
  };

  if (!fontsLoaded) {
    return <View style={[styles.fill, { backgroundColor: colors.void }]} />;
  }

  if (!period || !read) {
    return (
      <AtmosphericBackground atmosphere="neutral">
        <SafeAreaView style={styles.fill} edges={["top"]}>
          <View style={styles.pad}>
            <ChartHeader title="Dasha read" />
          </View>
          <EmptyState
            title="Period not found"
            body="Return to the ribbon and choose a computed period."
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
          <ChartHeader
            title={read.title}
            subtitle={`${read.subtitle}${usingFixture ? " · Fixture A" : ""}`}
          />
        </View>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <GlassPanel floating style={styles.read}>
            <Text
              style={[
                styles.eyebrow,
                {
                  fontFamily: meta.fontFamily,
                  letterSpacing: meta.letterSpacing,
                  color: colors.text3,
                },
              ]}
            >
              {period.level === "maha" ? "Long rhythm" : "Inner window"}
            </Text>
            {gated.visible.map((paragraph) => (
              <Text
                key={paragraph}
                style={[
                  styles.paragraph,
                  {
                    fontFamily: body.fontFamily,
                    fontSize: body.fontSize,
                    lineHeight: body.lineHeight,
                    color: colors.text1,
                  },
                ]}
              >
                {paragraph}
              </Text>
            ))}
          </GlassPanel>

          {gated.locked.length > 0 ? (
            <GlassPanel style={styles.locked}>
              <LockGlyph
                size={20}
                onPress={openPaywall}
                accessibilityLabel="Open the rest of this dasha read with Private"
              />
              <Text
                style={{
                  marginTop: 4,
                  fontFamily: body.fontFamily,
                  fontSize: body.fontSize,
                  lineHeight: body.lineHeight,
                  color: colors.text1,
                  textAlign: "center",
                }}
              >
                The rest of this period read is Private.
              </Text>
              <Text
                style={{
                  marginTop: 6,
                  fontFamily: bodySm.fontFamily,
                  fontSize: bodySm.fontSize,
                  lineHeight: bodySm.lineHeight,
                  color: colors.text2,
                  textAlign: "center",
                }}
              >
                Open the natal placement context and the combined timing lens.
              </Text>
              <Button
                testID="dasha-gate-cta"
                label="Open with Private"
                onPress={openPaywall}
                style={styles.cta}
              />
            </GlassPanel>
          ) : null}
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
  read: {
    borderRadius: 28,
  },
  eyebrow: {
    fontSize: 10,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  paragraph: {
    marginBottom: 18,
  },
  locked: {
    marginTop: space.md,
    alignItems: "center",
  },
  cta: {
    alignSelf: "stretch",
    marginTop: space.lg,
  },
});
