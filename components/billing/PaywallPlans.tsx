import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowRight, X } from "lucide-react-native";

import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { PriceCard } from "@/components/billing/PriceCard";
import { RestoreButton } from "@/components/billing/RestoreButton";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { useTheme, layout, space } from "@/theme";
import {
  LEGAL_FOOTER,
  PAYWALL_HEADLINE,
  PAYWALL_SUB,
  PRIVATE_PLANS,
  type PlanId,
} from "@/lib/billing/catalog";
import { track } from "@/lib/analytics";
import { useOfferings } from "@/lib/billing/offerings";
import { purchasePlan } from "@/lib/billing/purchase";
import { useEntitlement } from "@/lib/billing/entitlements";

/**
 * P1 — Full plans screen. Shows dynamic offerings when available,
 * falls back to static catalog. Purchase → success or cancelled.
 */
export function PaywallPlans() {
  const router = useRouter();
  const { colors, type } = useTheme();
  const { data: offerings, isLoading: loadingOfferings } = useOfferings();
  const { phase } = useEntitlement();
  const [selected, setSelected] = useState<PlanId>("yearly");

  useEffect(() => {
    track("paywall_viewed", { surface: "plans" });
  }, []);

  const title = type("displayL");
  const body = type("body");
  const bodySm = type("bodySm");

  const plans = useMemo(() => {
    if (offerings?.packages?.length) return offerings.packages;
    return PRIVATE_PLANS;
  }, [offerings]);

  const selectedPlan = useMemo(
    () => plans.find((p) => ("planId" in p ? p.planId : p.id) === selected) ?? plans[0]!,
    [plans, selected],
  );

  const purchasing = phase === "purchasing";

  const handlePurchase = async () => {
    const result = await purchasePlan(selected);
    if (result.status === "success") {
      router.replace("/paywall/success");
      return;
    }
    if (result.status === "failed") {
      if (result.message === "Store unavailable") {
        router.replace("/paywall/unavailable");
      }
    }
  };

  const handleRestoreSuccess = () => {
    router.replace("/paywall/success");
  };

  const ctaLabel = useMemo(() => {
    if (selected === "yearly") return "Start 3-day trial";
    return `Continue · ${selectedPlan.priceLabel}/mo`;
  }, [selected, selectedPlan]);

  if (loadingOfferings) {
    return (
      <AtmosphericBackground atmosphere="calm">
        <SafeAreaView style={styles.center} edges={["top", "bottom"]}>
          <ActivityIndicator color={colors.text2} />
        </SafeAreaView>
      </AtmosphericBackground>
    );
  }

  if (offerings?.unavailable) {
    router.replace("/paywall/unavailable");
    return null;
  }

  return (
    <AtmosphericBackground atmosphere="calm">
      <SafeAreaView
        style={styles.fill}
        edges={["top", "bottom"]}
        testID="paywall-plans"
      >
        <View style={styles.header}>
          <View style={{ flex: 1 }} />
          <IconButton
            icon={X}
            label="Close"
            onPress={() => router.back()}
          />
        </View>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text
            style={{
              marginTop: 12,
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

          <View style={styles.plans}>
            {plans.map((plan) => {
              const id = "planId" in plan ? plan.planId : plan.id;
              return (
                <PriceCard
                  key={id}
                  plan={plan}
                  active={selected === id}
                  onPress={() => setSelected(id)}
                />
              );
            })}
          </View>

          <RestoreButton
            onSuccess={handleRestoreSuccess}
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
            label={ctaLabel}
            icon={ArrowRight}
            onPress={() => void handlePurchase()}
            loading={purchasing}
            testID="paywall-purchase"
          />
        </View>
      </SafeAreaView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    minHeight: layout.minHit,
    paddingHorizontal: 24,
  },
  plans: { marginTop: 28, gap: space.md },
  restore: { marginTop: 20 },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
  },
});
