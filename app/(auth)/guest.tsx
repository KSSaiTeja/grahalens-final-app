import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowRight } from "lucide-react-native";

import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { LensOrb } from "@/components/brand/LensOrb";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { useTheme } from "@/theme";
import {
  continueAsGuest,
  decidePostSplashRoute,
  hrefForDestination,
  useSession,
} from "@/lib/session";
import { useIsPrivate } from "@/lib/billing/entitlements";

/**
 * A5 — Continue without account (local observatory + SQLite guest flag).
 */
export default function GuestScreen() {
  const { colors, type, fontsLoaded } = useTheme();
  const router = useRouter();
  const { hasChart, skippedWelcomePaywall } = useSession();
  const isPrivate = useIsPrivate();
  const [loading, setLoading] = useState(false);

  const title = type("displayL");
  const body = type("body");

  const onContinue = async () => {
    setLoading(true);
    try {
      await continueAsGuest();
      const dest = decidePostSplashRoute({
        mode: "guest",
        hasChart,
        hasSeenWelcome: true,
        skippedWelcomePaywall,
        isPrivate,
      });
      router.replace(hrefForDestination(dest));
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) {
    return <View style={[styles.fill, { backgroundColor: colors.void }]} />;
  }

  return (
    <AtmosphericBackground atmosphere="neutral">
      <SafeAreaView
        style={styles.fill}
        edges={["top", "bottom"]}
        testID="guest-home"
      >
        <ScreenHeader title="Continue locally" onBack={() => router.back()} />

        <View style={styles.center}>
          <LensOrb size={64} state="idle" />
          <GlassPanel floating style={styles.panel}>
            <Text
              style={{
                fontFamily: title.fontFamily,
                fontSize: title.fontSize,
                lineHeight: title.lineHeight,
                color: colors.text1,
                textAlign: "center",
              }}
            >
              A private observatory, on this device.
            </Text>
            <Text
              style={{
                marginTop: 16,
                fontFamily: body.fontFamily,
                fontSize: body.fontSize,
                lineHeight: body.lineHeight,
                color: colors.text2,
                textAlign: "center",
              }}
            >
              Continue without an account. Your chart stays on this device until
              you sign in and sync.
            </Text>
          </GlassPanel>
        </View>

        <View style={styles.footer}>
          <Button
            label="Continue as guest"
            icon={ArrowRight}
            onPress={onContinue}
            loading={loading}
            testID="guest-continue"
          />
          <Button
            label="Sign in instead"
            variant="ghost"
            onPress={() => router.push("/(auth)/sign-in")}
            disabled={loading}
          />
        </View>
      </SafeAreaView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  panel: {
    marginTop: 28,
    width: "100%",
    maxWidth: 360,
    paddingVertical: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 12,
    gap: 12,
  },
});
