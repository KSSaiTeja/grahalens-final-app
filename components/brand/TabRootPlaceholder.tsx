import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  BookOpenText,
  MessageCircleMore,
  NotebookPen,
  Sparkles,
  UsersRound,
} from "lucide-react-native";

import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { ScreenEnter } from "@/components/ui/ScreenEnter";
import { useTheme, space, radii, pastels } from "@/theme";

type Props = {
  variant: "lens" | "bonds" | "atelier";
  title: string;
  body: string;
  greeting?: string;
};

const BOND_DOMAINS = ["Talk", "Care", "Spark", "Friction", "Growth"] as const;

/**
 * Purpose-specific tab roots — quiet ABY-inspired editorial compositions.
 */
export function TabRootPlaceholder({
  variant,
  title,
  body,
  greeting = "Welcome back",
}: Props) {
  const { colors, type, fontsLoaded } = useTheme();
  const meta = type("meta");
  const titleStyle = type("displayL");
  const bodyStyle = type("body");
  if (!fontsLoaded) {
    return <View style={[styles.fill, { backgroundColor: colors.void }]} />;
  }

  return (
    <AtmosphericBackground atmosphere="neutral" style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={["top"]}>
        <View style={styles.body}>
          <ScreenEnter>
            <Text
              style={{
                fontFamily: meta.fontFamily,
                fontSize: meta.fontSize,
                color: colors.text2,
                marginBottom: space.sm,
              }}
            >
              {greeting}
            </Text>
            <Text
              style={{
                fontFamily: titleStyle.fontFamily,
                fontSize: titleStyle.fontSize,
                lineHeight: titleStyle.lineHeight,
                letterSpacing: titleStyle.letterSpacing,
                color: colors.text1,
                marginBottom: space.lg,
              }}
            >
              {title}
            </Text>
          </ScreenEnter>

          <ScreenEnter index={1}>
            {variant === "lens" ? (
              <GlassPanel floating style={styles.lensCard}>
                <View
                  style={[
                    styles.featureIcon,
                    { backgroundColor: colors.accentSoft },
                  ]}
                  accessibilityElementsHidden
                  importantForAccessibility="no"
                >
                  <Sparkles color={colors.accent} size={24} strokeWidth={1.8} />
                </View>
                <Text
                  style={[
                    styles.featureTitle,
                    {
                      color: colors.text1,
                      fontFamily: titleStyle.fontFamily,
                    },
                  ]}
                >
                  What wants a closer look?
                </Text>
                <Text
                  style={[
                    styles.featureBody,
                    {
                      color: colors.text2,
                      fontFamily: bodyStyle.fontFamily,
                    },
                  ]}
                >
                  {body}
                </Text>
                <View style={styles.promptRow}>
                  {["The sky now", "A decision", "A pattern"].map((prompt) => (
                    <View
                      key={prompt}
                      style={[
                        styles.promptChip,
                        {
                          backgroundColor: "rgba(255,255,255,0.55)",
                          borderColor: colors.hairline,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.promptText,
                          {
                            color: colors.text2,
                            fontFamily: meta.fontFamily,
                          },
                        ]}
                      >
                        {prompt}
                      </Text>
                    </View>
                  ))}
                </View>
              </GlassPanel>
            ) : null}

            {variant === "bonds" ? (
              <View style={styles.bondsComposition}>
                <GlassPanel floating style={styles.bondsCard}>
                  <View style={styles.orbitPortraits} accessibilityElementsHidden>
                    <View
                      style={[
                        styles.portrait,
                        styles.portraitBack,
                        { backgroundColor: pastels.mistBlue },
                      ]}
                    >
                      <UsersRound
                        color={colors.text1}
                        size={28}
                        strokeWidth={1.6}
                      />
                    </View>
                    <View
                      style={[
                        styles.portrait,
                        styles.portraitFront,
                        {
                          backgroundColor: pastels.lavender,
                          borderColor: colors.surface,
                        },
                      ]}
                    >
                      <Sparkles
                        color={colors.text1}
                        size={26}
                        strokeWidth={1.7}
                      />
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.featureTitle,
                      styles.centered,
                      {
                        color: colors.text1,
                        fontFamily: titleStyle.fontFamily,
                      },
                    ]}
                  >
                    Two skies, one conversation
                  </Text>
                  <Text
                    style={[
                      styles.featureBody,
                      styles.centered,
                      {
                        color: colors.text2,
                        fontFamily: bodyStyle.fontFamily,
                      },
                    ]}
                  >
                    {body}
                  </Text>
                </GlassPanel>
                <View style={styles.domainRow} accessibilityLabel="Bond themes">
                  {BOND_DOMAINS.map((domain, index) => (
                    <View
                      key={domain}
                      style={[
                        styles.domainPill,
                        {
                          backgroundColor:
                            index % 2 === 0
                              ? colors.accentSoft
                              : "rgba(255,255,255,0.55)",
                          borderColor: colors.hairline,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.domainText,
                          {
                            color: colors.text2,
                            fontFamily: meta.fontFamily,
                          },
                        ]}
                      >
                        {domain}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {variant === "atelier" ? (
              <View style={styles.atelierComposition}>
                <GlassPanel floating style={styles.notebook}>
                  <View style={styles.notebookHeader}>
                    <NotebookPen
                      color={colors.accent}
                      size={23}
                      strokeWidth={1.8}
                      accessibilityElementsHidden
                    />
                    <Text
                      style={{
                        color: colors.text2,
                        fontFamily: meta.fontFamily,
                        fontSize: meta.fontSize,
                      }}
                    >
                      Field notes
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.featureTitle,
                      {
                        color: colors.text1,
                        fontFamily: titleStyle.fontFamily,
                      },
                    ]}
                  >
                    A place to notice what repeats
                  </Text>
                  <Text
                    style={[
                      styles.featureBody,
                      {
                        color: colors.text2,
                        fontFamily: bodyStyle.fontFamily,
                      },
                    ]}
                  >
                    {body}
                  </Text>
                  <View style={styles.ruledPage} accessibilityElementsHidden>
                    {[0, 1, 2].map((line) => (
                      <View
                        key={line}
                        style={[
                          styles.rule,
                          {
                            backgroundColor:
                              line === 2 ? colors.accentSoft : colors.hairline,
                          },
                        ]}
                      />
                    ))}
                  </View>
                </GlassPanel>
                <View style={styles.atelierModes}>
                  <View
                    style={[
                      styles.mode,
                      {
                        backgroundColor: "rgba(255,255,255,0.55)",
                        borderColor: colors.hairline,
                      },
                    ]}
                  >
                    <BookOpenText
                      color={colors.text2}
                      size={18}
                      strokeWidth={1.7}
                    />
                    <Text
                      style={[
                        styles.modeText,
                        { color: colors.text2, fontFamily: meta.fontFamily },
                      ]}
                    >
                      Journal
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.mode,
                      {
                        backgroundColor: "rgba(255,255,255,0.55)",
                        borderColor: colors.hairline,
                      },
                    ]}
                  >
                    <MessageCircleMore
                      color={colors.text2}
                      size={18}
                      strokeWidth={1.7}
                    />
                    <Text
                      style={[
                        styles.modeText,
                        { color: colors.text2, fontFamily: meta.fontFamily },
                      ]}
                    >
                      Pattern Thread
                    </Text>
                  </View>
                </View>
              </View>
            ) : null}
          </ScreenEnter>
        </View>
      </SafeAreaView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  body: {
    flex: 1,
    paddingHorizontal: space.lg,
    paddingTop: space.xl,
  },
  lensCard: {
    borderRadius: radii.xl,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space.md,
  },
  featureTitle: {
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.5,
  },
  featureBody: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: space.sm,
  },
  promptRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
    marginTop: space.lg,
  },
  promptChip: {
    minHeight: 36,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  promptText: {
    fontSize: 11,
    lineHeight: 14,
  },
  bondsComposition: {
    gap: space.md,
  },
  bondsCard: {
    borderRadius: radii.xl,
    alignItems: "center",
  },
  orbitPortraits: {
    width: 124,
    height: 86,
    marginBottom: space.sm,
  },
  portrait: {
    position: "absolute",
    width: 68,
    height: 68,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  portraitBack: {
    left: 8,
    top: 8,
  },
  portraitFront: {
    right: 8,
    bottom: 0,
    borderWidth: 4,
  },
  centered: {
    textAlign: "center",
  },
  domainRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: space.sm,
  },
  domainPill: {
    minHeight: 32,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  domainText: {
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 0.35,
  },
  atelierComposition: {
    gap: space.md,
  },
  notebook: {
    borderRadius: radii.xl,
  },
  notebookHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    marginBottom: space.md,
  },
  ruledPage: {
    gap: 14,
    marginTop: space.lg,
  },
  rule: {
    height: StyleSheet.hairlineWidth,
    borderRadius: radii.pill,
  },
  atelierModes: {
    flexDirection: "row",
    gap: space.sm,
  },
  mode: {
    flex: 1,
    minHeight: 48,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
  },
  modeText: {
    fontSize: 10,
    lineHeight: 13,
  },
});
