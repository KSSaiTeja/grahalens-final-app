# GRAHALENS — Product Requirements Document  
Developer Edition · Version 1.1 · July 2026

**Agent:** Lens · **Platform:** iOS + Android (Expo) · **Confidential**

---

## 1. Summary

Grahalens is a production-minded mobile spiritual intelligence app: a private
observatory that computes your Vedic birth chart in code, runs a memory-bearing
AI companion (**Lens**), supports Co-Star-class relationship bonds, and ships a
**real Private subscription** (RevenueCat) with soft/hard paywalls.

Competitive DNA: **Nummi AI** (Vedic companion, past life, journal, Pro plans) ×
**Co-Star** (daily sky object, friends/compatibility, premium gates) — original
Observatory UX, not a pixel clone. Full screen inventory: `docs/SCREENS.md`.

---

## 2. Contacts

| Name | Role | Comment |
|---|---|---|
| Founder / builder | Product + Cursor build owner | Runs PROMPTS.md |
| Lens | In-product agent | Voice: BRAND-BOOK §05 |

---

## 3. Background

Astrology apps either snark, spam horoscopes, or ship ugly calculators. Nummi
proved Vedic + memory AI converts; Co-Star proved daily chart + friends +
premium gating. Grahalens combines those jobs with computation honesty and
classy craft — and treats **payments as a core product surface**, not a stub.

---

## 4. Objective

Ship an end-to-end app a user can: onboard → use free tier meaningfully → hit
a beautiful paywall → purchase (mock or store) → unlock Private — with every
screen on the map production-quality.

### Key Results

| KR | Target |
|---|---|
| KR1 | All SCREENS.md routes implemented with loading/empty/error |
| KR2 | Fresh install → Sky with computed data ≤ 90s |
| KR3 | Living Chart natal vs fixture ≤ 0.5° |
| KR4 | 100% companion replies pass grounding |
| KR5 | Mock purchase unlocks all PRIVATE/GATE features within 2s |
| KR6 | Free quotas enforced (5 Lens/day, 1 Bond) |
| KR7 | Brand §15 green on tabs + paywall + onboarding |
| KR8 | `npm run test:beta` green per SETUP.md |

---

## 5. Market Segment(s)

**Private Seekers** (22–40) — want Nummi depth + better craft.  
**Relationship Readers** — want Co-Star-like bonds without snark.  
Constraints: mobile-only; birth time optional with honest degrade; en-US default, en-IN dates optional.

---

## 6. Value Proposition(s)

| Job | Gain | Avoid | Better than |
|---|---|---|---|
| Morning orientation | Sky Weather + Muhurta | Vague sun-sign | Horoscope mills |
| Self-understanding | Living Chart + Dasha | Opaque PDFs | Calculators |
| Talk it through | Lens + memory | Contextless chat | Generic GPT |
| Relationship clarity | Bond Constellation | Snark grids | Co-Star roast |
| Meaning | Soul Cartography | Random lore | Novelty AI |
| Commit / upgrade | Clear Private value | Dark patterns | Aggressive modals |

---

## 7. Solution

### 7.1 UX / IA

Authoritative map: **`docs/SCREENS.md`**. Do not invent alternate IA.

**Happy path:** Splash → Welcome → Guest/Auth → Onboarding (date/time/place/
confirm/computing) → Soft paywall (skip once) → Sky → explore tabs → gate →
Paywall → Success → Private features.

### 7.2 Features

#### Core intelligence (unchanged sacred order)
F1 Birth/natal · F2 Living Chart · F3 Dasha Ribbon · F4 Sky Weather ·
F5 Muhurta · F6 Lens · F7 Memory · F8 Bonds · F9 Soul · F10 Atelier journal —
all as in v1.0, now with **full nested screens** per SCREENS.md.

#### F11 Settings `[SHIP]`
All X* routes: profile, birth edit+recompute, appearance, notifications,
memories, subscription, restore, privacy, terms, disclaimer, support, delete,
export (Private).

#### F12 Auth `[SHIP]`
Magic link; Apple/Google when keys present; full guest mode with later migrate.

#### F13 Entitlements & quotas `[SHIP]`
| Resource | Free | Private |
|---|---|---|
| Lens messages / UTC day | 5 | Unlimited |
| Bonds | 1 | Unlimited |
| Soul Cartography | Preview blurb only | Full portrait |
| Pattern Thread | Locked | Unlocked |
| Day archive | 7 days | Unlimited |
| Data export | Locked | Unlocked |
| Sky / Chart core | Full | Full |

Single entitlement: `grahalens_private`. Helper: `useEntitlement()` /
`requirePrivate(feature)`.

#### F14 Payments `[SHIP]`
- RevenueCat offerings; products monthly/yearly (SCREENS §8).
- `EXPO_PUBLIC_IAP_MODE=mock` for Cursor/simulator without store.
- Screens: `/paywall`, `/paywall/sheet`, `/paywall/success`, `/paywall/unavailable`.
- Restore purchases; subscription settings; billing-issue banner.
- State machine: idle → loading → ready → purchasing → success|failed|cancelled;
  restoring → success|empty|failed; billing_issue grace.
- No dark patterns: skip on soft welcome paywall; clear trial/renew copy;
  OS-managed cancel education.

#### F15 Dev screen index `[SHIP]`
`/dev/screens` lists every production route for QA.

### 7.3 Technology

Expo 54, Expo Router, TypeScript strict, Supabase, Groq, astronomy-engine,
Skia, Zustand, TanStack Query, **RevenueCat**, Jest, Maestro.

### 7.4 Assumptions

- Whole-sign Lahiri accepted for v1.
- Mock IAP sufficient for Cursor verify; store products configured before
  TestFlight/Play.
- Past-life content framed as reflective myth.
- Price points mirror category norms ($7.99 / $49.99); changeable via store.

---

## 8. Release

### This build (ship-ready product logic)
Full SCREENS.md · entitlements · mock+store IAP path · Maestro e2e including
purchase · brand audits.

### After this build (store submission ops)
- Apple/Google Connect product creation + RevenueCat dashboard prod keys
- EAS production certs, screenshots, privacy nutrition labels
- Push certificate craft
- Western house toggle, voice, live astrologers (optional)

### Non-goals
Marketplace, dating discovery, crystal shop, Wear OS, cloning competitor assets.

---

## 9. Data model

```
profiles          id, display_name, theme, created_at,
                  rc_app_user_id text, private_until timestamptz null
birth_profiles    id, user_id, name, birth_at, lat, lng, tz,
                  time_unknown, place_label
charts            id, birth_profile_id, system, payload jsonb, computed_at
memories          id, user_id, body, source, salience, created_at
bonds             id, user_id, their_birth_profile_id, label, created_at
synastry_cache    bond_id pk, payload jsonb, computed_at
journal_entries   id, user_id, body, mood, weather_snapshot, dasha_key, created_at
soul_portraits    id, user_id, signatures jsonb, prose, model, created_at
chat_threads      id, user_id, title, updated_at
chat_messages     id, thread_id, role, content, grounded, created_at
usage_counters    user_id, day date, lens_count int,
                  primary key (user_id, day)
purchase_events   id, user_id, product_id, store, status, raw jsonb, created_at
```

Client trusts RevenueCat `CustomerInfo` as source of truth for Private;
`private_until` is a cache for server-side optional checks.

RLS: scoped to `auth.uid()`. Guest: on-device until link.

---

## 10. Voice & content

Per BRAND-BOOK §05. Paywall voice: calm, specific value, no countdown scams,
no “last chance” lies. No emoji.

---

## 11. Error & empty states

| State | Behavior |
|---|---|
| Time unknown | Approximate banner once |
| Geocode fail | City pick / manual lat-lng |
| LLM down | Template + quieter Lens |
| Offline | Chart/weather/journal; composer disabled; purchase → unavailable screen |
| Grounding fail | Withhold bad interpretation |
| Store down | `/paywall/unavailable` + retry |
| Purchase cancel | Return to prior screen, no guilt modal |
| Billing issue | Persistent Sky banner + Settings |

---

## 12. Acceptance criteria

| # | ZT | Criterion |
|---|---|---|
| 1 | ZT | Onboarding → chart with 9 grahas + Lagna |
| 2 | ZT | Living Chart vs fixture ≤ 0.5° |
| 3 | ZT | Dasha caret matches compute |
| 4 | ZT | Sky Weather deterministic |
| 5 | ZT | Muhurta inside civil day |
| 6 | ZT | Grounding sweep 50 replies clean |
| 7 | ZT | Bond domain scores stable |
| 8 | | Soul signatures ⊆ chart |
| 9 | ZT | Guest → signup migrates chart |
| 10 | | Offline Sky + Chart after cache |
| 11 | | Wipe clears SecureStore + SQLite |
| 12 | ZT | Reduced motion parity |
| 13 | | Ink + Dawn contrast |
| 14 | ZT | Every SCREENS.md route exists (dev index) |
| 15 | ZT | SETUP → Expo → Sky real data |
| 16 | ZT | Free: 6th Lens message same day → paywall sheet |
| 17 | ZT | Free: 2nd Bond → paywall sheet |
| 18 | ZT | Mock purchase → Soul + unlimited Lens unlock |
| 19 | ZT | Restore (mock) re-applies entitlement |
| 20 | | Subscription settings show plan + manage copy |
| 21 | | Soft welcome paywall skippable once; re-entry from Settings |
| 22 | ZT | Maestro path SCREENS §11 passes in mock IAP |

---

## 13. Analytics

`onboarding_completed`, `chart_computed`, `lens_message_sent`,
`lens_quota_hit`, `bond_created`, `bond_gate_hit`, `journal_saved`,
`paywall_viewed`, `purchase_started`, `purchase_success`,
`purchase_cancelled`, `purchase_failed`, `restore_success`. No PII. Opt-out.

---

## 14. Legal

Privacy, Terms, Disclaimer linked from Settings + Paywall footer.
Subscription disclosure: title, length, price, auto-renew, trial, manage/cancel
in store account — required on paywall (Apple guideline).
Soul/Companion: not medical/legal/financial advice.
