# Grahalens — Cursor Prompt Pack (v1.1)

> **30 prompts.** Run **in order**, one Cursor chat per prompt. Do not skip
> **Verify**. Specs: `docs/PRD.md`, `docs/BRAND-BOOK.md`, `docs/SCREENS.md`
> (every production route), `PLAN.md`.
>
> Global rules: no placeholder astrology, no lorem, no fake planets, no emoji,
> no purple nebulas, no UI kits, TypeScript strict, BRAND-BOOK voice, every
> SCREENS.md route gets real loading/empty/error — never a dead “coming soon”.

---

## Phase 0 — Foundation

### Prompt 01 — Expo scaffold

```text
Read PLAN.md §2–3 and docs/SCREENS.md header. Scaffold Grahalens at repo root.

Expo SDK 54 + Expo Router + TypeScript strict + Jest. npm. No boilerplate junk.
Pin the scaffold to SDK 54 (match Expo Go on App Store): do not jump to
`create-expo-app@latest` if that resolves newer than 54.
Example: `npx create-expo-app@latest . --template blank-typescript` then ensure
`expo` / related packages are SDK 54, OR use the Expo docs “create a project”
flow with SDK 54. New Architecture: follow Expo 54 defaults for this project.

1. App name/slug grahalens; portrait; splash #07080A; bundle com.grahalens.app.
2. Deps: @supabase/supabase-js, async-storage, expo-secure-store, expo-sqlite,
   zustand, @tanstack/react-query, zod, astronomy-engine, expo-font,
   @expo-google-fonts/cormorant-garamond, manrope, ibm-plex-mono,
   reanimated, gesture-handler, react-native-svg, @shopify/react-native-skia,
   expo-haptics, expo-localization, date-fns, date-fns-tz, groq-sdk,
   react-native-purchases (RevenueCat), expo-apple-authentication (optional),
   lucide-react-native (optional overflow only — tabs/graha MUST be custom SVG).
3. Folders per PLAN §3 including components/billing, components/icons/{tabs,graha,system,domains,weather},
   lib/billing, app/paywall, app/settings, app/dev, maestro/.
4. .env.example: Supabase, GROQ_API_KEY, EXPO_PUBLIC_APP_ENV,
   EXPO_PUBLIC_IAP_MODE=mock, EXPO_PUBLIC_REVENUECAT_IOS_KEY,
   EXPO_PUBLIC_REVENUECAT_ANDROID_KEY.
5. Scripts: start, ios, android, lint, typecheck, test, test:beta, seed.
6. app/index → "grahalens." only after fonts (system serif ok until Prompt 02).

Verify: tsc clean; expo start shows grahalens.
```

### Prompt 02 — Observatory design system + icon pack

```text
Read BRAND-BOOK.md fully — especially §03–§08 (tab bar chrome + iconography).

Build:
1. theme/tokens, typography, motion, ThemeProvider (Ink/Dawn).
2. Wordmark, LensOrb, ObservatoryGrain.
3. UI primitives: Button, Surface, Pill, Hairline, Scrubber, EmptyState,
   SheetScaffold, ThemeToggle.
4. Billing stubs: LockGlyph (uses icons/system/lock), QuotaChip.
5. **Full icon pack** per BRAND-BOOK §08:
   - components/icons/Icon.tsx
   - tabs/: TabSky, TabChart, TabLens, TabBonds, TabAtelier (custom SVG only)
   - graha/: all 9 grahas + Lagna
   - system/: back, close, settings, lock, unlock, share, edit, trash,
     chevron-right, chevron-down, search, check, alert, offline, restore, spark
   - domains/: talk, care, spark, friction, growth
   - weather/: clarity, pressure, friction, opening
   Stroke 1.5, round caps, themeable color. No Ionicons/Material as default.
   lucide-react-native optional ONLY for overflow — not tabs/graha.
6. components/brand/ObservatoryTabBar.tsx implementing §07 bottom tab bar
   table exactly (safe area, hairline, active champagne, no FAB, no badges).
   Export it ready for Prompt 12 to wire into tabs layout.
7. app/dev/system — tokens, orbs, primitives, AND full icon sheet at 16/24/32
   + mock tab bar with all 5 states (each tab active once).

Verify: /dev/system shows every required icon; mock tab bar matches chrome
spec; reduced motion; no emoji; no purple; tab icons are custom SVGs.
```

### Prompt 03 — Supabase schema + clients

```text
Read PRD §9 + PLAN. Migration 0001_init.sql with all tables including
usage_counters, purchase_events, profiles.rc_app_user_id, private_until.
RLS on. lib/supabase/client.ts, lib/types/db.ts, docs/SETUP.md (Expo +
Supabase + RevenueCat dashboard placeholders + mock IAP note).

Verify: SQL valid; tsc passes; SETUP followable.
```

---

## Phase 1 — Ephemeris

### Prompt 04 — Natal (Lahiri whole-sign)

```text
lib/ephemeris/natal.ts + format/degrees + fixtures/chart-a.json + tests.
Tolerance 0.5°. time_unknown → noon + lagnaApproximate.

Verify: npm test natal green.
```

### Prompt 05 — Vimshottari dasha

```text
lib/ephemeris/dasha.ts + currentDasha + tests with frozen Date.

Verify: dasha tests green.
```

### Prompt 06 — Transits + aspects

```text
transits.ts, aspects.ts, orb table documented, tests frozen clock.

Verify: ephemeris suite green.
```

---

## Phase 2 — Intelligence

### Prompt 07 — Sky Weather + Muhurta

```text
lib/sky/sky-weather.ts + muhurta-moments.ts pure deterministic + tests.

Verify: sky tests green.
```

### Prompt 08 — Narrate + grounding

```text
lib/ai/groq.ts, narrate-sky.ts, grounding.ts, fallbacks.ts. No key → fallback.
Grounding tests reject invented placements.

Verify: grounding tests green.
```

### Prompt 09 — Soul heuristics

```text
soul-signatures.ts + soul-cartography.ts + tests signatures ⊆ chart.

Verify: soul tests green.
```

---

## Phase 3 — Auth + onboarding (SCREENS A*)

### Prompt 10 — Auth screens A1–A5

```text
Read SCREENS §1. Implement splash, welcome (3-page carousel), sign-in,
sign-up, guest. Observatory craft. Session provider; routing rules:
no chart → onboarding; else → sky. Guest local SQLite flag.

Verify: splash → welcome → guest enters onboarding; sign-in UI works
(magic link or dev bypass documented in SETUP).
```

### Prompt 11 — Onboarding A6–A10

```text
date, time (+ skip), place (search + top cities), confirm, computing ritual
with real stages calling ephemeris. Persist chart. Errors per PRD §11.

Verify: complete guest onboarding; chart payload in store.
```

### Prompt 12 — Soft welcome paywall A11 + tab shell

```text
Read BRAND-BOOK §07 bottom tab bar + SCREENS G1. Read docs/SCREENS.md.

1. After computing → /paywall/welcome (plans preview, Skip once →
   persist skippedWelcomePaywall).
2. Wire app/(app)/_layout.tsx with Expo Router Tabs using the already-built
   ObservatoryTabBar from Prompt 02 as `tabBar={(props) => <ObservatoryTabBar … />}`.
   Five tabs only: Sky, Chart, Lens, Bonds, Atelier.
   - Use TabSky/TabChart/TabLens/TabBonds/TabAtelier icons (not default icons).
   - Labels exact: Sky · Chart · Lens · Bonds · Atelier.
   - Hide tab bar on nested full-screen routes that need it (planet sheet can
     keep tabs; paywall/auth stacks must not show tabs).
   - Safe-area respected; hairline top; active = champagne; inactive = text-3.
3. Each tab root: honest empty/brand state until later prompts fill content —
   still navigable.
4. app/dev/screens.tsx — FlatList of EVERY SCREENS.md route id with links;
   mark pending until built.

Verify: soft paywall skip → five-tab shell; each tab icon custom + correct
active color; rotate through all five; no default Ionicons tab look; /dev/screens
lists inventory. Screenshot-worthy tab bar matches Observatory craft.
```

---

## Phase 4 — Sky + Chart (S* + C*)

### Prompt 13 — Living Chart Skia

```text
components/chart/LivingChart.tsx per BRAND §07 + PRD F2. Planet sheet.
A11y list. Reduced motion static.

Verify: renders fixture; tap planet sheet.
```

### Prompt 14 — Sky stack S1–S5

```text
Implement all Sky routes: home composition (BRAND §07), weather detail,
muhurta detail, day archive (enforce 7-day free preview list UI — gate
older with LockGlyph calling paywall sheet later), inbox list from
generated daily notes.

Verify: each S* reachable from Sky + /dev/screens; real computed data.
```

### Prompt 15 — Chart stack C1–C3, C5–C6

```text
Chart tab + planet/[name] + dasha ribbon page + transits + aspects table.
Real payload only.

Verify: C routes work; ribbon caret correct.
```

### Prompt 16 — Chart C4 + C7 cosmic profile

```text
dasha/[key] deep read (SOFT: show first paragraph free, rest lock).
chart/profile cosmic profile page (Nummi-like “who you are” from chart
templates + optional LLM). Wire LockGlyph → /paywall/sheet.

Verify: free user sees lock; navigation clean.
```

---

## Phase 5 — Lens (L*)

### Prompt 17 — Memory + usage counters

```text
lib/memory/* + usage_counters (UTC day lens_count). Settings-ready API.
lib/billing/quotas.ts: canSendLens(), incrementLens().

Verify: unit tests on quota rollover midnight UTC.
```

### Prompt 18 — Companion engine

```text
lib/ai/companion.ts grounded chat; persist threads/messages; quieter fallback.

Verify: grounding test; no-key quieter mode cites real dasha.
```

### Prompt 19 — Lens UI L1–L6

```text
All Lens screens: active chat, threads, thread detail, starters, memories.
QuotaChip. On 6th free message → router to /paywall/sheet with reason
lens_quota. Orb states bound to request.

Verify: 5 messages ok; 6th opens paywall sheet; threads persist.
```

---

## Phase 6 — Bonds + Atelier (B* + R*)

### Prompt 20 — Synastry engine

```text
lib/bonds/synastry.ts + domain scores + tests.

Verify: synastry tests green.
```

### Prompt 21 — Bonds B1–B7

```text
List, add wizard, bond detail, constellation, domain detail (SOFT lock
after preview), share card. Free: 1 bond. Adding 2nd → /paywall/sheet
reason bond_limit. Empty copy per brand.

Verify: first bond full; second gated; share card screenshot-worthy.
```

### Prompt 22 — Atelier R1–R7

```text
Hub, journal list/new/detail, check-in → memory, soul preview vs full GATE,
patterns GATE. Soul preview free blurb; Open full → paywall.

Verify: journal CRUD offline; soul gate; check-in writes memory.
```

---

## Phase 7 — Billing (P* + entitlements)

### Prompt 23 — Billing core

```text
Read SCREENS §8 + PRD F14. Implement lib/billing/:
entitlements.ts (isPrivate, requirePrivate),
mockStore.ts (when EXPO_PUBLIC_IAP_MODE=mock),
revenueCat.ts (store mode),
offerings.ts, purchase.ts, restore.ts,
BillingProvider reacting to CustomerInfo.

Persist mock entitlement in SecureStore. Sync profiles.private_until best-effort.

Verify: unit tests mock purchase/restore/clear; tsc clean.
```

### Prompt 24 — Paywall screens P1–P4

```text
/paywall full plans (monthly/yearly, trial badge, legal footer Apple-required
copy), /paywall/sheet compact, /paywall/success, /paywall/unavailable.
components/billing/PaywallPlans, PriceCard, RestoreButton.
Mock mode: tapping Buy succeeds → success → unlock.
Store unavailable path when offline in store mode.

Voice: BRAND paywall rules — no dark patterns, no emoji.

Verify: mock buy from sheet unlocks; restore works; cancel returns cleanly.
```

### Prompt 25 — Wire all gates + banners

```text
Replace every SOFT/GATE with requirePrivate. Billing issue banner G3 on Sky.
Welcome soft paywall respects skip-once. Settings subscription entry live.
After mock purchase: Lens unlimited, bonds 2+, soul full, patterns, archive,
export unlock without restart.

Verify: matrix PRD F13 manually on device; Maestro-ready flags.
```

---

## Phase 8 — Settings + ship

### Prompt 26 — Settings X1–X14

```text
Implement ALL settings routes in SCREENS §7: hub, profile, birth recompute,
appearance, notifications prefs, memories, subscription (plan status, renew,
manage-in-store education), restore, privacy, terms, disclaimer, support,
delete wipe, export (Private).

Verify: each X* from hub; delete wipes; export gated then unlocked.
```

### Prompt 27 — Notifications stub + inbox realism

```text
Local notification prefs + schedule optional daily Sky reminder (permission
honest). Inbox S5 shows today’s note + muhurta. No spam.

Verify: toggle persists; denial path honest.
```

### Prompt 28 — Brand + a11y + offline audit

```text
Walk BRAND §15 on Welcome, Onboarding, Sky, Chart, Lens, Bonds, Atelier,
Paywall, Settings. Fix violations. Offline L3. Reduced motion. Contrast.

Verify: checklist documented PASS/FIX in docs/BETA-NOTES.md draft.
```

### Prompt 29 — Maestro e2e + Jest beta

```text
Maestro flow exactly SCREENS §11 (mock IAP). Expand Jest for PRD §12 ZT
items including 16–19, 22. npm run test:beta runs jest + maestro (or jest
+ scripted mock purchase integration if Maestro not on CI).

Verify: test:beta green in mock mode.
```

### Prompt 30 — Production hardening pass

```text
1. /dev/screens: zero “pending” — every SCREENS route live.
2. SETUP.md: RevenueCat + App Store/Play product setup steps for real IAP.
3. Error catalog consistency; analytics events PRD §13 wired (no-ops ok if
   analytics backend absent — call lib/analytics.track).
4. Final readme note: mock vs store.
5. Update TESTING.md statuses only where automation proves.

Verify: fresh guest path + mock purchase + soul open; typecheck/lint/test:beta
green; declare ship-ready for TestFlight once store keys added.
```

---

## How to use

1. Open `grahalens-final-app` alone in Cursor.
2. One prompt → one chat → Verify → next.
3. After 30, complete manual sections in `TESTING.md`.
