import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Share as ShareIcon } from "lucide-react-native";

import { BondConstellation, DomainRow } from "@/components/bonds";
import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { EmptyState } from "@/components/ui/EmptyState";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { SoftPress } from "@/components/ui/SoftPress";
import {
  DOMAIN_LABELS,
  domainScoresList,
  useBondQuery,
} from "@/lib/bonds";
import { radii, space, useTheme } from "@/theme";

/** B3 — Bond home: constellation peek + domains. */
export default function BondHomeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, fontsLoaded, type } = useTheme();
  const body = type("body");
  const meta = type("meta");
  const bondQuery = useBondQuery(id);
  const bond = bondQuery.data;

  if (!fontsLoaded) {
    return <View style={[styles.fill, { backgroundColor: colors.void }]} />;
  }

  if (bondQuery.isLoading) {
    return (
      <AtmosphericBackground atmosphere="neutral">
        <SafeAreaView style={styles.fill} edges={["top"]}>
          <ScreenHeader title="Bond" onBack={() => router.back()} />
          <EmptyState
            title="Loading"
            body="Opening this braid…"
            withOrb={false}
          />
        </SafeAreaView>
      </AtmosphericBackground>
    );
  }

  if (!bond) {
    return (
      <AtmosphericBackground atmosphere="neutral">
        <SafeAreaView style={styles.fill} edges={["top"]}>
          <ScreenHeader title="Bond" onBack={() => router.back()} />
          <EmptyState
            title="Bond not found"
            body="Return to Bonds and choose a saved chart braid."
            withOrb={false}
            actionLabel="Back to Bonds"
            onAction={() => router.replace("/(app)/bonds" as Href)}
          />
        </SafeAreaView>
      </AtmosphericBackground>
    );
  }

  const scores = domainScoresList(bond.synastry);

  return (
    <AtmosphericBackground atmosphere="neutral">
      <SafeAreaView style={styles.fill} edges={["top"]}>
        <ScreenHeader
          title={bond.label}
          subtitle="Bond"
          onBack={() => router.back()}
          actionIcon={ShareIcon}
          actionLabel="Share card"
          onAction={() =>
            router.push(`/(app)/bonds/${bond.id}/share` as Href)
          }
        />
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <SoftPress
            onPress={() =>
              router.push(`/(app)/bonds/${bond.id}/constellation` as Href)
            }
            accessibilityRole="button"
            accessibilityLabel="Open full constellation"
          >
            <GlassPanel floating style={styles.peek}>
              <Text
                style={{
                  fontFamily: meta.fontFamily,
                  fontSize: meta.fontSize,
                  letterSpacing: meta.letterSpacing,
                  color: colors.text3,
                  textTransform: "uppercase",
                  textAlign: "center",
                  marginBottom: space.sm,
                }}
              >
                Constellation peek
              </Text>
              <BondConstellation
                report={bond.synastry}
                otherLabel={bond.label}
                compact
              />
              <Text
                style={{
                  marginTop: space.sm,
                  fontFamily: body.fontFamily,
                  fontSize: body.fontSize,
                  color: colors.text2,
                  textAlign: "center",
                }}
              >
                Leading: {DOMAIN_LABELS[bond.synastry.dominant]}
              </Text>
            </GlassPanel>
          </SoftPress>

          <Text
            style={{
              marginTop: space.xl,
              marginBottom: space.sm,
              fontFamily: meta.fontFamily,
              fontSize: meta.fontSize,
              letterSpacing: meta.letterSpacing,
              color: colors.text3,
              textTransform: "uppercase",
            }}
          >
            Domains
          </Text>
          <DomainRow
            scores={scores}
            dominant={bond.synastry.dominant}
            onPress={(key) =>
              router.push(`/(app)/bonds/${bond.id}/domain/${key}` as Href)
            }
          />
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
  peek: {
    paddingVertical: space.lg,
    borderRadius: radii.xl,
  },
});
