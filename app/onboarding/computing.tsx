import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { OnboardingChrome } from "@/components/onboarding/OnboardingChrome";
import { LensOrb } from "@/components/brand/LensOrb";
import { Button } from "@/components/ui/Button";
import { track } from "@/lib/analytics";
import { useTheme } from "@/theme";
import {
  COMPUTE_STAGES,
  runOnboardingCompute,
  type ComputeStageId,
} from "@/lib/onboarding/run-compute";
import { saveChartPayload } from "@/lib/session/chart-db";
import { markChartComputed } from "@/lib/session/auth";
import { useChartStore } from "@/lib/store/chart";
import { useOnboardingStore } from "@/lib/store/onboarding";
import { errorCopy } from "@/lib/errors/catalog";

/**
 * A10 — Honest compute ritual: resolve → natal → dasha → weather.
 */
export default function OnboardingComputingScreen() {
  const router = useRouter();
  const { colors, type } = useTheme();
  const body = type("body");
  const bodySm = type("bodySm");
  const meta = type("meta");

  const date = useOnboardingStore((s) => s.date);
  const time = useOnboardingStore((s) => s.time);
  const timeUnknown = useOnboardingStore((s) => s.timeUnknown);
  const place = useOnboardingStore((s) => s.place);
  const resetDraft = useOnboardingStore((s) => s.reset);
  const setComputed = useChartStore((s) => s.setComputed);

  const [active, setActive] = useState<ComputeStageId | null>(null);
  const [done, setDone] = useState<Set<ComputeStageId>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const started = useRef(false);

  const run = async () => {
    if (!date || !place) {
      router.replace("/onboarding/date");
      return;
    }
    setError(null);
    setRunning(true);
    setDone(new Set());
    setActive(null);
    try {
      const { birth, natal } = await runOnboardingCompute(
        { date, time, timeUnknown, place },
        ({ stage, done: isDone }) => {
          setActive(stage);
          if (isDone) {
            setDone((prev) => new Set(prev).add(stage));
          }
        },
      );
      setComputed(birth, natal);
      await saveChartPayload(birth, natal);
      await markChartComputed(true);
      track("chart_computed");
      const returnToSettings =
        useOnboardingStore.getState().source === "settings-recompute";
      resetDraft();
      if (!returnToSettings) {
        track("onboarding_completed");
      }
      router.replace(
        returnToSettings ? "/(app)/sky" : "/paywall/welcome",
      );
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : errorCopy("compute_fail").body;
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
      step={4}
      stepLabel="Compute"
      title="Computing"
      body="Resolve → natal → dasha → weather. No fluff — real stages."
      primaryLabel={error ? "Retry" : running ? "Computing…" : "Done"}
      primaryTestID="onboarding-computing"
      onPrimary={() => {
        if (error) void run();
      }}
      primaryDisabled={!error}
      primaryLoading={running && !error}
      showBack={!running}
      error={null}
      testID="onboarding-computing-screen"
    >
      <View style={styles.center}>
        <LensOrb size={72} state={error ? "alert" : "reading"} />
        <View style={styles.stages}>
          {COMPUTE_STAGES.map((s) => {
            const isDone = done.has(s.id);
            const isActive = active === s.id && !isDone;
            const color = isDone
              ? colors.positive
              : isActive
                ? colors.accent
                : colors.text3;
            return (
              <View key={s.id} style={styles.stageRow}>
                <Text
                  style={{
                    fontFamily: meta.fontFamily,
                    fontSize: meta.fontSize,
                    letterSpacing: meta.letterSpacing,
                    color,
                    textTransform: "uppercase",
                    width: 72,
                  }}
                >
                  {isDone ? "Done" : isActive ? "Now" : "Wait"}
                </Text>
                <Text
                  style={{
                    flex: 1,
                    fontFamily: body.fontFamily,
                    fontSize: body.fontSize,
                    color: isDone || isActive ? colors.text1 : colors.text3,
                  }}
                >
                  {s.label}
                </Text>
              </View>
            );
          })}
        </View>
        {error ? (
          <View style={styles.errBlock}>
            <Text
              style={{
                fontFamily: bodySm.fontFamily,
                fontSize: bodySm.fontSize,
                color: colors.critical,
                textAlign: "center",
              }}
              accessibilityRole="alert"
            >
              {error}
            </Text>
            <Button label="Retry" onPress={() => void run()} />
          </View>
        ) : null}
      </View>
    </OnboardingChrome>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    paddingTop: 12,
  },
  stages: {
    marginTop: 36,
    width: "100%",
    gap: 16,
  },
  stageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  errBlock: {
    marginTop: 28,
    width: "100%",
    gap: 16,
    alignItems: "center",
  },
});
