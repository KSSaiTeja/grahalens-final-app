/**
 * Shared onboarding chrome — ABY Journal look:
 * atmospheric field, thin progress, icon back, fixed black CTA.
 * Steps / handlers unchanged.
 */
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { ScreenEnter } from "@/components/ui/ScreenEnter";
import { useTheme, layout, space, radii } from "@/theme";

type Props = {
  step: number;
  /** Progress segments; birth onboarding uses 3, bond wizard uses 5. */
  totalSteps?: number;
  stepLabel?: string;
  title: string;
  body?: string;
  children: React.ReactNode;
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  primaryLoading?: boolean;
  primaryTestID?: string;
  secondaryLabel?: string;
  onSecondary?: () => void;
  showBack?: boolean;
  banner?: string | null;
  error?: string | null;
  atmosphere?: "calm" | "sunrise" | "journey" | "neutral";
  testID?: string;
};

export function OnboardingChrome({
  step,
  totalSteps = 3,
  stepLabel,
  title,
  body,
  children,
  primaryLabel,
  onPrimary,
  primaryDisabled,
  primaryLoading,
  primaryTestID = "onboarding-continue",
  secondaryLabel,
  onSecondary,
  showBack = true,
  banner,
  error,
  atmosphere = "neutral",
  testID,
}: Props) {
  const { colors, type, fontsLoaded } = useTheme();
  const router = useRouter();
  const titleStyle = type("displayXl");
  const bodyStyle = type("body");
  const bodySm = type("bodySm");

  if (!fontsLoaded) {
    return <View style={[styles.fill, { backgroundColor: colors.void }]} />;
  }

  const total = Math.max(1, totalSteps);
  const progress = stepLabel ?? `${step} of ${total}`;
  const filled = Math.min(step, total);

  return (
    <AtmosphericBackground atmosphere={atmosphere} style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={["top", "bottom"]} testID={testID}>
        <KeyboardAvoidingView
          style={styles.fill}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.progressTrack}>
            {Array.from({ length: total }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressSeg,
                  {
                    backgroundColor:
                      i < filled ? colors.text1 : "rgba(10,10,10,0.12)",
                  },
                ]}
              />
            ))}
          </View>

          <View style={styles.header}>
            {showBack ? (
              <IconButton
                icon={ArrowLeft}
                label="Back"
                onPress={() => router.back()}
              />
            ) : (
              <View style={styles.backSpacer} />
            )}
            <Text
              style={{
                flex: 1,
                textAlign: "center",
                fontFamily: bodySm.fontFamily,
                fontSize: bodySm.fontSize,
                color: colors.text2,
              }}
              accessibilityLabel={`Step ${progress}`}
            >
              {progress}
            </Text>
            <View style={styles.backSpacer} />
          </View>

          <ScreenEnter style={styles.content}>
            <Text
              style={{
                fontFamily: titleStyle.fontFamily,
                fontSize: titleStyle.fontSize,
                lineHeight: titleStyle.lineHeight,
                letterSpacing: titleStyle.letterSpacing,
                color: colors.text1,
              }}
            >
              {title}
            </Text>
            {body ? (
              <Text
                style={{
                  marginTop: space.sm + 2,
                  fontFamily: bodyStyle.fontFamily,
                  fontSize: bodyStyle.fontSize,
                  lineHeight: bodyStyle.lineHeight,
                  color: colors.text2,
                }}
              >
                {body}
              </Text>
            ) : null}

            {banner ? (
              <View
                style={[styles.banner, { backgroundColor: colors.accentSoft }]}
                accessibilityRole="text"
              >
                <Text
                  style={{
                    fontFamily: bodySm.fontFamily,
                    fontSize: bodySm.fontSize,
                    lineHeight: bodySm.lineHeight,
                    color: colors.text1,
                  }}
                >
                  {banner}
                </Text>
              </View>
            ) : null}

            <View style={styles.slot}>{children}</View>

            {error ? (
              <Text
                style={{
                  marginTop: space.md,
                  fontFamily: bodySm.fontFamily,
                  fontSize: bodySm.fontSize,
                  color: colors.critical,
                }}
                accessibilityRole="alert"
              >
                {error}
              </Text>
            ) : null}
          </ScreenEnter>

          <View style={styles.footer}>
            <Button
              label={primaryLabel}
              onPress={onPrimary}
              disabled={primaryDisabled}
              loading={primaryLoading}
              testID={primaryTestID}
            />
            {secondaryLabel && onSecondary ? (
              <Button
                label={secondaryLabel}
                variant="secondary"
                onPress={onSecondary}
                disabled={primaryLoading}
                testID="onboarding-secondary"
              />
            ) : null}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  progressTrack: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
  },
  progressSeg: {
    flex: 1,
    height: 3,
    borderRadius: radii.pill,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: space.md,
    paddingTop: space.sm,
    minHeight: layout.minHit,
  },
  backSpacer: { width: layout.minHit, height: layout.minHit },
  content: {
    flex: 1,
    paddingHorizontal: space.lg,
    paddingTop: space.xl,
  },
  slot: {
    flex: 1,
    marginTop: space.xl,
  },
  banner: {
    marginTop: space.md,
    padding: space.md,
    borderRadius: radii.md,
  },
  footer: {
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    gap: space.md,
  },
});
