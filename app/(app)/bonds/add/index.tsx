import React, { useState } from "react";
import { StyleSheet, TextInput } from "react-native";
import { useRouter, type Href } from "expo-router";

import { OnboardingChrome } from "@/components/onboarding/OnboardingChrome";
import {
  requirePrivate,
  useIsPrivate,
} from "@/lib/billing/entitlements";
import { track } from "@/lib/analytics";
import { useCanAddBond } from "@/lib/bonds";
import { useBondDraftStore } from "@/lib/store/bond-draft";
import { radii, space, useTheme } from "@/theme";

/** B2 — Name step. Gate second bond before the wizard starts. */
export default function BondAddNameScreen() {
  const router = useRouter();
  const { colors, type } = useTheme();
  const body = type("body");
  const stored = useBondDraftStore((s) => s.label);
  const setLabel = useBondDraftStore((s) => s.setLabel);
  const [value, setValue] = useState(stored ?? "");
  const [error, setError] = useState<string | null>(null);
  const isPrivate = useIsPrivate();
  const { canAdd } = useCanAddBond(isPrivate);

  const onContinue = () => {
    if (!canAdd) {
      const gate = requirePrivate("bond_limit");
      if (!gate.allowed) {
        track("bond_gate_hit", { reason: "bond_limit" });
        router.push(gate.href as Href);
      }
      return;
    }
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Give this bond a name.");
      return;
    }
    setError(null);
    setLabel(trimmed);
    router.push("/(app)/bonds/add/date" as Href);
  };

  return (
    <OnboardingChrome
      step={1}
      totalSteps={5}
      title="Who belongs in your sky?"
      body="A first name is enough. This label stays on device with the bond."
      primaryLabel="Continue"
      onPrimary={onContinue}
      error={error}
    >
      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder="Name"
        placeholderTextColor={colors.text3}
        autoCapitalize="words"
        autoCorrect={false}
        maxLength={48}
        accessibilityLabel="Bond name"
        style={[
          styles.input,
          {
            color: colors.text1,
            borderColor: colors.hairline,
            backgroundColor: "rgba(255,255,255,0.55)",
            fontFamily: body.fontFamily,
            fontSize: body.fontSize,
          },
        ]}
      />
    </OnboardingChrome>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.lg,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    minHeight: 56,
  },
});
