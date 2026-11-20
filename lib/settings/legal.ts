/**
 * In-app legal copy for Settings X9–X11 (ship drafts — counsel review before store).
 */

export type LegalDoc = {
  title: string;
  updated: string;
  sections: { heading: string; body: string }[];
};

export const PRIVACY_POLICY: LegalDoc = {
  title: "Privacy policy",
  updated: "2026-07-01",
  sections: [
    {
      heading: "What we keep on device",
      body: "Birth facts, natal chart payload, journal, Lens memories, Bonds, and notification prefs live on your device by default. Guest mode does not require an account.",
    },
    {
      heading: "When you sign in",
      body: "If you use magic-link auth, we store the minimum needed to restore your session (email, profile display name, entitlement sync fields). Cloud sync of journal and memories is optional and expands only when you opt into a signed-in observatory.",
    },
    {
      heading: "Purchases",
      body: "Subscriptions are processed by Apple or Google. We receive entitlement status via RevenueCat (or the mock store in development) — not your full payment card details.",
    },
    {
      heading: "AI processing",
      body: "Lens and Soul requests send grounded chart facts and your message to the configured model provider. We do not sell personal data. Export (Private) lets you take a JSON copy of local journal and memories.",
    },
    {
      heading: "Contact",
      body: "Privacy questions: support@grahalens.app",
    },
  ],
};

export const TERMS_OF_USE: LegalDoc = {
  title: "Terms of use",
  updated: "2026-07-01",
  sections: [
    {
      heading: "The observatory",
      body: "Grahalens provides Vedic-inspired chart computation and reflective narration for personal use. You must be old enough to consent to digital services in your region.",
    },
    {
      heading: "Subscriptions",
      body: "Grahalens Private is an auto-renewing subscription managed by the App Store or Google Play. Cancel at least 24 hours before renewal in your store account settings. Trial terms appear on the paywall when offered.",
    },
    {
      heading: "Acceptable use",
      body: "Do not misuse the service to harass others, reverse-engineer for competing clones, or attempt to extract training data. We may suspend abuse.",
    },
    {
      heading: "Availability",
      body: "Ephemeris and AI features may be unavailable offline or during provider outages. Core chart math for a saved birth works on device.",
    },
  ],
};

export const DISCLAIMER: LegalDoc = {
  title: "Astrology & AI disclaimer",
  updated: "2026-07-01",
  sections: [
    {
      heading: "Not advice",
      body: "Grahalens is for reflection and literacy. It is not medical, legal, financial, or professional advice. Do not use chart output as a substitute for licensed counsel.",
    },
    {
      heading: "Computation honesty",
      body: "Placements use whole-sign Lahiri houses. When birth time is unknown, Lagna and houses are marked approximate. Narration is grounded to computed facts — still interpretive language, not destiny.",
    },
    {
      heading: "AI limits",
      body: "Companion text can be wrong or incomplete. Prefer the chart instruments when something matters. Past-life or mythic framing is reflective metaphor, not historical claim.",
    },
  ],
};

export const SUPPORT_EMAIL = "support@grahalens.app";

export const SUPPORT_FAQ: { q: string; a: string }[] = [
  {
    q: "How do I cancel Private?",
    a: "Subscriptions are managed by Apple or Google. Open Settings → Subscription → Manage in store, or use your device’s subscription list.",
  },
  {
    q: "Birth time unknown?",
    a: "Onboarding and Settings → Birth let you mark time unknown. Houses and Lagna stay approximate until you add a time and recompute.",
  },
  {
    q: "Where is my data?",
    a: "Guest observatories stay on device. Export (Private) shares journal + memories as JSON. Delete account wipes local data; store billing remains until you cancel there.",
  },
  {
    q: "Restore purchases?",
    a: "Settings → Restore reapplies Private for this store account without buying again.",
  },
];
