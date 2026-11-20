import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { OnboardingChrome } from "@/components/onboarding/OnboardingChrome";
import { WheelColumn } from "@/components/onboarding/WheelColumn";
import { useTheme } from "@/theme";
import { useOnboardingStore } from "@/lib/store/onboarding";

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * A6 — Birth date.
 */
export default function OnboardingDateScreen() {
  const router = useRouter();
  const { colors, type } = useTheme();
  const stored = useOnboardingStore((s) => s.date);
  const setDate = useOnboardingStore((s) => s.setDate);
  const meta = type("meta");

  const now = new Date();
  const initial = stored ?? "1990-08-15";
  const [y, m, d] = initial.split("-").map(Number);
  const [year, setYear] = useState(String(y ?? 1990));
  const [month, setMonth] = useState(pad2(m ?? 8));
  const [day, setDay] = useState(pad2(d ?? 15));
  const [error, setError] = useState<string | null>(null);

  const years = useMemo(() => {
    const out: string[] = [];
    for (let i = now.getFullYear(); i >= 1920; i--) out.push(String(i));
    return out;
  }, [now]);

  const months = useMemo(
    () => Array.from({ length: 12 }, (_, i) => pad2(i + 1)),
    [],
  );

  const maxDay = daysInMonth(Number(year), Number(month));
  const days = useMemo(
    () => Array.from({ length: maxDay }, (_, i) => pad2(i + 1)),
    [maxDay],
  );

  const safeDay = Number(day) > maxDay ? pad2(maxDay) : day;

  const onContinue = () => {
    const date = `${year}-${month}-${safeDay}`;
    const picked = new Date(`${date}T12:00:00`);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (Number.isNaN(picked.getTime()) || picked > today) {
      setError("Choose a birth date that is not in the future.");
      return;
    }
    setError(null);
    setDate(date);
    router.push("/onboarding/time");
  };

  return (
    <OnboardingChrome
      step={1}
      title="Birth date"
      body="The sky that day is the first fact of your chart."
      primaryLabel="Continue"
      onPrimary={onContinue}
      error={error}
      testID="onboarding-date"
    >
      <View style={styles.wheels}>
        <WheelColumn
          values={months}
          value={month}
          onChange={setMonth}
          accessibilityLabel="Birth month"
          width={64}
        />
        <WheelColumn
          values={days}
          value={safeDay}
          onChange={setDay}
          accessibilityLabel="Birth day"
          width={64}
        />
        <WheelColumn
          values={years}
          value={year}
          onChange={setYear}
          accessibilityLabel="Birth year"
          width={88}
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
        {year}-{month}-{safeDay}
      </Text>
    </OnboardingChrome>
  );
}

const styles = StyleSheet.create({
  wheels: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    alignItems: "center",
  },
});
