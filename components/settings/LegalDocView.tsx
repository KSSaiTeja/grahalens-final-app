import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { Hairline } from "@/components/ui/Hairline";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import type { LegalDoc } from "@/lib/settings/legal";
import { space, useTheme } from "@/theme";

type Props = {
  doc: LegalDoc;
  testID: string;
};

/** Shared chrome for privacy / terms / disclaimer. */
export function LegalDocView({ doc, testID }: Props) {
  const router = useRouter();
  const { colors, fontsLoaded, type } = useTheme();
  const title = type("title");
  const body = type("body");
  const bodySm = type("bodySm");
  const meta = type("meta");

  if (!fontsLoaded) {
    return <View style={[styles.fill, { backgroundColor: colors.void }]} />;
  }

  return (
    <AtmosphericBackground atmosphere="neutral">
      <SafeAreaView style={styles.fill} edges={["top"]} testID={testID}>
        <ScreenHeader title={doc.title} onBack={() => router.back()} />
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Text
            style={{
              fontFamily: meta.fontFamily,
              fontSize: 10,
              letterSpacing: meta.letterSpacing,
              color: colors.text3,
              textTransform: "uppercase",
              marginBottom: space.lg,
            }}
          >
            Updated {doc.updated}
          </Text>
          {doc.sections.map((section, i) => (
            <View key={section.heading}>
              {i > 0 ? <Hairline style={styles.rule} /> : null}
              <Text
                style={{
                  fontFamily: title.fontFamily,
                  fontSize: 20,
                  lineHeight: 26,
                  color: colors.text1,
                }}
              >
                {section.heading}
              </Text>
              <Text
                style={{
                  marginTop: space.sm,
                  fontFamily: body.fontFamily,
                  fontSize: body.fontSize,
                  lineHeight: body.lineHeight,
                  color: colors.text2,
                }}
              >
                {section.body}
              </Text>
            </View>
          ))}
          <Text
            style={{
              marginTop: space.xl,
              fontFamily: bodySm.fontFamily,
              fontSize: bodySm.fontSize,
              lineHeight: bodySm.lineHeight,
              color: colors.text3,
            }}
          >
            Ship draft for product clarity — counsel review before store
            submission.
          </Text>
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
  rule: {
    marginVertical: space.lg,
  },
});
