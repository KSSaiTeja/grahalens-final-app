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
  appleAuthAvailable,
  googleAuthAvailable,
  continueAsGuest,
  decidePostSplashRoute,
  hrefForDestination,
  useSession,
  devBypassAsGuest,
} from "@/lib/session";
import { useIsPrivate } from "@/lib/billing/entitlements";
import { isSupabaseConfigured as cloudReady } from "@/lib/supabase/client";

/**
 * A3 — Magic link + optional Apple/Google when keys set.
 */
export default function SignInScreen() {
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
      setMessage("Check your email for the sign-in link.");
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
          <ScreenHeader title="Sign in" onBack={() => router.back()} />

          <View style={styles.content}>
            <Text
              style={{
                fontFamily: title.fontFamily,
                fontSize: title.fontSize,
                lineHeight: title.lineHeight,
                color: colors.text1,
              }}
            >
              Your observatory is waiting.
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
              Magic link to your observatory. No password to forget.
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
                Supabase keys unset — cloud magic link unavailable. Continue as
                guest (docs/SETUP.md).
              </Text>
            ) : null}

            <View style={styles.ctaBlock}>
              {appleAuthAvailable() ? (
                <Button
                  label="Continue with Apple"
                  variant="secondary"
                  onPress={() =>
                    setMessage(
                      "Apple Sign In wires when EXPO_PUBLIC_APPLE_AUTH=1 and native capability are ready.",
                    )
                  }
                />
              ) : null}

              {googleAuthAvailable() ? (
                <Button
                  label="Continue with Google"
                  variant="secondary"
                  onPress={() =>
                    setMessage(
                      "Google Sign In wires when EXPO_PUBLIC_GOOGLE_AUTH=1.",
                    )
                  }
                />
              ) : null}
            </View>
          </View>

          <View style={styles.footer}>
            <Button
              label={status === "sent" ? "Link sent" : "Send magic link"}
              icon={ArrowRight}
              onPress={onSend}
              loading={status === "sending"}
              disabled={status === "sending" || status === "sent"}
            />
            <Link href="/(auth)/sign-up" asChild>
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
                  Create account
                </Text>
              </Pressable>
            </Link>

            <Button
              label="Continue as guest"
              variant="ghost"
              onPress={enterGuest}
            />

            {__DEV__ ? (
              <Pressable
                onPress={async () => {
                  await devBypassAsGuest();
                  router.replace("/onboarding/date");
                }}
                accessibilityRole="button"
                accessibilityLabel="Dev bypass enter as guest"
                style={({ pressed }) => [
                  styles.devBypass,
                  {
                    borderColor: colors.hairline,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text
                  style={{
                    fontFamily: bodySm.fontFamily,
                    fontSize: 12,
                    color: colors.text3,
                  }}
                >
                  Dev bypass — guest onboarding
                </Text>
              </Pressable>
            ) : null}
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
  ctaBlock: {
    marginTop: 20,
    gap: 12,
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
  devBypass: {
    marginTop: 4,
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    minHeight: layout.minHit,
    justifyContent: "center",
  },
});
