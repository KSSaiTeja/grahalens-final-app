import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { OnboardingChrome } from "@/components/onboarding/OnboardingChrome";
import { WheelColumn } from "@/components/onboarding/WheelColumn";
import { useTheme } from "@/theme";
import { useOnboardingStore } from "@/lib/store/onboarding";

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

/**
 * A7 — Birth time + honest “I don’t know” (PRD §11 approximate banner later).
 */
export default function OnboardingTimeScreen() {
  const router = useRouter();
  const { colors, type } = useTheme();
  const storedTime = useOnboardingStore((s) => s.time);
  const setTime = useOnboardingStore((s) => s.setTime);
  const date = useOnboardingStore((s) => s.date);
  const meta = type("meta");

  const initial = storedTime ?? "12:00";
  const [hh, mm] = initial.split(":");
  const [hour, setHour] = useState(hh ?? "12");
  const [minute, setMinute] = useState(mm ?? "00");

  const hours = useMemo(
    () => Array.from({ length: 24 }, (_, i) => pad2(i)),
    [],
  );
  const minutes = useMemo(
    () => Array.from({ length: 60 }, (_, i) => pad2(i)),
    [],
  );

  useEffect(() => {
    if (!date) router.replace("/onboarding/date");
  }, [date, router]);

  if (!date) {
    return null;
  }

  const onContinue = () => {
    setTime(`${hour}:${minute}`, false);
    router.push("/onboarding/place");
  };

  const onUnknown = () => {
    setTime(null, true);
    router.push("/onboarding/place");
  };

  return (
    <OnboardingChrome
      step={2}
      title="Birth time"
      body="Exact time sharpens houses and Lagna. If you don’t know, we use local noon and mark the rising sign as approximate."
      primaryLabel="Continue"
      onPrimary={onContinue}
      secondaryLabel="I don’t know"
      onSecondary={onUnknown}
      testID="onboarding-time"
    >
      <View style={styles.wheels}>
        <WheelColumn
          values={hours}
          value={hour}
          onChange={setHour}
          accessibilityLabel="Birth hour"
          width={72}
        />
        <Text
          style={{
            fontFamily: meta.fontFamily,
            fontSize: 28,
            color: colors.text2,
            marginHorizontal: 4,
          }}
        >
          :
        </Text>
        <WheelColumn
          values={minutes}
          value={minute}
          onChange={setMinute}
          accessibilityLabel="Birth minute"
          width={72}
        />
      </View>
      <Text
        style={{
          marginTop: 20,
          textAlign: "center",
          fontFamily: meta.fontFamily,
          fontSize: meta.fontSize,
          letterSpacing: meta.letterSpacing,
          color: colors.text3,
          textTransform: "uppercase",
        }}
      >
        {hour}:{minute} · 24-hour
      </Text>
    </OnboardingChrome>
  );
}

const styles = StyleSheet.create({
  wheels: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});
