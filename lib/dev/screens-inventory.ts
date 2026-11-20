/**
 * SCREENS.md inventory for /dev/screens (G8).
 * Status tracks build progress across prompts.
 */

import { computeDasha } from "@/lib/ephemeris/dasha";
import { civilDateInTz, noonOnCivilDate } from "@/lib/sky/archive";
import { computeMuhurtaMoments } from "@/lib/sky/muhurta-moments";
import { resolveNatalFromStore } from "@/lib/sky/resolve-natal";

export type ScreenStatus = "built" | "pending";

export type ScreenEntry = {
  id: string;
  route: string;
  purpose: string;
  status: ScreenStatus;
};

/** Concrete deep links for dynamic Sky / Chart routes (fixture natal). */
function skyDevSamples(): { day: string; muhurta: string; dasha: string } {
  try {
    const { natal } = resolveNatalFromStore(null);
    const today = civilDateInTz(new Date(), natal.tz);
    const day = computeMuhurtaMoments(
      natal,
      noonOnCivilDate(today, natal.tz),
    );
    const top = [...day.moments].sort((a, b) => b.score - a.score)[0];
    const timeline = computeDasha(natal, 1);
    const antar =
      timeline.periods.find((p) => p.level === "antar") ??
      timeline.periods[0];
    return {
      day: `/(app)/sky/day/${today}`,
      muhurta: top
        ? `/(app)/sky/muhurta/${encodeURIComponent(top.id)}`
        : `/(app)/sky/muhurta/${encodeURIComponent(`${today}:focus:1200`)}`,
      dasha: antar
        ? `/(app)/chart/dasha/${encodeURIComponent(antar.key)}`
        : "/(app)/chart/dasha",
    };
  } catch {
    return {
      day: "/(app)/sky/day/2026-07-29",
      muhurta: "/(app)/sky/muhurta/2026-07-29%3Afocus%3A1200",
      dasha: "/(app)/chart/dasha",
    };
  }
}

const SKY_DEV = skyDevSamples();

export const SCREEN_INVENTORY: ScreenEntry[] = [
  // Auth & first-run
  {
    id: "A1",
    route: "/(auth)/splash",
    purpose: "Brand mark + breathe orb → route decision",
    status: "built",
  },
  {
    id: "A2",
    route: "/(auth)/welcome",
    purpose: "3-page carousel: companion / sky / bonds",
    status: "built",
  },
  {
    id: "A3",
    route: "/(auth)/sign-in",
    purpose: "Magic link + Apple + Google",
    status: "built",
  },
  {
    id: "A4",
    route: "/(auth)/sign-up",
    purpose: "Create account",
    status: "built",
  },
  {
    id: "A5",
    route: "/(auth)/guest",
    purpose: "Continue without account",
    status: "built",
  },
  {
    id: "A6",
    route: "/onboarding/date",
    purpose: "Birth date",
    status: "built",
  },
  {
    id: "A7",
    route: "/onboarding/time",
    purpose: "Birth time + I don’t know",
    status: "built",
  },
  {
    id: "A8",
    route: "/onboarding/place",
    purpose: "Place search + top cities",
    status: "built",
  },
  {
    id: "A9",
    route: "/onboarding/confirm",
    purpose: "Review birth facts",
    status: "built",
  },
  {
    id: "A10",
    route: "/onboarding/computing",
    purpose: "Honest compute stages",
    status: "built",
  },
  {
    id: "A11",
    route: "/paywall/welcome",
    purpose: "Soft paywall after first chart",
    status: "built",
  },

  // Sky
  {
    id: "S1",
    route: "/(app)/sky",
    purpose: "Sky home",
    status: "built",
  },
  {
    id: "S2",
    route: "/(app)/sky/weather",
    purpose: "Full weather axes",
    status: "built",
  },
  {
    id: "S3",
    route: SKY_DEV.muhurta,
    purpose: "Muhurta detail",
    status: "built",
  },
  {
    id: "S4",
    route: SKY_DEV.day,
    purpose: "Day archive",
    status: "built",
  },
  {
    id: "S5",
    route: "/(app)/sky/inbox",
    purpose: "Today’s notes inbox",
    status: "built",
  },

  // Chart
  {
    id: "C1",
    route: "/(app)/chart",
    purpose: "Living Chart + placements",
    status: "built",
  },
  {
    id: "C2",
    route: "/(app)/chart/planet/sun",
    purpose: "Planet page",
    status: "built",
  },
  {
    id: "C3",
    route: "/(app)/chart/dasha",
    purpose: "Dasha ribbon",
    status: "built",
  },
  {
    id: "C4",
    route: SKY_DEV.dasha,
    purpose: "Maha/antar deep read",
    status: "built",
  },
  {
    id: "C5",
    route: "/(app)/chart/transits",
    purpose: "Transit choreography",
    status: "built",
  },
  {
    id: "C6",
    route: "/(app)/chart/aspects",
    purpose: "Natal aspect table",
    status: "built",
  },
  {
    id: "C7",
    route: "/(app)/chart/profile",
    purpose: "Cosmic profile",
    status: "built",
  },

  // Lens
  {
    id: "L1",
    route: "/(app)/lens",
    purpose: "Active thread + composer",
    status: "built",
  },
  {
    id: "L2",
    route: "/(app)/lens/threads",
    purpose: "Thread list",
    status: "built",
  },
  {
    id: "L3",
    route: "/(app)/lens/thread/[id]",
    purpose: "Historical thread",
    status: "built",
  },
  {
    id: "L4",
    route: "/(app)/lens/starters",
    purpose: "Starter prompts",
    status: "built",
  },
  {
    id: "L5",
    route: "/(app)/lens/memories",
    purpose: "Memory manager",
    status: "built",
  },
  {
    id: "L6",
    route: "/paywall/sheet?reason=lens_quota",
    purpose: "Lens quota gate",
    status: "built",
  },

  // Bonds
  {
    id: "B1",
    route: "/(app)/bonds",
    purpose: "Bond list",
    status: "built",
  },
  {
    id: "B2",
    route: "/(app)/bonds/add",
    purpose: "Add bond wizard",
    status: "built",
  },
  {
    id: "B3",
    route: "/(app)/bonds/[id]",
    purpose: "Bond home",
    status: "built",
  },
  {
    id: "B4",
    route: "/(app)/bonds/[id]/constellation",
    purpose: "Bond Constellation",
    status: "built",
  },
  {
    id: "B5",
    route: "/(app)/bonds/[id]/domain/[key]",
    purpose: "Domain deep read",
    status: "built",
  },
  {
    id: "B6",
    route: "/(app)/bonds/[id]/share",
    purpose: "Share card",
    status: "built",
  },
  {
    id: "B7",
    route: "/paywall/sheet?reason=bond_limit",
    purpose: "Bond #2+ gate",
    status: "built",
  },

  // Atelier
  {
    id: "R1",
    route: "/(app)/atelier",
    purpose: "Atelier hub",
    status: "built",
  },
  {
    id: "R2",
    route: "/(app)/atelier/journal",
    purpose: "Journal list",
    status: "built",
  },
  {
    id: "R3",
    route: "/(app)/atelier/journal/new",
    purpose: "Compose entry",
    status: "built",
  },
  {
    id: "R4",
    route: "/(app)/atelier/journal/[id]",
    purpose: "Entry detail",
    status: "built",
  },
  {
    id: "R5",
    route: "/(app)/atelier/soul",
    purpose: "Soul Cartography",
    status: "built",
  },
  {
    id: "R6",
    route: "/(app)/atelier/patterns",
    purpose: "Pattern Thread",
    status: "built",
  },
  {
    id: "R7",
    route: "/(app)/atelier/check-in",
    purpose: "Emotional check-in",
    status: "built",
  },

  // Settings
  {
    id: "X1",
    route: "/settings",
    purpose: "Settings hub",
    status: "built",
  },
  {
    id: "X2",
    route: "/settings/profile",
    purpose: "Display name, email",
    status: "built",
  },
  {
    id: "X3",
    route: "/settings/birth",
    purpose: "Edit birth",
    status: "built",
  },
  {
    id: "X4",
    route: "/settings/appearance",
    purpose: "Ink / Dawn",
    status: "built",
  },
  {
    id: "X5",
    route: "/settings/notifications",
    purpose: "Notification prefs",
    status: "built",
  },
  {
    id: "X6",
    route: "/settings/memories",
    purpose: "Memories (settings entry)",
    status: "built",
  },
  {
    id: "X7",
    route: "/settings/subscription",
    purpose: "Plan status",
    status: "built",
  },
  {
    id: "X8",
    route: "/settings/restore",
    purpose: "Restore purchases",
    status: "built",
  },
  {
    id: "X9",
    route: "/settings/privacy",
    purpose: "Privacy policy",
    status: "built",
  },
  {
    id: "X10",
    route: "/settings/terms",
    purpose: "Terms of use",
    status: "built",
  },
  {
    id: "X11",
    route: "/settings/disclaimer",
    purpose: "Astrology / AI disclaimer",
    status: "built",
  },
  {
    id: "X12",
    route: "/settings/support",
    purpose: "FAQ + contact",
    status: "built",
  },
  {
    id: "X13",
    route: "/settings/delete",
    purpose: "Delete account",
    status: "built",
  },
  {
    id: "X14",
    route: "/settings/export",
    purpose: "Export JSON",
    status: "built",
  },

  // Paywall
  {
    id: "P1",
    route: "/paywall",
    purpose: "Full-screen plans",
    status: "built",
  },
  {
    id: "P2",
    route: "/paywall/sheet",
    purpose: "Modal gate sheet",
    status: "built",
  },
  {
    id: "P3",
    route: "/paywall/success",
    purpose: "Purchase confirmation",
    status: "built",
  },
  {
    id: "P4",
    route: "/paywall/unavailable",
    purpose: "Store unavailable",
    status: "built",
  },
  {
    id: "P5",
    route: "/settings/subscription",
    purpose: "Active plan manage",
    status: "built",
  },

  // Global / system
  {
    id: "G1",
    route: "/(app)/sky",
    purpose: "Tab bar (ObservatoryTabBar)",
    status: "built",
  },
  {
    id: "G2",
    route: "/(app)/sky",
    purpose: "Offline banner (L3)",
    status: "built",
  },
  {
    id: "G3",
    route: "/(app)/sky",
    purpose: "Billing issue banner",
    status: "built",
  },
  {
    id: "G4",
    route: "/(app)/lens",
    purpose: "Quota chip on Lens",
    status: "built",
  },
  {
    id: "G5",
    route: "/dev/system",
    purpose: "Feature lock glyph (LockGlyph)",
    status: "built",
  },
  {
    id: "G6",
    route: "/+not-found",
    purpose: "Honest 404",
    status: "built",
  },
  {
    id: "G7",
    route: "/dev/system",
    purpose: "Design gallery",
    status: "built",
  },
  {
    id: "G8",
    route: "/dev/screens",
    purpose: "Screen index",
    status: "built",
  },
];

/** Prompt 30 — inventory must have zero pending. */
export function pendingScreenCount(): number {
  return SCREEN_INVENTORY.filter((s) => s.status === "pending").length;
}
