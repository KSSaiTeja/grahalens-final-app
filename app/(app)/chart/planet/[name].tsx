import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowUpRight } from "lucide-react-native";

import {
  AspectTable,
  ChartHeader,
} from "@/components/chart";
import { Icon } from "@/components/icons/Icon";
import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Hairline } from "@/components/ui/Hairline";
import {
  chartBodyIconName,
  chartBodyLabel,
} from "@/lib/chart";
import { parsePlanetParam, planetPlacementProse } from "@/lib/chart/prose";
import { RASI_LABELS } from "@/lib/ephemeris/constants";
import { getPlacement } from "@/lib/ephemeris/types";
import { formatDegreeInSign } from "@/lib/format/degrees";
import { useResolvedNatal } from "@/lib/sky/resolve-natal";
import { useTheme, space } from "@/theme";

/**
 * C2 — Full planet / Lagna page from real natal placement.
 */
export default function PlanetPageScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const bodyId = parsePlanetParam(name);
  const router = useRouter();
  const { colors, fontsLoaded, type } = useTheme();
  const meta = type("meta");
  const body = type("body");
  const title = type("title");
  const degree = type("degree");
  const { natal, usingFixture } = useResolvedNatal();

  const placement = useMemo(() => {
    if (!bodyId) return null;
    try {
      return getPlacement(natal, bodyId);
    } catch {
      return null;
    }
  }, [natal, bodyId]);

  const prose = useMemo(() => {
    if (!bodyId || !placement) return "";
    return planetPlacementProse(bodyId, placement);
  }, [bodyId, placement]);

  if (!fontsLoaded) {
    return <View style={[styles.fill, { backgroundColor: colors.void }]} />;
  }

  if (!bodyId || !placement) {
    return (
      <AtmosphericBackground atmosphere="neutral">
        <SafeAreaView style={styles.fill} edges={["top"]}>
          <View style={styles.pad}>
            <ChartHeader title="Planet" />
          </View>
          <EmptyState
            title="Unknown body"
            body="That name is not on the Living Chart."
            withOrb={false}
          />
        </SafeAreaView>
      </AtmosphericBackground>
    );
  }

  const label = chartBodyLabel(bodyId);

  return (
    <AtmosphericBackground atmosphere="neutral">
      <SafeAreaView style={styles.fill} edges={["top"]}>
        <View style={styles.pad}>
          <ChartHeader
            title={label}
            subtitle={
              usingFixture
                ? `${RASI_LABELS[placement.sign]} · Fixture A`
                : RASI_LABELS[placement.sign]
            }
          />
        </View>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          testID="planet-page"
        >
          <GlassPanel floating style={styles.featureCard}>
          <View style={styles.header}>
            <View
              style={[
                styles.iconWrap,
                {
                  borderColor: colors.hairlineStrong,
                  backgroundColor: colors.void,
                },
              ]}
            >
              <Icon
                name={chartBodyIconName(bodyId)}
                size={32}
                color={colors.accent}
                strokeWidth={1.5}
              />
            </View>
            <View style={styles.headerCopy}>
              <Text
                style={{
                  fontFamily: title.fontFamily,
                  fontSize: 28,
                  lineHeight: 34,
                  color: colors.text1,
                }}
              >
                {label}
                {placement.retrograde ? (
                  <Text style={{ color: colors.text3, fontSize: 20 }}> Rx</Text>
                ) : null}
              </Text>
              <Text
                style={{
                  marginTop: 4,
                  fontFamily: degree.fontFamily,
                  fontSize: degree.fontSize,
                  color: colors.text2,
                  fontVariant: degree.fontVariant,
                }}
              >
                {RASI_LABELS[placement.sign]}{" "}
                {formatDegreeInSign(placement.degreeInSign)}
              </Text>
            </View>
          </View>

          <Text
            style={{
              marginTop: 20,
              fontFamily: body.fontFamily,
              fontSize: body.fontSize,
              lineHeight: body.lineHeight,
              color: colors.text1,
            }}
          >
            {prose}
          </Text>

          <Hairline style={styles.rule} />

          <Fact
            label="House"
            value={`${placement.house}`}
            colors={colors}
            meta={meta}
            body={body}
          />
          <Fact
            label="Nakshatra"
            value={`${placement.nakshatra.name} · pada ${placement.nakshatra.pada}`}
            colors={colors}
            meta={meta}
            body={body}
          />
          <Fact
            label="Longitude"
            value={`${placement.longitude.toFixed(4)}°`}
            colors={colors}
            meta={meta}
            body={body}
            mono
            degree={degree}
          />
          </GlassPanel>

          <Text
            style={{
              marginTop: 28,
              marginBottom: 8,
              fontFamily: meta.fontFamily,
              fontSize: 10,
              letterSpacing: meta.letterSpacing,
              color: colors.text3,
              textTransform: "uppercase",
            }}
          >
            Aspects
          </Text>
          <AspectTable chart={natal} focusId={bodyId} />

          <Button
            onPress={() => router.push("/(app)/chart/aspects" as Href)}
            accessibilityLabel="Open full aspect table"
            label="Full aspect table"
            icon={ArrowUpRight}
            variant="secondary"
            style={styles.link}
          />
        </ScrollView>
      </SafeAreaView>
    </AtmosphericBackground>
  );
}

function Fact({
  label,
  value,
  colors,
  meta,
  body,
  mono,
  degree,
}: {
  label: string;
  value: string;
  colors: { text1: string; text3: string };
  meta: {
    fontFamily: string;
    letterSpacing?: number;
  };
  body: { fontFamily: string; fontSize: number; lineHeight: number };
  mono?: boolean;
  degree?: {
    fontFamily: string;
    fontSize: number;
    fontVariant?: Array<"tabular-nums">;
  };
}) {
  return (
    <View style={styles.fact}>
      <Text
        style={{
          fontFamily: meta.fontFamily,
          fontSize: 10,
          letterSpacing: meta.letterSpacing,
          color: colors.text3,
          textTransform: "uppercase",
          width: 88,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          flex: 1,
          fontFamily: mono && degree ? degree.fontFamily : body.fontFamily,
          fontSize: mono && degree ? degree.fontSize : body.fontSize,
          lineHeight: body.lineHeight,
          color: colors.text1,
          fontVariant: mono && degree ? degree.fontVariant : undefined,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  pad: { paddingHorizontal: 24 },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  featureCard: {
    borderRadius: 28,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCopy: { flex: 1 },
  rule: { marginVertical: 18 },
  fact: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 10,
    gap: 8,
  },
  link: {
    marginTop: space.lg,
  },
});
