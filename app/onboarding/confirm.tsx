import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { OnboardingChrome } from "@/components/onboarding/OnboardingChrome";
import { Hairline } from "@/components/ui/Hairline";
import { useTheme } from "@/theme";
import { useOnboardingStore } from "@/lib/store/onboarding";

function Fact({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
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
 * A9 — Review birth facts before compute.
 */
export default function OnboardingConfirmScreen() {
  const router = useRouter();
  const { colors, type } = useTheme();
  const date = useOnboardingStore((s) => s.date);
  const time = useOnboardingStore((s) => s.time);
  const timeUnknown = useOnboardingStore((s) => s.timeUnknown);
  const place = useOnboardingStore((s) => s.place);
  const bodySm = type("bodySm");

  useEffect(() => {
    if (!date || !place) router.replace("/onboarding/date");
  }, [date, place, router]);

  if (!date || !place) {
    return null;
  }

  const timeLabel = timeUnknown
    ? "Unknown · noon (Lagna approximate)"
    : (time ?? "—");

  return (
    <OnboardingChrome
      step={4}
      stepLabel="Review"
      title="Confirm birth facts"
      body="These feed the ephemeris. You can edit later in Settings."
      primaryLabel="Compute chart"
      primaryTestID="onboarding-compute"
      onPrimary={() => router.push("/onboarding/computing")}
      testID="onboarding-confirm"
      banner={
        timeUnknown
          ? "Birth time unknown — houses and Lagna will be marked approximate."
          : null
      }
    >
      <View style={styles.card}>
        <Fact label="Date" value={date} />
        <Hairline />
        <Fact label="Time" value={timeLabel} />
        <Hairline />
        <Fact label="Place" value={place.label} />
        <Hairline />
        <Fact
          label="Coordinates"
          value={`${place.lat.toFixed(4)}, ${place.lng.toFixed(4)} · ${place.tz}`}
        />
      </View>
      <Text
        style={{
          marginTop: 16,
          fontFamily: bodySm.fontFamily,
          fontSize: bodySm.fontSize,
          color: colors.text3,
        }}
      >
        Free tier keeps a preview observatory. Private unlocks deeper Lens and Soul.
      </Text>
    </OnboardingChrome>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 0,
  },
  fact: {
    paddingVertical: 14,
  },
});
