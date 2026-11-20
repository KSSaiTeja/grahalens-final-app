import React from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Hairline } from "@/components/ui/Hairline";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { useChartStore } from "@/lib/store/chart";
import { useOnboardingStore } from "@/lib/store/onboarding";
import { space, useTheme } from "@/theme";

function Fact({ label, value }: { label: string; value: string }) {
  const { colors, type } = useTheme();
  const meta = type("meta");
  const body = type("body");
  return (
    <View style={styles.fact}>
      <Text
        style={{
          fontFamily: meta.fontFamily,
          fontSize: meta.fontSize,
          letterSpacing: meta.letterSpacing,
          color: colors.text3,
          textTransform: "uppercase",
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          marginTop: 6,
          fontFamily: body.fontFamily,
          fontSize: body.fontSize,
          color: colors.text1,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

/**
 * X3 — Edit birth → confirm recompute via onboarding wizard.
 */
export default function BirthSettingsScreen() {
  const router = useRouter();
  const { colors, fontsLoaded, type } = useTheme();
  const birth = useChartStore((s) => s.birth);
  const setDate = useOnboardingStore((s) => s.setDate);
  const setTime = useOnboardingStore((s) => s.setTime);
  const setPlace = useOnboardingStore((s) => s.setPlace);
  const setSource = useOnboardingStore((s) => s.setSource);
  const title = type("title");
  const body = type("body");
  const bodySm = type("bodySm");

  const startEdit = () => {
    Alert.alert(
      "Recompute chart?",
      "Editing birth facts re-runs natal, dasha, and sky from scratch. Journal, memories, and Bonds stay.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Edit birth",
          onPress: () => {
            if (birth) {
              setDate(birth.date);
              setTime(birth.time, !!birth.timeUnknown);
              setPlace({
                label: birth.placeLabel,
                lat: birth.lat,
                lng: birth.lng,
                tz: birth.tz,
              });
            }
            setSource("settings-recompute");
            router.push("/onboarding/date" as Href);
          },
        },
      ],
    );
  };

  if (!fontsLoaded) {
    return <View style={[styles.fill, { backgroundColor: colors.void }]} />;
  }

  const timeLabel = birth
    ? birth.timeUnknown
      ? "Unknown · noon (Lagna approximate)"
      : (birth.time ?? "—")
    : "—";

  return (
    <AtmosphericBackground atmosphere="neutral">
      <SafeAreaView style={styles.fill} edges={["top"]} testID="settings-birth">
        <ScreenHeader
          title="Birth"
          subtitle="Source for the ephemeris"
          onBack={() => router.back()}
        />
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {birth ? (
            <GlassPanel style={styles.card}>
              <Fact label="Date" value={birth.date} />
              <Hairline />
              <Fact label="Time" value={timeLabel} />
              <Hairline />
              <Fact label="Place" value={birth.placeLabel} />
              <Hairline />
              <Fact
                label="Coordinates"
                value={`${birth.lat.toFixed(4)}, ${birth.lng.toFixed(4)} · ${birth.tz}`}
              />
            </GlassPanel>
          ) : (
            <GlassPanel style={styles.card}>
              <Text
                style={{
                  fontFamily: title.fontFamily,
                  fontSize: 22,
                  lineHeight: 28,
                  color: colors.text1,
                }}
              >
                No birth on device
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
                Complete onboarding to compute a natal chart, or start the birth
                wizard now.
              </Text>
            </GlassPanel>
          )}

          <Button
            testID="birth-edit"
            label={birth ? "Edit birth facts" : "Enter birth facts"}
            onPress={startEdit}
            style={styles.cta}
          />
          <Text
            style={{
              marginTop: space.md,
              fontFamily: bodySm.fontFamily,
              fontSize: bodySm.fontSize,
              lineHeight: bodySm.lineHeight,
              color: colors.text3,
              textAlign: "center",
            }}
          >
            You will confirm facts before compute. Settings edits skip the soft
            paywall and return to Sky.
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
  fact: {
    paddingVertical: space.sm,
  },
  cta: {
    marginTop: space.xl,
    alignSelf: "stretch",
  },
});
