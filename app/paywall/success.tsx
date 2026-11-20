import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Check } from "lucide-react-native";
import * as Haptics from "expo-haptics";

import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { Button } from "@/components/ui/Button";
import { markWelcomePaywallSkipped } from "@/lib/session";
import { useTheme, space } from "@/theme";

export default function PaywallSuccessScreen() {
  const router = useRouter();
  const { colors, type } = useTheme();
  const title = type("displayL");
  const body = type("body");

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {},
    );
    void markWelcomePaywallSkipped(true);
  }, []);

  return (
    <AtmosphericBackground atmosphere="calm">
      <SafeAreaView
        style={styles.fill}
        edges={["top", "bottom"]}
        testID="paywall-success"
      >
        <View style={styles.center}>
          <View
            style={[styles.checkCircle, { backgroundColor: colors.accentSoft }]}
          >
            <Check size={32} color={colors.accent} strokeWidth={2.4} />
          </View>
          <Text
            style={{
              marginTop: 28,
              fontFamily: title.fontFamily,
              fontSize: 26,
              lineHeight: 32,
              letterSpacing: title.letterSpacing,
              color: colors.text1,
              textAlign: "center",
            }}
          >
            Welcome to Private.
          </Text>
          <Text
            style={{
              marginTop: 12,
              fontFamily: body.fontFamily,
              fontSize: body.fontSize,
              lineHeight: body.lineHeight,
              color: colors.text2,
              textAlign: "center",
              paddingHorizontal: 32,
            }}
          >
            The full observatory is open. Every chart, every domain, every thread
            — yours.
          </Text>
        </View>
        <View style={styles.footer}>
          <Button
            testID="paywall-success-enter"
            label="Enter the observatory"
            onPress={() => router.replace("/(app)/sky")}
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
    paddingHorizontal: 24,
  },
  checkCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: space.lg,
  },
});
