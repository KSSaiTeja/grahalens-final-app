import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter, type Href } from "expo-router";

import { OnboardingChrome } from "@/components/onboarding/OnboardingChrome";
import { WheelColumn } from "@/components/onboarding/WheelColumn";
import { useBondDraftStore } from "@/lib/store/bond-draft";

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export default function BondAddDateScreen() {
  const router = useRouter();
  const label = useBondDraftStore((s) => s.label);
  const stored = useBondDraftStore((s) => s.date);
  const setDate = useBondDraftStore((s) => s.setDate);

  const now = new Date();
  const initial = stored ?? "1990-08-15";
  const [y, m, d] = initial.split("-").map(Number);
  const [year, setYear] = useState(String(y ?? 1990));
  const [month, setMonth] = useState(pad2(m ?? 8));
  const [day, setDay] = useState(pad2(d ?? 15));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!label) router.replace("/(app)/bonds/add" as Href);
  }, [label, router]);

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

  if (!label) return null;

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
    router.push("/(app)/bonds/add/time" as Href);
  };

  return (
    <OnboardingChrome
      step={2}
      totalSteps={5}
      title="Their birth date"
      body={`The sky that day for ${label} is the first fact of this bond.`}
      primaryLabel="Continue"
      onPrimary={onContinue}
      error={error}
    >
      <View style={styles.wheels}>
        <WheelColumn
          values={months}
          value={month}
          onChange={setMonth}
          accessibilityLabel="Birth month"
          width={72}
        />
        <WheelColumn
          values={days}
          value={safeDay}
          onChange={setDay}
          accessibilityLabel="Birth day"
          width={72}
        />
        <WheelColumn
          values={years}
          value={year}
          onChange={setYear}
          accessibilityLabel="Birth year"
          width={88}
        />
      </View>
    </OnboardingChrome>
  );
}

const styles = StyleSheet.create({
  wheels: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
});
