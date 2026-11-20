import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter, type Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { LockGlyph } from "@/components/billing/LockGlyph";
import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import {
  composeSoulCartography,
  type SoulCartography,
} from "@/lib/ai/soul-cartography";
import {
  requirePrivate,
  useIsPrivate,
} from "@/lib/billing/entitlements";
import { useResolvedNatal } from "@/lib/sky/resolve-natal";
import { space, useTheme } from "@/theme";

/**
 * R5 — Soul Cartography. Free: preview blurb. Open full → requirePrivate("soul").
 */
export default function SoulCartographyScreen() {
  const router = useRouter();
  const { natal, usingFixture } = useResolvedNatal();
  const { colors, fontsLoaded, type } = useTheme();
  const title = type("title");
  const body = type("body");
  const bodySm = type("bodySm");
  const meta = type("meta");
  const [portrait, setPortrait] = useState<SoulCartography | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const isPrivate = useIsPrivate();

  useEffect(() => {
    let active = true;
    setPortrait(null);
    setFailed(false);

    void composeSoulCartography({ natal })
      .then((result) => {
        if (active) setPortrait(result);
      })
      .catch(() => {
        if (active) setFailed(true);
      });

    return () => {
      active = false;
    };
  }, [attempt, natal]);

  const openPaywall = () => {
    const gate = requirePrivate("soul");
    if (!gate.allowed) {
      router.push(gate.href as Href);
    }
  };

  if (!fontsLoaded) {
    return <View style={[styles.fill, { backgroundColor: colors.void }]} />;
  }

  return (
    <AtmosphericBackground atmosphere="neutral">
      <SafeAreaView style={styles.fill} edges={["top"]} testID="soul-home">
        <ScreenHeader
          title="Soul Cartography"
          subtitle={
            usingFixture ? "Portrait · Fixture A" : "Portrait from your chart"
          }
          onBack={() => router.back()}
        />
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {!portrait && !failed ? (
            <GlassPanel style={styles.status}>
              <ActivityIndicator color={colors.text2} />
              <Text
                style={{
                  fontFamily: bodySm.fontFamily,
                  fontSize: bodySm.fontSize,
                  color: colors.text2,
                }}
              >
                Reading chart signatures…
              </Text>
            </GlassPanel>
          ) : null}

          {failed ? (
            <GlassPanel style={styles.status}>
              <Text
                style={{
                  fontFamily: body.fontFamily,
                  fontSize: body.fontSize,
                  lineHeight: body.lineHeight,
                  color: colors.text1,
                  textAlign: "center",
                }}
              >
                The portrait could not be assembled from this chart.
              </Text>
              <Button
                label="Try again"
                variant="secondary"
                onPress={() => setAttempt((v) => v + 1)}
                style={styles.retry}
              />
            </GlassPanel>
          ) : null}

          {portrait ? (
            <>
              <GlassPanel floating style={styles.portrait}>
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
                  {isPrivate ? "Full portrait" : "Free preview"}
                </Text>
                <Text
                  style={{
                    fontFamily: title.fontFamily,
                    fontSize: 24,
                    lineHeight: 30,
                    color: colors.text1,
                  }}
                >
                  Grain of the chart
                </Text>
                <Text
                  style={{
                    marginTop: 16,
                    fontFamily: body.fontFamily,
                    fontSize: body.fontSize,
                    lineHeight: body.lineHeight,
                    color: colors.text1,
                  }}
                >
                  {isPrivate ? portrait.prose : portrait.preview}
                </Text>
                <Text
                  style={{
                    marginTop: 14,
                    fontFamily: meta.fontFamily,
                    fontSize: 10,
                    letterSpacing: meta.letterSpacing,
                    color: colors.text3,
                    textTransform: "uppercase",
                  }}
                >
                  {portrait.source === "groq"
                    ? "Grounded narration"
                    : "Chart templates"}
                </Text>
              </GlassPanel>

              {isPrivate ? (
                <View style={styles.signatures} testID="soul-unlocked">
                  {portrait.signatures.slice(0, 5).map((signature) => (
                    <GlassPanel key={signature.id} style={styles.signature}>
                      <Text
                        style={{
                          fontFamily: title.fontFamily,
                          fontSize: 18,
                          lineHeight: 24,
                          color: colors.text1,
                        }}
                      >
                        {signature.label}
                      </Text>
                      <Text
                        style={{
                          marginTop: 8,
                          fontFamily: bodySm.fontFamily,
                          fontSize: bodySm.fontSize,
                          lineHeight: bodySm.lineHeight,
                          color: colors.text2,
                        }}
                      >
                        {signature.summary}
                      </Text>
                    </GlassPanel>
                  ))}
                </View>
              ) : (
                <GlassPanel style={styles.locked}>
                  <LockGlyph
                    size={20}
                    onPress={openPaywall}
                    accessibilityLabel="Open full Soul Cartography with Private"
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
                    The full portrait and strongest signatures open with
                    Private.
                  </Text>
                  <Button
                    testID="soul-gate-cta"
                    label="Open full"
                    onPress={openPaywall}
                    style={styles.cta}
                  />
                </GlassPanel>
              )}
            </>
          ) : null}
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
  status: {
    marginTop: space.md,
    minHeight: 148,
    alignItems: "center",
    justifyContent: "center",
    gap: space.md,
  },
  retry: {
    alignSelf: "stretch",
    marginTop: space.sm,
  },
  portrait: {
    marginTop: space.md,
    borderRadius: 28,
  },
  eyebrow: {
    fontSize: 10,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  signatures: {
    marginTop: space.md,
    gap: space.sm,
  },
  signature: {
    borderRadius: 24,
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
