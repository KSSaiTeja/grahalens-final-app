import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";

import { OnboardingChrome } from "@/components/onboarding/OnboardingChrome";
import { Hairline } from "@/components/ui/Hairline";
import { useBondDraftStore } from "@/lib/store/bond-draft";
import { useTheme } from "@/theme";

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

export default function BondAddConfirmScreen() {
  const router = useRouter();
  const { colors, type } = useTheme();
  const bodySm = type("bodySm");
  const label = useBondDraftStore((s) => s.label);
  const date = useBondDraftStore((s) => s.date);
  const time = useBondDraftStore((s) => s.time);
  const timeUnknown = useBondDraftStore((s) => s.timeUnknown);
  const place = useBondDraftStore((s) => s.place);

  useEffect(() => {
    if (!label || !date || !place) {
      router.replace("/(app)/bonds/add" as Href);
    }
  }, [label, date, place, router]);

  if (!label || !date || !place) return null;

  const timeLabel = timeUnknown
    ? "Unknown · noon (Lagna approximate)"
    : (time ?? "—");

  return (
    <OnboardingChrome
      step={5}
      totalSteps={5}
      stepLabel="Review"
      title="Confirm their facts"
      body="These feed the ephemeris for this bond. Synastry computes next."
      primaryLabel="Compute bond"
      onPrimary={() => router.push("/(app)/bonds/add/computing" as Href)}
      banner={
        timeUnknown
          ? "Time unknown — Lagna and houses are approximate."
          : null
      }
    >
      <Fact label="Name" value={label} />
      <Hairline />
      <Fact label="Date" value={date} />
      <Hairline />
      <Fact label="Time" value={timeLabel} />
      <Hairline />
      <Fact label="Place" value={place.label} />
      <Text
        style={{
          marginTop: 16,
          fontFamily: bodySm.fontFamily,
          fontSize: bodySm.fontSize,
          color: colors.text3,
        }}
      >
        {place.lat.toFixed(2)}, {place.lng.toFixed(2)} · {place.tz}
      </Text>
    </OnboardingChrome>
  );
}

const styles = StyleSheet.create({
  fact: {
    paddingVertical: 14,
  },
});
