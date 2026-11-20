import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";

import { Button } from "@/components/ui/Button";
import { SheetScaffold } from "@/components/ui/SheetScaffold";
import { track } from "@/lib/analytics";
import { space, useTheme } from "@/theme";

const REASON_COPY: Record<string, string> = {
  dasha_deep_read:
    "Continue the selected timing read with its natal placement context.",
  cosmic_profile:
    "Open your full chart portrait and strongest computed signatures.",
  archive: "Open older observatory days beyond the free seven-day window.",
  lens_quota:
    "You’ve used today’s five free Lens messages. Private keeps the conversation open.",
  bond_limit:
    "Free keeps one Bond. Private opens every braid in your sky.",
  bond_domain:
    "The full domain read continues with Private — your free preview stays visible.",
  soul: "Open the full Soul Cartography portrait — the free preview stays visible.",
  patterns:
    "The Pattern Thread opens with Private — journal weather woven across time.",
  export: "Export your observatory data with Private.",
};

/** Shared soft-gate destination. Purchase state arrives with billing. */
export default function PaywallSheetScreen() {
  const { reason } = useLocalSearchParams<{ reason?: string }>();
  const router = useRouter();
  const { colors, type } = useTheme();
  const body = type("body");
  const bodySm = type("bodySm");
  const copy =
    (reason ? REASON_COPY[reason] : undefined) ??
    "Open the complete Private observatory.";

  useEffect(() => {
    track("paywall_viewed", {
      surface: "sheet",
      reason: reason ?? "generic",
    });
  }, [reason]);

  return (
    <View style={styles.fill} testID="paywall-sheet">
      <SheetScaffold
        visible
        title="Grahalens Private"
        onClose={() => router.back()}
      >
        <Text
          testID={reason ? `paywall-reason-${reason}` : "paywall-reason"}
          style={{
            fontFamily: body.fontFamily,
            fontSize: body.fontSize,
            lineHeight: body.lineHeight,
            color: colors.text1,
          }}
        >
          {copy}
        </Text>
        <Text
          style={{
            marginTop: space.sm,
            fontFamily: bodySm.fontFamily,
            fontSize: bodySm.fontSize,
            lineHeight: bodySm.lineHeight,
            color: colors.text2,
          }}
        >
          Your free reading stays visible. Plans and restore are available on
          the next screen.
        </Text>
        <Button
          label="See Private plans"
          onPress={() => router.replace("/paywall/plans" as Href)}
          style={styles.cta}
          testID="paywall-sheet-plans"
        />
      </SheetScaffold>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  cta: {
    marginTop: space.lg,
    marginBottom: space.md,
  },
});
