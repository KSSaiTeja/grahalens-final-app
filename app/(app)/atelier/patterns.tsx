import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { LockGlyph } from "@/components/billing/LockGlyph";
import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import {
  buildPatternThread,
  JOURNAL_MOOD_LABELS,
  useJournalListQuery,
} from "@/lib/atelier";
import {
  requirePrivate,
  useIsPrivate,
} from "@/lib/billing/entitlements";
import { useResolvedNatal } from "@/lib/sky/resolve-natal";
import { computeSkyWeather } from "@/lib/sky/sky-weather";
import { space, useTheme } from "@/theme";

/**
 * R6 — Weekly Pattern Thread. GATE for free; Private unlocks thread.
 */
export default function PatternsScreen() {
  const router = useRouter();
  const { natal } = useResolvedNatal();
  const { colors, fontsLoaded, type } = useTheme();
  const title = type("title");
  const body = type("body");
  const bodySm = type("bodySm");
  const meta = type("meta");
  const journal = useJournalListQuery();
  const isPrivate = useIsPrivate();

  const weather = useMemo(() => computeSkyWeather(natal, new Date()), [natal]);
  const thread = useMemo(
    () =>
      buildPatternThread({
        entries: journal.data ?? [],
        weather,
        isPrivate,
      }),
    [journal.data, weather, isPrivate],
  );

  const openPaywall = () => {
    const gate = requirePrivate("patterns");
    if (!gate.allowed) {
      router.push(gate.href as Href);
    }
  };

  if (!fontsLoaded) {
    return <View style={[styles.fill, { backgroundColor: colors.void }]} />;
  }

  return (
    <AtmosphericBackground atmosphere="neutral">
      <SafeAreaView style={styles.fill} edges={["top"]}>
        <ScreenHeader
          title="Pattern Thread"
          subtitle="Weekly braid"
          onBack={() => router.back()}
        />
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {!isPrivate || !thread ? (
            <GlassPanel style={styles.locked}>
              <LockGlyph
                size={22}
                onPress={openPaywall}
                accessibilityLabel="Unlock Pattern Thread with Private"
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
                Pattern Thread is Private
              </Text>
              <Text
                style={{
                  marginTop: space.sm,
                  fontFamily: body.fontFamily,
                  fontSize: body.fontSize,
                  lineHeight: body.lineHeight,
                  color: colors.text2,
                  textAlign: "center",
                }}
              >
                When unlocked, this page braids your journal moods with the
                week’s sky — no invented lore, only what you wrote and what the
                ephemeris computed.
              </Text>
              <Button
                testID="patterns-gate-cta"
                label="Open with Private"
                onPress={openPaywall}
                style={styles.cta}
              />
            </GlassPanel>
          ) : (
            <>
              <Text
                style={{
                  fontFamily: meta.fontFamily,
                  fontSize: 10,
                  letterSpacing: meta.letterSpacing,
                  color: colors.text3,
                  textTransform: "uppercase",
                }}
              >
                {thread.weekLabel}
                {thread.dominantMood
                  ? ` · ${JOURNAL_MOOD_LABELS[thread.dominantMood]}`
                  : ""}
              </Text>
              <Text
                style={{
                  marginTop: space.sm,
                  fontFamily: title.fontFamily,
                  fontSize: 26,
                  lineHeight: 32,
                  color: colors.text1,
                }}
              >
                This week’s grain
              </Text>
              {thread.paragraphs.map((paragraph, index) => (
                <Text
                  key={index}
                  style={{
                    marginTop: space.md,
                    fontFamily: body.fontFamily,
                    fontSize: body.fontSize,
                    lineHeight: body.lineHeight + 2,
                    color: colors.text1,
                  }}
                >
                  {paragraph}
                </Text>
              ))}
              <GlassPanel style={styles.counts}>
                <Text
                  style={{
                    fontFamily: meta.fontFamily,
                    fontSize: 10,
                    letterSpacing: meta.letterSpacing,
                    color: colors.text3,
                    textTransform: "uppercase",
                    marginBottom: space.sm,
                  }}
                >
                  Mood counts · {thread.entryCount} notes
                </Text>
                {(
                  Object.keys(thread.moodCounts) as Array<
                    keyof typeof thread.moodCounts
                  >
                ).map((mood) => (
                  <Text
                    key={mood}
                    style={{
                      fontFamily: bodySm.fontFamily,
                      fontSize: bodySm.fontSize,
                      lineHeight: bodySm.lineHeight,
                      color: colors.text2,
                      marginTop: 4,
                    }}
                  >
                    {JOURNAL_MOOD_LABELS[mood]} · {thread.moodCounts[mood]}
                  </Text>
                ))}
              </GlassPanel>
            </>
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
  locked: {
    marginTop: space.md,
    alignItems: "center",
    borderRadius: 28,
  },
  cta: {
    alignSelf: "stretch",
    marginTop: space.lg,
  },
  counts: {
    marginTop: space.xl,
    borderRadius: 24,
  },
});
