import React, { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowRight, X } from "lucide-react-native";

import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { BigThreePeek } from "@/components/billing/BigThreePeek";
import { PlanCards } from "@/components/billing/PlanCards";
import { RestoreButton } from "@/components/billing/RestoreButton";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { IconButton } from "@/components/ui/IconButton";
import { useTheme, layout } from "@/theme";
import {
  LEGAL_FOOTER,
  PAYWALL_HEADLINE,
  PAYWALL_SUB,
  PRIVATE_PLANS,
  type PlanId,
} from "@/lib/billing/catalog";
import { track } from "@/lib/analytics";
import { purchasePlan } from "@/lib/billing/purchase";
import { useEntitlement, useIsPrivate } from "@/lib/billing/entitlements";
import { markWelcomePaywallSkipped, useSession } from "@/lib/session";
import { useChartStore } from "@/lib/store/chart";

/**
 * A11 — Soft welcome paywall after first chart. Skip once → free observatory.
 * Already skipped or Private → redirect to Sky (no dark pattern trap).
 */
export default function WelcomePaywallScreen() {
  const router = useRouter();
  const { colors, type, fontsLoaded } = useTheme();
  const natal = useChartStore((s) => s.natal);
  const { phase } = useEntitlement();
  const isPrivate = useIsPrivate();
  const { skippedWelcomePaywall } = useSession();
  const [selected, setSelected] = useState<PlanId>("yearly");
  const [busy, setBusy] = useState(false);

  const title = type("displayL");
  const body = type("body");
  const bodySm = type("bodySm");

  const selectedPlan = useMemo(
    () => PRIVATE_PLANS.find((p) => p.id === selected) ?? PRIVATE_PLANS[0]!,
    [selected],
  );

  const purchasing = phase === "purchasing";

  useEffect(() => {
    if (skippedWelcomePaywall || isPrivate) {
      router.replace("/(app)/sky");
      return;
    }
    track("paywall_viewed", { surface: "welcome" });
  }, [isPrivate, router, skippedWelcomePaywall]);

  const enterObservatory = async () => {
    setBusy(true);
    try {
      await markWelcomePaywallSkipped(true);
      router.replace("/(app)/sky");
    } finally {
      setBusy(false);
    }
  };

  const onPrimary = async () => {
    const result = await purchasePlan(selected);
    if (result.status === "success") {
      await markWelcomePaywallSkipped(true);
      router.replace("/paywall/success");
      return;
    }
    if (result.status === "failed" && result.message === "Store unavailable") {
      router.replace("/paywall/unavailable");
      return;
    }
  };

  const onRestoreSuccess = async () => {
    await markWelcomePaywallSkipped(true);
    router.replace("/paywall/success");
  };

  if (!fontsLoaded) {
    return <View style={[styles.fill, { backgroundColor: colors.void }]} />;
  }

  return (
    <AtmosphericBackground atmosphere="calm">
      <SafeAreaView
        style={styles.fill}
        edges={["top", "bottom"]}
        testID="paywall-welcome"
      >
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text
              style={{
                fontFamily: bodySm.fontFamily,
                fontSize: bodySm.fontSize,
                color: colors.text2,
              }}
            >
              Your chart is ready
            </Text>
          </View>
          <IconButton
            testID="paywall-welcome-skip"
            icon={X}
            label="Skip once"
            onPress={() => void enterObservatory()}
            disabled={busy || purchasing}
          />
        </View>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text
            style={{
              marginTop: 28,
              fontFamily: title.fontFamily,
              fontSize: 28,
              lineHeight: 34,
              letterSpacing: title.letterSpacing,
              color: colors.text1,
            }}
          >
            {PAYWALL_HEADLINE}
          </Text>
          <Text
            style={{
              marginTop: 12,
              fontFamily: body.fontFamily,
              fontSize: body.fontSize,
              lineHeight: body.lineHeight,
              color: colors.text2,
            }}
          >
            {PAYWALL_SUB}
          </Text>

          {natal ? (
            <GlassPanel style={styles.peek}>
              <Text
                style={{
                  marginBottom: 10,
                  fontFamily: bodySm.fontFamily,
                  fontSize: 10,
                  color: colors.text3,
                  textTransform: "uppercase",
                }}
              >
                Your chart, already computed
              </Text>
              <BigThreePeek natal={natal} />
            </GlassPanel>
          ) : null}

          <View style={styles.plans}>
            <PlanCards selected={selected} onSelect={setSelected} />
          </View>

          <RestoreButton
            onSuccess={() => void onRestoreSuccess()}
            style={styles.restore}
          />

          <Text
            style={{
              marginTop: 20,
              fontFamily: bodySm.fontFamily,
              fontSize: 11,
              lineHeight: 16,
              color: colors.text3,
              textAlign: "center",
            }}
          >
            {LEGAL_FOOTER}
          </Text>
        </ScrollView>
        <View style={styles.footer}>
          <Button
            testID="paywall-welcome-buy"
            label={
              selected === "yearly"
                ? "Start 3-day trial"
                : `Continue · ${selectedPlan.priceLabel}/mo`
            }
            icon={ArrowRight}
            onPress={() => void onPrimary()}
            loading={purchasing}
          />
        </View>
      </SafeAreaView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: layout.minHit,
    paddingHorizontal: 24,
  },
  headerCopy: { flex: 1 },
  peek: { marginTop: 28 },
  plans: { marginTop: 28 },
  restore: {
    marginTop: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
  },
});
