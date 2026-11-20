import { decidePostSplashRoute } from "@/lib/session/routing";

describe("decidePostSplashRoute", () => {
  it("sends anonymous users to welcome", () => {
    expect(
      decidePostSplashRoute({
        mode: "anonymous",
        hasChart: false,
        hasSeenWelcome: false,
      }),
    ).toBe("/(auth)/welcome");
  });

  it("sends guest without chart to onboarding", () => {
    expect(
      decidePostSplashRoute({
        mode: "guest",
        hasChart: false,
        hasSeenWelcome: true,
      }),
    ).toBe("/onboarding/date");
  });

  it("sends authenticated without chart to onboarding", () => {
    expect(
      decidePostSplashRoute({
        mode: "authenticated",
        hasChart: false,
        hasSeenWelcome: true,
      }),
    ).toBe("/onboarding/date");
  });

  it("sends guest with chart to soft welcome paywall when not skipped", () => {
    expect(
      decidePostSplashRoute({
        mode: "guest",
        hasChart: true,
        hasSeenWelcome: true,
        skippedWelcomePaywall: false,
      }),
    ).toBe("/paywall/welcome");
  });

  it("sends guest with chart to sky after soft paywall skip", () => {
    expect(
      decidePostSplashRoute({
        mode: "guest",
        hasChart: true,
        hasSeenWelcome: true,
        skippedWelcomePaywall: true,
      }),
    ).toBe("/(app)/sky");
  });

  it("sends guest with chart to sky when Private without skip", () => {
    expect(
      decidePostSplashRoute({
        mode: "guest",
        hasChart: true,
        hasSeenWelcome: true,
        skippedWelcomePaywall: false,
        isPrivate: true,
      }),
    ).toBe("/(app)/sky");
  });

  it("sends authenticated with chart to sky after skip", () => {
    expect(
      decidePostSplashRoute({
        mode: "authenticated",
        hasChart: true,
        hasSeenWelcome: true,
        skippedWelcomePaywall: true,
      }),
    ).toBe("/(app)/sky");
  });
});
