import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";

import { LensOrb } from "@/components/brand/LensOrb";
import { OnboardingChrome } from "@/components/onboarding/OnboardingChrome";
import {
  canAddBond,
  computeSynastry,
  createBondApi,
  localBondStore,
  toSynastryCachePayload,
  useBondUserId,
  useCreateBondMutation,
} from "@/lib/bonds";
import {
  requirePrivate,
  useIsPrivate,
} from "@/lib/billing/entitlements";
import { track } from "@/lib/analytics";
import {
  draftToStoredBirth,
  runOnboardingCompute,
} from "@/lib/onboarding/run-compute";
import { useBondDraftStore } from "@/lib/store/bond-draft";
import { useResolvedNatal } from "@/lib/sky/resolve-natal";
import { useTheme } from "@/theme";

type StageId = "natal" | "synastry" | "save";

const STAGES: { id: StageId; label: string }[] = [
  { id: "natal", label: "Compute their natal" },
  { id: "synastry", label: "Cross-chart domains" },
  { id: "save", label: "Save bond" },
];

/** B2 compute — natal for other + computeSynastry → cache payload. */
export default function BondAddComputingScreen() {
  const router = useRouter();
  const { colors, type } = useTheme();
  const body = type("body");
  const meta = type("meta");
  const { natal: selfNatal } = useResolvedNatal();
  const createBond = useCreateBondMutation();
  const userId = useBondUserId();
  const isPrivate = useIsPrivate();

  const label = useBondDraftStore((s) => s.label);
  const date = useBondDraftStore((s) => s.date);
  const time = useBondDraftStore((s) => s.time);
  const timeUnknown = useBondDraftStore((s) => s.timeUnknown);
  const place = useBondDraftStore((s) => s.place);
  const resetDraft = useBondDraftStore((s) => s.reset);

  const [active, setActive] = useState<StageId | null>(null);
  const [done, setDone] = useState<Set<StageId>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const started = useRef(false);

  const run = async () => {
    if (!label || !date || !place) {
      router.replace("/(app)/bonds/add" as Href);
      return;
    }
    if (!selfNatal) {
      setError("Your chart is required before adding a bond.");
      return;
    }

    setError(null);
    setRunning(true);
    setDone(new Set());
    setActive(null);

    try {
      const existing = await createBondApi(localBondStore).list(userId);
      if (!canAddBond(existing.length, isPrivate)) {
        setRunning(false);
        const gate = requirePrivate("bond_limit");
        if (!gate.allowed) {
          track("bond_gate_hit", { reason: "bond_limit" });
          router.replace(gate.href as Href);
        }
        return;
      }

      setActive("natal");
      const { natal: theirNatal } = await runOnboardingCompute({
        date,
        time,
        timeUnknown,
        place,
      });
      const theirBirth = draftToStoredBirth({
        date,
        time,
        timeUnknown,
        place,
      });
      setDone((prev) => new Set(prev).add("natal"));

      setActive("synastry");
      const report = computeSynastry(selfNatal, theirNatal);
      const synastry = toSynastryCachePayload(report);
      setDone((prev) => new Set(prev).add("synastry"));

      setActive("save");
      const bond = await createBond.mutateAsync({
        label,
        theirBirth,
        theirNatal,
        synastry,
      });
      setDone((prev) => new Set(prev).add("save"));
      resetDraft();
      router.replace(`/(app)/bonds/${bond.id}` as Href);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Bond compute failed. Try again.";
      setError(message);
      setRunning(false);
      setActive(null);
    }
  };

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <OnboardingChrome
      step={5}
      totalSteps={5}
      stepLabel="Compute"
      title="Braiding charts"
      body="Their natal → domain scores → save. Evidence before narration."
      primaryLabel={error ? "Retry" : running ? "Computing…" : "Done"}
      onPrimary={() => {
        if (error) void run();
      }}
      primaryDisabled={!error}
      primaryLoading={running && !error}
      showBack={!running}
      error={null}
    >
      <View style={styles.center}>
        <LensOrb size={72} state={error ? "alert" : "reading"} />
        <View style={styles.stages}>
          {STAGES.map((s) => {
            const isDone = done.has(s.id);
            const isActive = active === s.id;
            return (
              <Text
                key={s.id}
                style={{
                  marginTop: 10,
                  fontFamily: isActive ? body.fontFamily : meta.fontFamily,
                  fontSize: isActive ? body.fontSize : meta.fontSize,
                  color: isDone
                    ? colors.text1
                    : isActive
                      ? colors.text1
                      : colors.text3,
                }}
              >
                {isDone ? "✓ " : isActive ? "· " : "  "}
                {s.label}
              </Text>
            );
          })}
        </View>
        {error ? (
          <Text
            style={{
              marginTop: 20,
              fontFamily: body.fontFamily,
              color: colors.critical,
              textAlign: "center",
            }}
            accessibilityRole="alert"
          >
            {error}
          </Text>
        ) : null}
      </View>
    </OnboardingChrome>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    paddingTop: 24,
  },
  stages: {
    marginTop: 28,
    alignSelf: "stretch",
  },
});
