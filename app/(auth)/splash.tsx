import React, { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { Redirect, useRouter } from "expo-router";

import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { Wordmark } from "@/components/brand/Wordmark";
import { LensOrb } from "@/components/brand/LensOrb";
import { useTheme } from "@/theme";
import {
  useSession,
  decidePostSplashRoute,
  hrefForDestination,
} from "@/lib/session";
import { useIsPrivate } from "@/lib/billing/entitlements";

const SPLASH_HOLD_MS = 1400;

/**
 * A1 — Brand mark + breathe orb → route decision.
 */
export default function SplashScreen() {
  const { colors, fontsLoaded } = useTheme();
  const {
    hydrated,
    mode,
    hasChart,
    hasSeenWelcome,
    skippedWelcomePaywall,
  } = useSession();
  const isPrivate = useIsPrivate();
  const router = useRouter();
  const navigated = useRef(false);

  useEffect(() => {
    if (!fontsLoaded || !hydrated || navigated.current) return;

    const dest = decidePostSplashRoute({
      mode,
      hasChart,
      hasSeenWelcome,
      skippedWelcomePaywall,
      isPrivate,
    });
    const timer = setTimeout(() => {
      if (navigated.current) return;
      navigated.current = true;
      router.replace(hrefForDestination(dest));
    }, SPLASH_HOLD_MS);

    return () => clearTimeout(timer);
  }, [
    fontsLoaded,
    hydrated,
    mode,
    hasChart,
    hasSeenWelcome,
    skippedWelcomePaywall,
    isPrivate,
    router,
  ]);

  if (!fontsLoaded) {
    return <View style={[styles.fill, { backgroundColor: colors.void }]} />;
  }

  if (hydrated && mode !== "anonymous" && navigated.current) {
    const dest = decidePostSplashRoute({
      mode,
      hasChart,
      hasSeenWelcome,
      skippedWelcomePaywall,
      isPrivate,
    });
    return <Redirect href={hrefForDestination(dest)} />;
  }

  return (
    <AtmosphericBackground atmosphere="calm">
      <View
        style={styles.fill}
        accessibilityRole="summary"
        accessibilityLabel="grahalens splash"
      >
        <View style={styles.center}>
          <LensOrb size={72} state="idle" />
          <View style={styles.mark}>
            <Wordmark size={40} />
          </View>
        </View>
      </View>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  mark: {
    marginTop: 32,
  },
});
