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

import { BigThreePeek } from "@/components/billing/BigThreePeek";
import { LockGlyph } from "@/components/billing/LockGlyph";
import { ChartHeader } from "@/components/chart";
import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
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

/** C7 — grounded "who you are" portrait from chart signatures. */
export default function CosmicProfileScreen() {
  const router = useRouter();
  const { natal, usingFixture } = useResolvedNatal();
  const { colors, fontsLoaded, type } = useTheme();
  const [portrait, setPortrait] = useState<SoulCartography | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const title = type("title");
  const body = type("body");
  const bodySm = type("bodySm");
  const meta = type("meta");
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
    const gate = requirePrivate("cosmic_profile");
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
        <View style={styles.pad}>
          <ChartHeader
            title="Cosmic profile"
            subtitle={`Who you are in the chart${usingFixture ? " · Fixture A" : ""}`}
          />
        </View>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <BigThreePeek natal={natal} />

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
                Reading computed chart signatures…
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
                The profile could not be assembled from this chart.
              </Text>
              <Button
                label="Try again"
                variant="secondary"
                onPress={() => setAttempt((value) => value + 1)}
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
                  Your chart voice
                </Text>
                <Text
                  style={{
                    fontFamily: title.fontFamily,
                    fontSize: 24,
                    lineHeight: 30,
                    color: colors.text1,
                  }}
                >
                  A portrait, not a verdict
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
                <View style={styles.signatures}>
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
                    accessibilityLabel="Open the full cosmic profile with Private"
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
                    Your full portrait and strongest signatures are Private.
                  </Text>
                  <Button
                    testID="cosmic-profile-gate-cta"
                    label="Open with Private"
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
  pad: { paddingHorizontal: 24 },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 48,
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
