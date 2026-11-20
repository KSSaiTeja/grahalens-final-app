import React from "react";
import { Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { SUPPORT_EMAIL, SUPPORT_FAQ } from "@/lib/settings/legal";
import { space, useTheme } from "@/theme";

/** X12 — FAQ + contact mailto. */
export default function SupportSettingsScreen() {
  const router = useRouter();
  const { colors, fontsLoaded, type } = useTheme();
  const title = type("title");
  const body = type("body");
  const bodySm = type("bodySm");
  const meta = type("meta");

  const openMail = () => {
    void Linking.openURL(
      `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Grahalens support")}`,
    );
  };

  if (!fontsLoaded) {
    return <View style={[styles.fill, { backgroundColor: colors.void }]} />;
  }

  return (
    <AtmosphericBackground atmosphere="neutral">
      <SafeAreaView
        style={styles.fill}
        edges={["top"]}
        testID="settings-support"
      >
        <ScreenHeader title="Support" onBack={() => router.back()} />
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Text
            style={{
              fontFamily: meta.fontFamily,
              fontSize: 10,
              letterSpacing: meta.letterSpacing,
              color: colors.text3,
              textTransform: "uppercase",
              marginBottom: space.md,
            }}
          >
            FAQ
          </Text>
          {SUPPORT_FAQ.map((item) => (
            <GlassPanel key={item.q} style={styles.card}>
              <Text
                style={{
                  fontFamily: title.fontFamily,
                  fontSize: 18,
                  lineHeight: 24,
                  color: colors.text1,
                }}
              >
                {item.q}
              </Text>
              <Text
                style={{
                  marginTop: space.sm,
                  fontFamily: body.fontFamily,
                  fontSize: body.fontSize,
                  lineHeight: body.lineHeight,
                  color: colors.text2,
                }}
              >
                {item.a}
              </Text>
            </GlassPanel>
          ))}

          <Button
            testID="support-mailto"
            label={`Email ${SUPPORT_EMAIL}`}
            onPress={openMail}
            style={styles.cta}
          />
          <Text
            style={{
              marginTop: space.md,
              fontFamily: bodySm.fontFamily,
              fontSize: bodySm.fontSize,
              lineHeight: bodySm.lineHeight,
              color: colors.text3,
              textAlign: "center",
            }}
          >
            We read every note. Include your store platform if it is about
            billing.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: {
    paddingHorizontal: space.lg,
    paddingBottom: space.xxl,
    gap: space.sm,
  },
  card: {
    borderRadius: 20,
  },
  cta: {
    marginTop: space.xl,
    alignSelf: "stretch",
  },
});
