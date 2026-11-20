# Grahalens — Setup

Follow this on a fresh machine so Expo, Supabase, and billing work without
guesswork. Guest mode and mock IAP run with empty cloud keys.

---

## 1. Prerequisites

- Node 20+ and npm
- Xcode (iOS Simulator) and/or Android Studio
- Expo Go matching **SDK 54** (App Store / Play — pin to the version Expo docs
  list for SDK 54)
- Optional: [Supabase CLI](https://supabase.com/docs/guides/cli),
  [EAS CLI](https://docs.expo.dev/eas/) for device builds

```bash
cd grahalens-final-app
cp .env.example .env
npm install
npx expo start
```

---

## 2. Environment variables

Copy from `.env.example`. Empty cloud keys are intentional for guest + mock IAP.

| Variable | Purpose | Empty? |
|---|---|---|
| `EXPO_PUBLIC_APP_ENV` | `development` / `staging` / `production` | defaults fine |
| `EXPO_PUBLIC_IAP_MODE` | `mock` or `store` | **default `mock`** |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL | guest local mode |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | guest local mode |
| `GROQ_API_KEY` | Lens / narration (Node / tests) | template fallbacks |
| `EXPO_PUBLIC_GROQ_API_KEY` | **Required for Lens on device** — Expo only inlines `EXPO_PUBLIC_*` | quieter mode without it |
| `EXPO_PUBLIC_REVENUECAT_IOS_KEY` | RevenueCat iOS SDK key | mock IAP only |
| `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` | RevenueCat Android SDK key | mock IAP only |

`lib/supabase/client.ts` returns `null` when URL or anon key is missing — the
app continues in **guest mode** (on-device SQLite; sync later after sign-up).

---

## 3. Supabase dashboard (placeholders)

1. Create a project at [supabase.com](https://supabase.com) (region near users).
2. **Project Settings → API** — copy Project URL and `anon` `public` key into
   `.env` as `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
3. **SQL Editor** — run `supabase/migrations/0001_init.sql` (or
   `supabase db push` if CLI is linked).
4. **Authentication → Providers**
   - Enable **Email** (magic link / OTP — recommended for beta).
   - Optional later: Apple / Google when store keys exist. UI gates on
     `EXPO_PUBLIC_APPLE_AUTH=1` / `EXPO_PUBLIC_GOOGLE_AUTH=1`.
5. **Authentication → URL configuration**
   - Site URL: your Expo origin or `grahalens://`
   - Redirect URLs (add all you use):
     - `grahalens://auth/callback` (scheme from `app.json`)
     - Expo Go / dev: the URL from `Linking.createURL('auth/callback')`
       (often `exp://…/--/auth/callback`)
6. Confirm RLS is enabled on all tables in **Table Editor** (migration turns
   RLS on; policies scope to `auth.uid()`).

### Auth screens (Prompt 10)

| Path | Role |
|---|---|
| `/(auth)/splash` | Brand hold → route by session |
| `/(auth)/welcome` | 3-page carousel |
| `/(auth)/sign-in` | Magic link (+ optional Apple/Google) |
| `/(auth)/sign-up` | Same OTP; creates user on first link |
| `/(auth)/guest` | Sets local SQLite `is_guest` → onboarding |
| `/auth/callback` | Magic-link deep link completion |

**Routing:** anonymous → welcome; guest/authenticated + no chart →
`/onboarding/date`; with chart → `/(app)/sky`.

**Guest / local mode:** `lib/session/local-db.ts` stores `is_guest`,
`has_chart`, `has_seen_welcome`, `skipped_welcome_paywall` in on-device SQLite. Chart birth + natal
payload live in `chart_payload` (`lib/session/chart-db.ts`) and
`useChartStore` after onboarding compute.

**Onboarding A6–A10:** `/onboarding/date` → `time` (skip = unknown) →
`place` (offline cities + manual lat/lng) → `confirm` → `computing`
(resolve → natal → dasha → weather). Then `/paywall/welcome` (soft, skippable
once). Skip persists `skipped_welcome_paywall` and opens the five-tab shell.

**Dev bypass (local only):**
- With Supabase keys **unset**: use **Continue as guest** (or the `__DEV__`
  “Dev bypass → guest onboarding” control on sign-in).
- Do **not** ship a production password bypass.
- Magic link needs keys in `.env` plus Email provider enabled above.

---

## 4. Real IAP — RevenueCat + App Store / Play

Entitlement id (locked): **`grahalens_private`**.

Product ids (locked display catalog in `lib/billing/catalog.ts`):

| Product id | Type | Display (US) |
|---|---|---|
| `grahalens_private_monthly` | auto-renew | Monthly · $7.99 |
| `grahalens_private_yearly` | auto-renew | Yearly · $49.99 (3-day trial) |

Cursor / CI stay on **`EXPO_PUBLIC_IAP_MODE=mock`**. TestFlight / Play internal
builds use **`store`** once the steps below are done.

### 4a. App Store Connect (iOS)

1. Create the app record (bundle id matching `app.json` / EAS).
2. **Agreements, Tax, and Banking** — Paid Apps agreement active.
3. **Features → In-App Purchases** — create two Auto-Renewable Subscriptions:
   - Product ID `grahalens_private_monthly` (1 month)
   - Product ID `grahalens_private_yearly` (1 year) with a **3-day free trial**
     introductory offer
4. Attach both to one Subscription Group (e.g. `grahalens_private`).
5. Localize display name / description; submit with a binary when ready for
   review (sandbox works with StoreKit once products are Ready to Submit).
6. Create Sandbox testers under **Users and Access → Sandbox**.

### 4b. Google Play Console (Android)

1. Create the app; complete store listing draft as needed for testing.
2. **Monetize → Products → Subscriptions** — create:
   - `grahalens_private_monthly`
   - `grahalens_private_yearly` (base plan + free trial offer = 3 days)
3. Activate base plans; add license testers under **Settings → License testing**.
4. Use an internal testing track build signed with the same package name as
   `app.json`.

### 4c. RevenueCat

1. Create a project at [RevenueCat](https://www.revenuecat.com/).
2. Add **iOS** and **Android** apps; paste App Store Connect shared secret /
   Play service account JSON per RevenueCat docs.
3. **Entitlements** — create `grahalens_private`.
4. **Products** — import / attach the store product ids above; attach both to
   the `grahalens_private` entitlement.
5. **Offerings** — one **Current** offering with Monthly + Annual packages
   mapped to those products (package types Monthly / Annual).
6. **API keys** — Project → API keys → Apple / Google **public** SDK keys →
   `.env`:
   - `EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_…`
   - `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_…`
7. Set `EXPO_PUBLIC_IAP_MODE=store` for TestFlight / Play internal builds only.
8. After auth, map RevenueCat `appUserID` to `profiles.rc_app_user_id`; cache
   `profiles.private_until` as a server hint only — **CustomerInfo remains
   source of truth**.

### 4d. Verify store mode

```bash
# Device / TestFlight / Play internal — not Expo Go for native Purchases
EXPO_PUBLIC_IAP_MODE=store
# + RevenueCat keys above
```

Confirm: offerings load → purchase yearly (sandbox) → success → Soul opens;
Restore works; `/paywall/unavailable` when offline.

Never commit real store secrets. Mock mode must not call the stores.

---

## 5. Mock IAP (`EXPO_PUBLIC_IAP_MODE`)

| Mode | Behavior |
|---|---|
| `mock` (default) | In-app fake store (`lib/billing/mockStore`). Purchase unlocks Private without App Store / Play. Restore and Settings status work offline. Use this in Cursor and CI (`npm run test:beta`). |
| `store` | Real `react-native-purchases` against RevenueCat + store products. Needs device/TestFlight/internal testing track and keys above. |

```bash
# .env
EXPO_PUBLIC_IAP_MODE=mock   # Cursor / Maestro / Jest
# EXPO_PUBLIC_IAP_MODE=store  # TestFlight / Play internal
```

---

## 6. Notifications

Settings X5 stores prefs on device (`grahalens:notif_prefs:v1`). **Daily Sky**
schedules one local repeating reminder via `expo-notifications` (08:00) when OS
permission is granted. Denial leaves the toggle off — no fake armed state.
Lens digest / muhurta toggles persist only (not scheduled yet — no spam).
Remote Expo push tokens are **not** registered in beta. Guests stay local;
signed-in sync to `notification_prefs` remains optional later.

---

## 7. Verify

```bash
npm run typecheck
npm run lint
npm run test:beta
```

Migration: open SQL Editor, paste `0001_init.sql`, run without errors; spot-check
that `profiles`, `usage_counters`, and `purchase_events` exist with RLS on.

**Ship-ready for TestFlight** once §4 keys + products are live and
`EXPO_PUBLIC_IAP_MODE=store` on the EAS profile. Until then, mock IAP is the
supported Cursor / CI path.
