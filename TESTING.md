# Grahalens — Beta / Ship Test Plan

> Gate after **Prompt 30**. Automated: `npm run test:beta`. Manual: below.
> ZT = zero tolerance (PRD §12) — blocks ship.

## How to run

```
npm test
npm run test:beta   # jest (mock IAP) + Maestro when installed, else scripted mock-IAP
```

Use `EXPO_PUBLIC_IAP_MODE=mock` for Cursor/simulator verify. `test:beta` sets mock
mode for Jest; Maestro still needs the app built with mock IAP on device.

---

## A. Acceptance (PRD §12)

| # | ZT | Test | Status |
|---|----|------|--------|
| 1 | ZT | Onboarding → 9 grahas + Lagna | PASS (jest onboarding-compute + natal) |
| 2 | ZT | Living Chart ≤ 0.5° vs fixture | PASS (jest natal) |
| 3 | ZT | Dasha caret correct | PASS (jest dasha-ribbon) |
| 4 | ZT | Sky Weather deterministic | PASS (jest sky-weather) |
| 5 | ZT | Muhurta in civil day | PASS (jest muhurta) |
| 6 | ZT | Grounding 50 clean | PASS (jest grounding) |
| 7 | ZT | Bond domains stable | PASS (jest synastry + bonds) |
| 8 | | Soul signatures ⊆ chart | PASS (jest soul) |
| 9 | ZT | Guest → signup migrate | |
| 10 | | Offline Sky + Chart | |
| 11 | | Wipe local + account | PASS (jest settings-wipe) |
| 12 | ZT | Reduced motion | |
| 13 | | Ink + Dawn contrast | |
| 14 | ZT | All SCREENS.md routes live (`/dev/screens`) | PASS (jest zt-beta: zero pending + G1–G8) |
| 15 | ZT | SETUP fresh machine | |
| 16 | ZT | 6th Lens → paywall sheet | PASS (jest zt-beta) |
| 17 | ZT | 2nd Bond → paywall sheet | PASS (jest zt-beta) |
| 18 | ZT | Mock purchase unlocks Private | PASS (jest zt-beta + billing) |
| 19 | ZT | Restore re-applies | PASS (jest zt-beta + billing) |
| 20 | | Subscription settings accurate | |
| 21 | | Soft paywall skip once | |
| 22 | ZT | Maestro SCREENS §11 | PASS (maestro/smoke.yaml + jest zt-beta; Maestro CLI when present) |

---

## B. Screen completeness (`docs/SCREENS.md`)

For each section (A, S, C, L, B, R, X, P, G): open every route →
loading/empty/error ok · free/Private correct · brand voice. Status: __

Automation: `/dev/screens` inventory has **zero pending** (jest zt-beta). Manual
walk still required for visual/brand.

---

## C. Brand §15 checklist

Welcome, Onboarding, Sky, Chart, Lens, Bonds, Atelier, **Paywall**, Settings.

| Audit | Status |
|---|---|
| Accent / no purple | |
| Motion ≤2 + reduced | |
| Numbers / voice / theme | |
| Pay craft (no dark patterns) | |
| States + errors | |
| **Icon pack complete** (`/dev/system` sheet) | |
| **Tab bar** custom SVGs, safe-area, active = text-1 + raised bubble (BRAND §07), no FAB/Ionicons | |

---

## C2. Tab bar & icons spot-check

| Check | Status |
|---|---|
| All 5 tabs use `components/icons/tabs/*` only | |
| Active = `--text-1` + raised bubble; inactive = `--text-3` | |
| Height 56 + safe area; top hairline | |
| Hidden on auth / onboarding / full paywall | |
| Graha icons render on Chart placements | |
| LockGlyph on gates uses system lock icon | |
| No emoji icons anywhere | |

---

## D. Failure injection

1. No `GROQ_API_KEY` → quieter mode. __
2. Airplane after compute → Sky/Chart; paywall → unavailable. __
3. Time unknown banner. __
4. Mock purchase cancel → no unlock, no guilt modal. __
5. Clear mock entitlement → gates return. __
6. Billing issue flag → Sky banner. __

---

## E. Payments matrix

| Action | Expected | Status |
|---|---|---|
| View `/paywall` | Monthly + Yearly + legal footer | |
| Buy yearly (mock) | Success → Private | PASS (jest billing + zt-beta) |
| Buy monthly (mock) | Success → Private | PASS (jest billing) |
| Restore w/ prior | Unlocks | PASS (jest billing + zt-beta) |
| Restore empty | Honest empty | PASS (jest billing) |
| Lens quota hit | Sheet reason lens_quota | PASS (jest zt-beta) |
| Bond limit | Sheet reason bond_limit | PASS (jest zt-beta) |
| Soul gate | Sheet → unlock full | PASS (jest zt-beta ZT18) |
| Settings manage | Store education copy | |

---

## F. Taste / competitor bar

Feels Nummi-deep + Co-Star-social without cloning UI or snark; classy
Observatory end-to-end including paywall. Status: __

---

## Sign-off

GO when test:beta green · all ZT PASS · §B–F done. Log in `docs/BETA-NOTES.md`.

**Prompt 30:** mock path ship-logic ready. **TestFlight** once
`docs/SETUP.md` §4 store keys + products are configured (`EXPO_PUBLIC_IAP_MODE=store`).
