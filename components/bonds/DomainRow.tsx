import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Icon, type IconName } from "@/components/icons/Icon";
import { SoftPress } from "@/components/ui/SoftPress";
import {
  DOMAIN_LABELS,
  domainIntensity,
  type DomainScore,
} from "@/lib/bonds";
import { radii, space, useTheme } from "@/theme";

const DOMAIN_ICONS: Record<DomainScore["id"], IconName> = {
  talk: "domain.talk",
  care: "domain.care",
  spark: "domain.spark",
  friction: "domain.friction",
  growth: "domain.growth",
};

type Props = {
  scores: DomainScore[];
  dominant: DomainScore["id"];
  onPress: (id: DomainScore["id"]) => void;
};

export function DomainRow({ scores, dominant, onPress }: Props) {
  const { colors, type } = useTheme();
  const meta = type("meta");
  const bodySm = type("bodySm");

  return (
    <View style={styles.list} accessibilityRole="list">
      {scores.map((score) => {
        const active = score.id === dominant;
        return (
          <SoftPress
            key={score.id}
            onPress={() => onPress(score.id)}
            accessibilityRole="button"
            accessibilityLabel={`${DOMAIN_LABELS[score.id]}, ${domainIntensity(score.value)}`}
            style={[
              styles.row,
              {
                backgroundColor: active
                  ? colors.accentSoft
                  : "rgba(255,255,255,0.55)",
                borderColor: colors.hairline,
              },
            ]}
          >
            <Icon name={DOMAIN_ICONS[score.id]} size={22} color={colors.text1} />
            <View style={styles.copy}>
              <Text
                style={{
                  fontFamily: bodySm.fontFamily,
                  fontSize: bodySm.fontSize,
                  color: colors.text1,
                }}
              >
                {DOMAIN_LABELS[score.id]}
              </Text>
              <Text
                style={{
                  marginTop: 2,
                  fontFamily: meta.fontFamily,
                  fontSize: meta.fontSize,
                  letterSpacing: meta.letterSpacing,
                  color: colors.text3,
                  textTransform: "uppercase",
                }}
              >
                {domainIntensity(score.value)}
                {active ? " · Leading" : ""}
              </Text>
            </View>
            <View
              style={[styles.meterTrack, { backgroundColor: colors.hairline }]}
              accessibilityElementsHidden
            >
              <View
                style={[
                  styles.meterFill,
                  {
                    width: `${Math.round(score.value * 100)}%`,
                    backgroundColor: colors.accent,
                  },
                ]}
              />
            </View>
          </SoftPress>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: space.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingVertical: space.md,
    paddingHorizontal: space.md,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 64,
  },
  copy: {
    flex: 1,
  },
  meterTrack: {
    width: 48,
    height: 4,
    borderRadius: radii.pill,
    overflow: "hidden",
  },
  meterFill: {
    height: "100%",
    borderRadius: radii.pill,
  },
});
