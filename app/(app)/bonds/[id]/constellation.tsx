import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { BondConstellation } from "@/components/bonds";
import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { EmptyState } from "@/components/ui/EmptyState";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { DOMAIN_LABELS, useBondQuery } from "@/lib/bonds";
import { radii, space, useTheme } from "@/theme";

/** B4 — Full Bond Constellation. */
export default function BondConstellationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, fontsLoaded, type } = useTheme();
  const body = type("body");
  const bodySm = type("bodySm");
  const bondQuery = useBondQuery(id);
  const bond = bondQuery.data;

  if (!fontsLoaded) {
    return <View style={[styles.fill, { backgroundColor: colors.void }]} />;
  }

  if (!bond) {
    return (
      <AtmosphericBackground atmosphere="neutral">
        <SafeAreaView style={styles.fill} edges={["top"]}>
          <ScreenHeader title="Constellation" onBack={() => router.back()} />
          <EmptyState
            title="Bond not found"
            body="Return to Bonds and open a saved braid."
            withOrb={false}
            actionLabel="Back"
            onAction={() => router.replace("/(app)/bonds" as Href)}
          />
        </SafeAreaView>
      </AtmosphericBackground>
    );
  }

  return (
    <AtmosphericBackground atmosphere="neutral">
      <SafeAreaView style={styles.fill} edges={["top"]}>
        <ScreenHeader
          title="Constellation"
          subtitle={bond.label}
          onBack={() => router.back()}
        />
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <GlassPanel floating style={styles.panel}>
            <BondConstellation
              report={bond.synastry}
              otherLabel={bond.label}
              size={300}
            />
            <Text
              style={{
                marginTop: space.lg,
                fontFamily: body.fontFamily,
                fontSize: body.fontSize,
                lineHeight: body.lineHeight,
                color: colors.text1,
                textAlign: "center",
              }}
            >
              Threads are cross-chart aspects. Arc marks are domain lenses —
              Talk, Care, Spark, Friction, Growth.
            </Text>
            <Text
              style={{
                marginTop: space.sm,
                fontFamily: bodySm.fontFamily,
                fontSize: bodySm.fontSize,
                color: colors.text2,
                textAlign: "center",
              }}
            >
              Leading domain: {DOMAIN_LABELS[bond.synastry.dominant]}
            </Text>
          </GlassPanel>
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
  panel: {
    paddingVertical: space.xl,
    borderRadius: radii.xl,
  },
});
