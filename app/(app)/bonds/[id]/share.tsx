import React from "react";
import { ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { ShareCard } from "@/components/bonds";
import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { DOMAIN_LABELS, domainIntensity, useBondQuery } from "@/lib/bonds";
import { space, useTheme } from "@/theme";

/** B6 — Screenshot-ready share card (no snark). */
export default function BondShareScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, fontsLoaded, type } = useTheme();
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
          <ScreenHeader title="Share" onBack={() => router.back()} />
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

  const dominant = bond.synastry.dominant;
  const shareMessage = `Grahalens Bond — You · ${bond.label}. ${DOMAIN_LABELS[dominant]} reads ${domainIntensity(bond.synastry.domains[dominant].value).toLowerCase()} in this braid.`;

  const onShare = async () => {
    await Share.share({ message: shareMessage });
  };

  return (
    <AtmosphericBackground atmosphere="neutral">
      <SafeAreaView style={styles.fill} edges={["top"]}>
        <ScreenHeader
          title="Share card"
          subtitle={bond.label}
          onBack={() => router.back()}
        />
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <ShareCard bond={bond} />
          <Text
            style={{
              marginTop: space.lg,
              fontFamily: bodySm.fontFamily,
              fontSize: bodySm.fontSize,
              lineHeight: bodySm.lineHeight,
              color: colors.text2,
              textAlign: "center",
            }}
          >
            Screenshot this card, or share a quiet line — no percentage carnival.
          </Text>
          <Button label="Share a line" onPress={onShare} style={styles.cta} />
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
  cta: {
    marginTop: space.lg,
  },
});
