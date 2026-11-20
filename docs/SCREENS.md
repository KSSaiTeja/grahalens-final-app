# Grahalens — Production Screen Map

> Normative inventory. Every screen below ships in this build with **real
> navigation, real state, real empty/loading/error**, and entitlement checks.
> Visual source of truth: `BRAND-BOOK.md`. Product rules: `PRD.md`.
> Competitive DNA: Nummi AI (companion + Vedic + past life + journal) ×
> Co-Star (daily sky + friends/compatibility + premium gates) — **Grahalens voice
> and Observatory craft, never a pixel-for-pixel rip**.

Primary canvas: **390 × 844**. All screens designed Ink + Dawn.

---

## 0. Entitlement legend

| Code | Meaning |
|---|---|
| `FREE` | Available without subscription |
| `PRIVATE` | Requires active `grahalens_private` entitlement |
| `SOFT` | Visible on free; CTA opens paywall; limited preview allowed |
| `GATE` | Hard-blocked on free — paywall sheet, no fake content behind |

---

## 1. Auth & first-run (Nummi-class welcome)

| ID | Route | Purpose | Entitlement |
|---|---|---|---|
| A1 | `/(auth)/splash` | Brand mark + breathe orb → route decision | — |
| A2 | `/(auth)/welcome` | 3-page carousel: companion / sky / bonds — one CTA | FREE |
| A3 | `/(auth)/sign-in` | Magic link + Apple + Google (Apple/Google optional if keys set) | FREE |
| A4 | `/(auth)/sign-up` | Create account (or collapse into sign-in) | FREE |
| A5 | `/(auth)/guest` | Continue without account (local observatory) | FREE |
| A6 | `/onboarding/date` | Birth date | FREE |
| A7 | `/onboarding/time` | Birth time + “I don’t know” | FREE |
| A8 | `/onboarding/place` | Place search + top cities offline | FREE |
| A9 | `/onboarding/confirm` | Review birth facts before compute | FREE |
| A10 | `/onboarding/computing` | Honest stages: resolve → natal → dasha → weather | FREE |
| A11 | `/paywall/welcome` | Soft paywall after first chart (skippable once) | SOFT |

---

## 2. Tab: Sky (Co-Star daily + Nummi guidance)

| ID | Route | Purpose | Entitlement |
|---|---|---|---|
| S1 | `/(app)/sky` | Home: Sky Weather, Muhurta, daily Lens note, chart peek | FREE |
| S2 | `/(app)/sky/weather` | Full weather axes + rule explanations | FREE |
| S3 | `/(app)/sky/muhurta/[id]` | Single window detail | FREE |
| S4 | `/(app)/sky/day/[date]` | Archive of past days (7 free / unlimited Private) | SOFT |
| S5 | `/(app)/sky/inbox` | In-app “today’s notes” list (push stub content) | FREE |

---

## 3. Tab: Chart (calculator-grade, living)

| ID | Route | Purpose | Entitlement |
|---|---|---|---|
| C1 | `/(app)/chart` | Living Chart + placements list | FREE |
| C2 | `/(app)/chart/planet/[name]` | Placement sheet → full planet page | FREE |
| C3 | `/(app)/chart/dasha` | Full Dasha Ribbon + period prose | FREE |
| C4 | `/(app)/chart/dasha/[key]` | Maha/antar deep read | SOFT |
| C5 | `/(app)/chart/transits` | Transit choreography day view | FREE |
| C6 | `/(app)/chart/aspects` | Natal aspect table | FREE |
| C7 | `/(app)/chart/profile` | Cosmic profile summary (Nummi-like “who you are”) | SOFT |

---

## 4. Tab: Lens (Nummi companion)

| ID | Route | Purpose | Entitlement |
|---|---|---|---|
| L1 | `/(app)/lens` | Active thread + composer | FREE (quota) |
| L2 | `/(app)/lens/threads` | Thread list | FREE |
| L3 | `/(app)/lens/thread/[id]` | Historical thread | FREE |
| L4 | `/(app)/lens/starters` | Starter prompts by topic (love/work/self) | FREE |
| L5 | `/(app)/lens/memories` | Memory manager (pin/delete) | FREE |
| L6 | — | Soft gate after daily free message quota | GATE → paywall |

**Free quota:** 5 grounded Lens messages / UTC day. Private: unlimited.

---

## 5. Tab: Bonds (Co-Star friends / compatibility)

| ID | Route | Purpose | Entitlement |
|---|---|---|---|
| B1 | `/(app)/bonds` | Bond list | FREE (1 bond) |
| B2 | `/(app)/bonds/add` | Wizard: name → date → time → place → compute | FREE first |
| B3 | `/(app)/bonds/[id]` | Bond home: constellation peek + domains | FREE |
| B4 | `/(app)/bonds/[id]/constellation` | Full Bond Constellation | FREE |
| B5 | `/(app)/bonds/[id]/domain/[key]` | Domain deep read (Talk/Care/Spark/Friction/Growth) | SOFT |
| B6 | `/(app)/bonds/[id]/share` | Screenshot-ready share card (no snark) | FREE |
| B7 | — | Add bond #2+ | GATE |

---

## 6. Tab: Atelier (Nummi journal + past life)

| ID | Route | Purpose | Entitlement |
|---|---|---|---|
| R1 | `/(app)/atelier` | Hub: journal, soul, patterns | FREE |
| R2 | `/(app)/atelier/journal` | Entry list | FREE |
| R3 | `/(app)/atelier/journal/new` | Compose with weather-linked prompt | FREE |
| R4 | `/(app)/atelier/journal/[id]` | Entry detail + edit/delete | FREE |
| R5 | `/(app)/atelier/soul` | Soul Cartography portrait | GATE (preview blurb FREE) |
| R6 | `/(app)/atelier/patterns` | Weekly Pattern Thread | GATE |
| R7 | `/(app)/atelier/check-in` | Emotional check-in → feeds memory | FREE |

---

## 7. Settings & account

| ID | Route | Purpose | Entitlement |
|---|---|---|---|
| X1 | `/settings` | Hub | FREE |
| X2 | `/settings/profile` | Display name, email | FREE |
| X3 | `/settings/birth` | Edit birth → recompute confirm | FREE |
| X4 | `/settings/appearance` | Ink / Dawn | FREE |
| X5 | `/settings/notifications` | Prefs (local + push stub) | FREE |
| X6 | `/settings/memories` | Same as L5, settings entry | FREE |
| X7 | `/settings/subscription` | Plan status, renew date, manage | FREE |
| X8 | `/settings/restore` | Restore purchases | FREE |
| X9 | `/settings/privacy` | Privacy policy | FREE |
| X10 | `/settings/terms` | Terms of use | FREE |
| X11 | `/settings/disclaimer` | Astrology / AI disclaimer | FREE |
| X12 | `/settings/support` | FAQ + contact mailto | FREE |
| X13 | `/settings/delete` | Delete account + wipe local | FREE |
| X14 | `/settings/export` | Export journal/memories JSON | PRIVATE |

---

## 8. Payment & subscription (production logic)

| ID | Route | Purpose | Notes |
|---|---|---|---|
| P1 | `/paywall` | Full-screen plans (Monthly / Yearly + trial badge) | RevenueCat offerings |
| P2 | `/paywall/sheet` | Modal gate from feature taps | Same offerings, compact |
| P3 | `/paywall/success` | Confirmation + “Enter observatory” | After purchase/restore |
| P4 | `/paywall/unavailable` | Store unavailable / offline purchase fail | Honest recovery |
| P5 | `/settings/subscription` | Active plan, cancel education (store-managed) | Links to OS manage |

### Products (locked names)

| Product id | Type | Display (US default) |
|---|---|---|
| `grahalens_private_monthly` | auto-renew | Grahalens Private · Monthly · $7.99 |
| `grahalens_private_yearly` | auto-renew | Grahalens Private · Yearly · $49.99 (3-day trial) |

Entitlement id: `grahalens_private`.

### Purchase state machine (must implement)

```
idle → loading_offerings → ready
ready → purchasing → success | failed | cancelled
ready → restoring → success | empty | failed
success → refresh_customer_info → unlock UI
billing_issue → grace banner on Sky + Settings
```

Dev: `EXPO_PUBLIC_IAP_MODE=mock` simulates purchase without StoreKit.
Prod: RevenueCat + App Store / Play products configured per `SETUP.md`.

---

## 9. Global chrome & system

| ID | Surface | Purpose |
|---|---|---|
| G1 | Tab bar | `ObservatoryTabBar` — 5 custom SVG tabs, champagne active, safe-area, hairline; see BRAND §07 |
| G2 | Offline banner | L3 ladder |
| G3 | Billing issue banner | Grace / hold |
| G4 | Quota chip on Lens | “3 of 5 free today” → upgrade |
| G5 | Feature lock glyph | Champagne lock on GATE rows |
| G6 | `+not-found` | Honest 404 |
| G7 | `/dev/system` | Design gallery (dev only) |
| G8 | `/dev/screens` | Screen index linking every route (dev only) |

---

## 10. Production quality bar (every screen)

1. **No lorem / no fake planets / no “coming soon”** as a dead end — either real
   content, gated paywall, or honest empty.
2. Loading, empty, error, offline variants implemented.
3. Back navigation + deep link params work.
4. Free vs Private behavior verified on that screen.
5. Brand §14 checklist applicable items pass.
6. Analytics events fired where listed in PRD §13.

---

## 11. Maestro smoke path (minimum)

Welcome → Guest → Onboarding → Computing → Soft paywall Skip → Sky → Chart
planet → Lens message → Bonds add → Atelier journal → Settings → Paywall
mock purchase → Success → Soul unlocked.
