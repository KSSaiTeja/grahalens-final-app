import React from "react";
import { Linking, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { BillingIssueBanner } from "@/components/billing/BillingIssueBanner";
import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { useEntitlement, useIsPrivate } from "@/lib/billing/entitlements";
import { space, useTheme } from "@/theme";

/**
 * X7 / P5 — Plan status, renew date, manage-in-store education.
 */
export default function SubscriptionSettingsScreen() {
  const router = useRouter();
  const { colors, fontsLoaded, type } = useTheme();
  const isPrivate = useIsPrivate();
  const { planId, privateUntil, willRenew, productId, store, billingIssue } =
    useEntitlement();
  const title = type("title");
  const body = type("body");
  const bodySm = type("bodySm");
  const meta = type("meta");

  const openStoreManage = () => {
    const url =
      Platform.OS === "ios"
        ? "https://apps.apple.com/account/subscriptions"
        : "https://play.google.com/store/account/subscriptions";
    void Linking.openURL(url);
  };

  if (!fontsLoaded) {
    return <View style={[styles.fill, { backgroundColor: colors.void }]} />;
  }

  return (
    <AtmosphericBackground atmosphere="neutral">
      <SafeAreaView
        style={styles.fill}
        edges={["top"]}
        testID="settings-subscription"
      >
        <ScreenHeader
          title="Subscription"
          subtitle="Grahalens Private"
          onBack={() => router.back()}
        />
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <BillingIssueBanner />

          <GlassPanel style={styles.card}>
            <Text
              style={{
                fontFamily: meta.fontFamily,
                fontSize: 10,
                letterSpacing: meta.letterSpacing,
                color: colors.text3,
                textTransform: "uppercase",
              }}
            >
              Status
            </Text>
            <Text
              style={{
                marginTop: space.sm,
                fontFamily: title.fontFamily,
                fontSize: 24,
                lineHeight: 30,
                color: colors.text1,
              }}
            >
              {isPrivate ? "Private active" : "Free observatory"}
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
              {isPrivate
                ? [
                    planId === "yearly" ? "Yearly" : "Monthly",
                    productId,
                    privateUntil
                      ? `renews ${privateUntil.slice(0, 10)}`
                      : null,
                    willRenew ? "auto-renew on" : "will not renew",
                    store !== "unknown" ? `via ${store}` : null,
                    billingIssue ? "billing hold" : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")
                : "Sky and Chart stay full. Lens, Bonds depth, Soul, archive, and export open with Private."}
            </Text>
          </GlassPanel>

          {isPrivate ? (
            <>
              <Button
                testID="subscription-manage-store"
                label="Manage in store"
                variant="secondary"
                onPress={openStoreManage}
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
                Cancel and billing changes are handled by Apple or Google — not
                inside Grahalens.
              </Text>
            </>
          ) : (
            <Button
              testID="subscription-see-plans"
              label="See Private plans"
              onPress={() => router.push("/paywall/plans" as Href)}
              style={styles.cta}
            />
          )}
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
  },
  card: {
    borderRadius: 24,
  },
  cta: {
    marginTop: space.xl,
    alignSelf: "stretch",
  },
});
