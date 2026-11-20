import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowRight } from "lucide-react-native";

import { AtmosphericBackground } from "@/components/ui/AtmosphericBackground";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { useTheme, layout, fontFamilies } from "@/theme";
import {
  sendMagicLink,
  continueAsGuest,
  decidePostSplashRoute,
  hrefForDestination,
  useSession,
} from "@/lib/session";
import { useIsPrivate } from "@/lib/billing/entitlements";
import { isSupabaseConfigured as cloudReady } from "@/lib/supabase/client";

/**
 * A4 — Create account (same magic-link path; Supabase creates user on first OTP).
 */
export default function SignUpScreen() {
  const { colors, type, fontsLoaded } = useTheme();
  const router = useRouter();
  const { hasChart, skippedWelcomePaywall } = useSession();
  const isPrivate = useIsPrivate();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [message, setMessage] = useState<string | null>(null);

  const title = type("displayL");
  const body = type("body");
  const bodySm = type("bodySm");
  const meta = type("meta");

  const onSend = async () => {
    setStatus("sending");
    setMessage(null);
    const result = await sendMagicLink(email);
    if (result.ok) {
      setStatus("sent");
      setMessage("Check your email to finish creating your observatory.");
      return;
    }
    setStatus("error");
    setMessage(result.message);
  };

  const enterGuest = async () => {
    await continueAsGuest();
    const dest = decidePostSplashRoute({
      mode: "guest",
      hasChart,
      hasSeenWelcome: true,
      skippedWelcomePaywall,
      isPrivate,
    });
    router.replace(hrefForDestination(dest));
  };

  if (!fontsLoaded) {
    return <View style={[styles.fill, { backgroundColor: colors.void }]} />;
  }

  return (
    <AtmosphericBackground atmosphere="neutral">
      <SafeAreaView style={styles.fill} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={styles.fill}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScreenHeader title="Create account" onBack={() => router.back()} />

          <View style={styles.content}>
            <Text
              style={{
                fontFamily: title.fontFamily,
                fontSize: title.fontSize,
                lineHeight: title.lineHeight,
                color: colors.text1,
              }}
            >
              Keep your chart close.
            </Text>
            <Text
              style={{
                marginTop: 12,
                fontFamily: body.fontFamily,
                fontSize: body.fontSize,
                lineHeight: body.lineHeight,
                color: colors.text2,
              }}
            >
              Same magic link — your chart syncs when you are ready. Guest mode
              stays on this device until you link.
            </Text>

            <GlassPanel style={styles.inputPanel} padded={false}>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@email.com"
                placeholderTextColor={colors.text3}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                autoComplete="email"
                accessibilityLabel="Email"
                style={[
                  styles.input,
                  {
                    color: colors.text1,
                    fontFamily: fontFamilies.body,
                  },
                ]}
              />
            </GlassPanel>

            {message ? (
              <Text
                style={{
                  marginTop: 12,
                  fontFamily: bodySm.fontFamily,
                  fontSize: bodySm.fontSize,
                  lineHeight: bodySm.lineHeight,
                  color:
                    status === "error" ? colors.caution : colors.text2,
                }}
                accessibilityLiveRegion="polite"
              >
                {message}
              </Text>
            ) : null}

            {!cloudReady ? (
              <Text
                style={{
                  marginTop: 12,
                  fontFamily: bodySm.fontFamily,
                  fontSize: bodySm.fontSize,
                  lineHeight: bodySm.lineHeight,
                  color: colors.text3,
                }}
              >
                Cloud sign-up needs Supabase keys. Continue as guest for now
                (docs/SETUP.md).
              </Text>
            ) : null}

          </View>

          <View style={styles.footer}>
            <Button
              label={status === "sent" ? "Link sent" : "Send magic link"}
              icon={ArrowRight}
              onPress={onSend}
              loading={status === "sending"}
              disabled={status === "sending" || status === "sent"}
            />
            <Link href="/(auth)/sign-in" asChild>
              <Pressable
                style={({ pressed }) => [
                  styles.textLink,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
                accessibilityRole="link"
              >
                <Text
                  style={{
                    fontFamily: meta.fontFamily,
                    fontSize: meta.fontSize,
                    letterSpacing: meta.letterSpacing,
                    color: colors.accent,
                    textAlign: "center",
                  }}
                >
                  Already have an account — Sign in
                </Text>
              </Pressable>
            </Link>

            <Button
              label="Continue as guest"
              variant="ghost"
              onPress={enterGuest}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AtmosphericBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  input: {
    height: layout.ctaHeight,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  inputPanel: {
    marginTop: 28,
    borderRadius: layout.ctaRadius,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 8,
  },
  textLink: {
    minHeight: layout.minHit,
    alignItems: "center",
    justifyContent: "center",
  },
});
