import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";

import { OnboardingChrome } from "@/components/onboarding/OnboardingChrome";
import { WheelColumn } from "@/components/onboarding/WheelColumn";
import { useBondDraftStore } from "@/lib/store/bond-draft";
import { useTheme } from "@/theme";

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

export default function BondAddTimeScreen() {
  const router = useRouter();
  const { colors, type } = useTheme();
  const meta = type("meta");
  const label = useBondDraftStore((s) => s.label);
  const date = useBondDraftStore((s) => s.date);
  const storedTime = useBondDraftStore((s) => s.time);
  const setTime = useBondDraftStore((s) => s.setTime);

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
    if (!label || !date) router.replace("/(app)/bonds/add" as Href);
  }, [label, date, router]);

  if (!label || !date) return null;

  const onContinue = () => {
    setTime(`${hour}:${minute}`, false);
    router.push("/(app)/bonds/add/place" as Href);
  };

  const onUnknown = () => {
    setTime(null, true);
    router.push("/(app)/bonds/add/place" as Href);
  };

  return (
    <OnboardingChrome
      step={3}
      totalSteps={5}
      title="Their birth time"
      body="Exact time sharpens houses and Lagna. Unknown time uses local noon and marks rising as approximate."
      primaryLabel="Continue"
      onPrimary={onContinue}
      secondaryLabel="I don’t know"
      onSecondary={onUnknown}
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
