import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { LockGlyph } from "@/components/billing/LockGlyph";
import { Icon, type IconName } from "@/components/icons/Icon";
import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import {
  requirePrivate,
  useIsPrivate,
} from "@/lib/billing/entitlements";
import {
  buildDomainDeepRead,
  isBondDomainId,
  softGateDomainRead,
  useBondQuery,
} from "@/lib/bonds";
import { radii, space, useTheme } from "@/theme";

const DOMAIN_ICONS: Record<string, IconName> = {
  talk: "domain.talk",
  care: "domain.care",
  spark: "domain.spark",
  friction: "domain.friction",
  growth: "domain.growth",
};

/** B5 — Domain deep read. SOFT lock after preview. */
export default function BondDomainScreen() {
  const { id, key } = useLocalSearchParams<{ id: string; key: string }>();
  const router = useRouter();
  const { colors, fontsLoaded, type } = useTheme();
  const body = type("body");
  const bodySm = type("bodySm");
  const meta = type("meta");
  const bondQuery = useBondQuery(id);
  const bond = bondQuery.data;
  const isPrivate = useIsPrivate();

  const domainKey = key && isBondDomainId(key) ? key : null;
  const read = useMemo(() => {
    if (!bond || !domainKey) return null;
    return buildDomainDeepRead(bond.synastry.domains[domainKey], bond.label);
  }, [bond, domainKey]);

  const gated = useMemo(
    () => (read ? softGateDomainRead(read, isPrivate) : null),
    [read, isPrivate],
  );

  const openPaywall = () => {
    const gate = requirePrivate("bond_domain");
    if (!gate.allowed) {
      router.push(gate.href as Href);
    }
  };

  if (!fontsLoaded) {
    return <View style={[styles.fill, { backgroundColor: colors.void }]} />;
  }

  if (!bond || !domainKey || !read || !gated) {
    return (
      <AtmosphericBackground atmosphere="neutral">
        <SafeAreaView style={styles.fill} edges={["top"]}>
          <ScreenHeader title="Domain" onBack={() => router.back()} />
          <EmptyState
            title="Domain not found"
            body="Return to the bond and choose Talk, Care, Spark, Friction, or Growth."
            withOrb={false}
          />
        </SafeAreaView>
      </AtmosphericBackground>
    );
  }

  return (
    <AtmosphericBackground atmosphere="neutral">
      <SafeAreaView style={styles.fill} edges={["top"]}>
        <ScreenHeader
          title={read.title}
          subtitle={`${bond.label} · ${read.intensity}`}
          onBack={() => router.back()}
        />
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <GlassPanel floating style={styles.read}>
            <View style={styles.eyebrow}>
              <Icon
                name={DOMAIN_ICONS[read.id]!}
                size={22}
                color={colors.text1}
              />
              <Text
                style={{
                  fontFamily: meta.fontFamily,
                  fontSize: meta.fontSize,
                  letterSpacing: meta.letterSpacing,
                  color: colors.text3,
                  textTransform: "uppercase",
                }}
              >
                Domain read
              </Text>
            </View>
            {gated.visible.map((paragraph) => (
              <Text
                key={paragraph}
                style={[
                  styles.paragraph,
                  {
                    fontFamily: body.fontFamily,
                    fontSize: body.fontSize,
                    lineHeight: body.lineHeight,
                    color: colors.text1,
                  },
                ]}
              >
                {paragraph}
              </Text>
            ))}
          </GlassPanel>

          {gated.locked.length > 0 ? (
            <GlassPanel style={styles.locked}>
              <LockGlyph size={20} onPress={openPaywall} />
              <Text
                style={{
                  marginTop: space.sm,
                  fontFamily: bodySm.fontFamily,
                  fontSize: bodySm.fontSize,
                  lineHeight: bodySm.lineHeight,
                  color: colors.text2,
                }}
              >
                This opens with Private. Your free preview stays visible above.
              </Text>
              <Button
                testID="bond-domain-gate-cta"
                label="See Private plans"
                onPress={openPaywall}
                style={styles.cta}
              />
            </GlassPanel>
          ) : null}
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
    gap: space.md,
  },
  read: {
    padding: space.lg,
    borderRadius: radii.xl,
  },
  eyebrow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    marginBottom: space.md,
  },
  paragraph: {
    marginTop: space.md,
  },
  locked: {
    padding: space.lg,
    borderRadius: radii.xl,
    alignItems: "flex-start",
  },
  cta: {
    marginTop: space.md,
    alignSelf: "stretch",
  },
});
