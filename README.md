# grahalens. — standalone build (grahalens-final-app)

**See through the sky.**

Grahalens is a classy mobile companion: **Nummi-depth** (Vedic AI + memory +
past life + journal) × **Co-Star energy** (daily sky + bonds/compatibility +
premium gates) — with original Observatory craft and **production payment
flows** (RevenueCat + mock IAP for Cursor).

This folder is a **from-scratch build pack**: specs + ordered Cursor prompts
that produce an **end-to-end, ship-logic app** (every screen on the map, real
entitlements). Open this folder alone in a new Cursor window.

## Files — read in this order

| File | What it is |
|---|---|
| `PLAN.md` | Product, architecture, IAP, phase map. **Start here.** |
| `docs/SCREENS.md` | **Full production screen inventory** + entitlement legend |
| `PROMPTS.md` | **30** copy-paste Cursor prompts (build itself) |
| `TESTING.md` | Ship gate incl. payments matrix |
| `docs/PRD.md` | Product requirements |
| `docs/BRAND-BOOK.md` | Observatory design + paywall craft |
| `docs/SETUP.md` | Fresh machine + **RevenueCat / store IAP** |

## How to build

1. Open **this folder only** in Cursor.
2. Run `PROMPTS.md` **01 → 30**, one chat each; Verify before advancing.
3. Phases 1–2 (ephemeris + intelligence) before polishing UI.
4. Gate: `npm run test:beta` + `TESTING.md` (incl. §E payments).

## Stack

Expo SDK 54 · Expo Router · TypeScript · Observatory tokens · Supabase ·
Groq (+ deterministic fallbacks) · astronomy-engine · Skia · **RevenueCat**
(`EXPO_PUBLIC_IAP_MODE=mock|store`) · Jest · Maestro.

## Environment

| Var | For | Without |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_*` | Auth + sync | Guest local mode |
| `GROQ_API_KEY` / `EXPO_PUBLIC_GROQ_API_KEY` | Narration / Lens / soul | Template fallbacks |
| `EXPO_PUBLIC_IAP_MODE` | `mock` (default) or `store` | Defaults mock |
| `EXPO_PUBLIC_REVENUECAT_*` | Real IAP | Mock purchases still work |

## Mock vs store IAP (read this)

| | `mock` | `store` |
|---|---|---|
| When | Cursor, simulators, CI (`npm run test:beta`) | TestFlight / Play internal / production |
| Purchases | `lib/billing/mockStore` — no App Store / Play | RevenueCat + real products |
| Keys | RevenueCat keys optional / empty | `EXPO_PUBLIC_REVENUECAT_IOS_KEY` + `_ANDROID_KEY` required |
| Setup | Default in `.env.example` | Follow `docs/SETUP.md` §4 (Connect + Play + RC) |

Switch only via `EXPO_PUBLIC_IAP_MODE`. Never commit store secrets. Ship-ready for
TestFlight once store products + RC keys are configured and mode is `store`.

## What you get after all prompts

- ~45 production routes (auth, onboarding, 5 tabs + nested, settings, paywall)
- Free tier quotas (5 Lens/day, 1 Bond) + Private unlock
- Soft welcome paywall + hard feature gates
- Mock purchase path for Cursor; store path documented for TestFlight/Play
- PRD §13 analytics via `lib/analytics.track` (no-op until a backend is wired)
- Error copy centralized in `lib/errors/catalog` (PRD §11 / BRAND §11)

Still needed for **public store listing**: Connect/Play screenshots, privacy
forms, EAS prod certs (ops — see `docs/SETUP.md`).
