# Beta notes (draft) — Prompt 28 Brand §15 audit

Date: 2026-07-30  
Scope: Welcome, Onboarding, Sky, Chart, Lens, Bonds, Atelier, Paywall, Settings  
Source: `docs/BRAND-BOOK.md` §15 + §11 L3 + §12 a11y

---

## Per-audit matrix

| Audit | Status | Notes |
|---|---|---|
| Accent / no purple | **PASS** | Lavender `--accent` only; no nebula photography; champagne unused as fill flood |
| Motion ≤2 idle + reduced | **FIX→PASS** | Weather-drift wired on Sky when Opening > 0.6; idle budget: Sky drift ≤1, Lens orb breathe ≤1. Tab spring + ScreenEnter skip motion when `reduceMotion` |
| Numbers / mono tabular | **PASS** | Degrees via IBM Plex Mono + `tabular-nums` on Chart instruments |
| Voice / no emoji | **PASS** | Catalog empties (Bonds verbatim); companion prompts ban emoji |
| Theme Ink + Dawn | **PASS** | Tokens + Appearance toggle; both voids designed |
| Silence / empty honesty | **PASS** | EmptyState + BRAND empties; L4 never ships fake planets |
| State loading / empty / error / offline | **FIX→PASS** | G2 `OfflineBanner` + Lens composer honest denial; journal/chart remain local |
| Chart accessible list + visual | **FIX→PASS** | PlacementList a11y list; Living Chart wheel decorative (`Canvas` hidden); planet hits remain explorables |
| Error cause + fix | **PASS** | Gate lines / quieter mode / store unavailable — no half-written DB writes in audited paths |
| Pay craft | **PASS** | Soft skip once (welcome paywall); restore + legal footer on plans; no countdown/confetti |

---

## Screen walk

| Screen | Accent | Motion | Voice | Theme | States | Notes |
|---|---|---|---|---|---|---|
| Welcome | PASS | PASS | PASS | PASS | PASS | **FIX:** Wordmark includes accent period; carousel dots theme-safe |
| Onboarding | PASS | PASS | PASS | PASS | PASS | Offline city pick already honest |
| Sky | PASS | **FIX→PASS** | PASS | PASS | **FIX→PASS** | Drift + OfflineBanner + BillingIssueBanner |
| Chart | PASS | PASS | PASS | PASS | **FIX→PASS** | OfflineBanner; Living Chart a11y split |
| Lens | PASS | PASS | PASS | PASS | **FIX→PASS** | Offline banner; composer/starters locked offline |
| Bonds | PASS | PASS | PASS | PASS | **FIX→PASS** | Catalog empty; OfflineBanner |
| Atelier | PASS | PASS | PASS | PASS | **FIX→PASS** | OfflineBanner; journal remains local |
| Paywall | PASS | PASS | PASS | PASS | PASS | Soft skip / restore / legal; store → unavailable |
| Settings | PASS | PASS | PASS | PASS | **FIX→PASS** | Offline + billing banners |

---

## Contrast (§12)

| Pair | Ratio (approx) | Status |
|---|---|---|
| Dawn `text-1` `#1A1A1A` on `void` `#F2F2F0` | ≥ 7:1 | **PASS** |
| Ink `text-1` `#F4F4F5` on `void` `#141416` | ≥ 7:1 | **PASS** |
| Dawn / Ink `text-3` meta | improved | **FIX→PASS** — Dawn `#757575`, Ink `#9A9AA0` (was too faint for meta labels) |

---

## Offline L3 (G2)

| Item | Status |
|---|---|
| `expo-network` + `lib/network/online.ts` | **FIX→PASS** |
| `OfflineBanner` on Sky / Chart / Lens / Bonds / Atelier / Settings | **FIX→PASS** |
| Lens composer + starters disabled with honest placeholder | **FIX→PASS** |
| Cached chart / weather / journal usable offline | **PASS** (existing local stores) |

---

## Reduced motion

| Surface | Status |
|---|---|
| ThemeProvider `AccessibilityInfo` | **PASS** |
| LensOrb / SoftPress / LivingChart chart-in / SheetScaffold | **PASS** |
| ScreenEnter (no translate under RM) | **FIX→PASS** |
| Tab bubble spring skipped under RM | **FIX→PASS** |
| Weather-drift disabled under RM | **FIX→PASS** |

---

## Residual / watch

- Remote push tokens still not registered (Prompt 27); local schedule OK.
- TESTING.md §C / §C2 aligned to BRAND §07 (text-1 + raised bubble; not champagne fill).
- Prompt 30: error catalog + analytics.track wired; SETUP §4 store IAP steps live.

---

## Verify checklist (this prompt)

- [x] BRAND §15 walked on listed screens  
- [x] Offline L3 banner + Lens denial  
- [x] Reduced motion parity on new/idle paths  
- [x] Contrast text-1 ≥ 7:1; text-3 bumped  
- [x] This draft logged PASS/FIX  
