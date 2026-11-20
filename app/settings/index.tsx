import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Bell,
  BookOpen,
  Brain,
  CreditCard,
  Download,
  FileText,
  HelpCircle,
  Moon,
  RotateCcw,
  Sparkles,
  Trash2,
  User,
  Baby,
  Shield,
} from "lucide-react-native";

import { BillingIssueBanner } from "@/components/billing/BillingIssueBanner";
import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { SoftPress } from "@/components/ui/SoftPress";
import { useEntitlement, useIsPrivate } from "@/lib/billing/entitlements";
import { space, useTheme, radii } from "@/theme";

type Row = {
  label: string;
  body: string;
  href: Href;
  icon: typeof CreditCard;
  testID: string;
};

type Section = {
  title: string;
  rows: Row[];
};

/**
 * X1 — Settings hub (SCREENS §7 X1–X14).
 */
export default function SettingsHubScreen() {
  const router = useRouter();
  const { colors, fontsLoaded, type } = useTheme();
  const isPrivate = useIsPrivate();
  const { planId, privateUntil } = useEntitlement();
  const title = type("title");
  const bodySm = type("bodySm");
  const meta = type("meta");

  const sections: Section[] = [
    {
      title: "You",
      rows: [
        {
          label: "Profile",
          body: "Display name and email",
          href: "/settings/profile" as Href,
          icon: User,
          testID: "settings-row-profile",
        },
        {
          label: "Birth",
          body: "Edit facts → recompute natal",
          href: "/settings/birth" as Href,
          icon: Baby,
          testID: "settings-row-birth",
        },
        {
          label: "Appearance",
          body: "Ink / Dawn",
          href: "/settings/appearance" as Href,
          icon: Moon,
          testID: "settings-row-appearance",
        },
        {
          label: "Notifications",
          body: "Local prefs + push stub",
          href: "/settings/notifications" as Href,
          icon: Bell,
          testID: "settings-row-notifications",
        },
        {
          label: "Memories",
          body: "Pin and delete Lens context",
          href: "/settings/memories" as Href,
          icon: Brain,
          testID: "settings-row-memories",
        },
      ],
    },
    {
      title: "Subscription",
      rows: [
        {
          label: "Subscription",
          body: isPrivate
            ? `Private · ${planId ?? "active"}${privateUntil ? ` · renews ${privateUntil.slice(0, 10)}` : ""}`
            : "Free observatory · open Private plans",
          href: "/settings/subscription" as Href,
          icon: CreditCard,
          testID: "settings-row-subscription",
        },
        {
          label: "Restore purchases",
          body: "Re-apply Private from this Apple ID / Google account",
          href: "/settings/restore" as Href,
          icon: RotateCcw,
          testID: "settings-row-restore",
        },
        {
          label: "Export data",
          body: isPrivate ? "Journal + memories JSON" : "Private unlocks export",
          href: "/settings/export" as Href,
          icon: Download,
          testID: "settings-row-export",
        },
        {
          label: "See Private plans",
          body: "Monthly / yearly · trial on yearly",
          href: "/paywall/plans" as Href,
          icon: Sparkles,
          testID: "settings-row-plans",
        },
      ],
    },
    {
      title: "Trust",
      rows: [
        {
          label: "Privacy",
          body: "What we keep on device and in cloud",
          href: "/settings/privacy" as Href,
          icon: Shield,
          testID: "settings-row-privacy",
        },
        {
          label: "Terms of use",
          body: "Subscriptions and acceptable use",
          href: "/settings/terms" as Href,
          icon: FileText,
          testID: "settings-row-terms",
        },
        {
          label: "Disclaimer",
          body: "Astrology and AI limits",
          href: "/settings/disclaimer" as Href,
          icon: BookOpen,
          testID: "settings-row-disclaimer",
        },
        {
          label: "Support",
          body: "FAQ and email",
          href: "/settings/support" as Href,
          icon: HelpCircle,
          testID: "settings-row-support",
        },
      ],
    },
    {
      title: "Danger",
      rows: [
        {
          label: "Delete & wipe",
          body: "Erase local data · replay welcome / onboarding",
          href: "/settings/delete" as Href,
          icon: Trash2,
          testID: "settings-row-delete",
        },
      ],
    },
  ];

  if (!fontsLoaded) {
    return <View style={[styles.fill, { backgroundColor: colors.void }]} />;
  }

  return (
    <AtmosphericBackground atmosphere="neutral">
      <SafeAreaView style={styles.fill} edges={["top"]} testID="settings-hub">
        <ScreenHeader title="Settings" onBack={() => router.back()} />
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <OfflineBanner />
          <BillingIssueBanner />
          {sections.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text
                style={{
                  fontFamily: meta.fontFamily,
                  fontSize: 10,
                  letterSpacing: meta.letterSpacing,
                  color: colors.text3,
                  textTransform: "uppercase",
                  marginBottom: space.sm,
                }}
              >
                {section.title}
              </Text>
              {section.rows.map((row) => {
                const Glyph = row.icon;
                return (
                  <SoftPress
                    key={row.label}
                    testID={row.testID}
                    accessibilityRole="button"
                    accessibilityLabel={row.label}
                    onPress={() => router.push(row.href)}
                    style={[
                      styles.row,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.hairline,
                      },
                    ]}
                  >
                    <Glyph
                      size={20}
                      color={
                        section.title === "Danger"
                          ? colors.critical
                          : colors.accent
                      }
                      strokeWidth={1.7}
                      accessibilityElementsHidden
                    />
                    <View style={styles.rowCopy}>
                      <Text
                        style={{
                          fontFamily: title.fontFamily,
                          fontSize: 18,
                          lineHeight: 24,
                          color:
                            section.title === "Danger"
                              ? colors.critical
                              : colors.text1,
                        }}
                      >
                        {row.label}
                      </Text>
                      <Text
                        style={{
                          marginTop: 4,
                          fontFamily: bodySm.fontFamily,
                          fontSize: bodySm.fontSize,
                          lineHeight: bodySm.lineHeight,
                          color: colors.text2,
                        }}
                      >
                        {row.body}
                      </Text>
                    </View>
                  </SoftPress>
                );
              })}
            </View>
          ))}
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
    gap: space.lg,
  },
  section: {
    gap: space.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: space.md,
    padding: space.lg,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 72,
  },
  rowCopy: {
    flex: 1,
  },
});
