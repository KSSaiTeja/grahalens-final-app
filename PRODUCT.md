# PRODUCT.md — Grahalens

> Durable product context for Impeccable + Cursor agents. Visuals: `docs/BRAND-BOOK.md`. Screens: `docs/SCREENS.md`. Build order: `PROMPTS.md` / `PLAN.md`.

## Product

**Grahalens** is a private AI Jyotish decision workspace — an observatory, not a horoscope chatbot. Tagline: **See through the sky.**

Users onboard with birth facts → get free chart literacy + daily Sky Weather → talk to **Lens** (memory-bearing companion grounded in ephemeris) → optionally add Bonds and Atelier journal → upgrade to **Private** (`grahalens_private`) for depth.

## Platform

adaptive

- Expo SDK **54** + Expo Router + TypeScript strict
- iOS + Android (Expo Go pin)
- Themes: **Dawn** (default, ABY soft gray) / **Ink** (evening)
- Palette: black CTAs `#0A0A0A` + lavender accent `#9B8CDB` (Mobbin ABY Journal); Inter type
- Entitlement: single SKU `grahalens_private`; `EXPO_PUBLIC_IAP_MODE=mock|store`

## Audience

Adults seeking decision clarity who want Vedic computation honesty + a quiet premium companion. Competitive jobs from Nummi (Vedic AI journal) × Co-Star (daily sky + bonds + gates) — **original Observatory craft, not clones.**

## Mode (default app UI)

**Operate** — scanability, native affordances, trust. Brand lives in precise details (wordmark period, Lens orb, Living Chart, hairlines). Marketing surfaces alone may shift to **Persuade**.

## Design lock (do not reopen)

- ABY Journal–inspired composition: atmospheric full-screen fields, one dominant task, large sentence-case prompts, thin progress, translucent layers, card stacks, black bottom-pinned CTAs, and **Inter**
- Sacred chart: computation before narration; whole-sign Lahiri houses
- Floating inset tab capsule with Lucide interface icons; preserve custom Graha marks for astrology data
- Hard bans: purple nebula photography, emoji UI, crystal/mandala, card soup, lucky widgets, Co-Star/Nummi pixel copies, ABY mascot/emoji clones

## Free vs Private (sales)

| Free | Private |
|---|---|
| Big Three + houses readable | Unlimited Lens, multi-Bond |
| Sky Weather + Muhurta + “why” | Soul / Pattern Thread / export |
| 5 Lens/day, 1 Bond | Soft A11 after chart proof; hard gates later |

## Primary surfaces

Sky (S1) · Living Chart (C1) · Lens (L1) · Bonds (B*) · Atelier (R*) · Settings (X*) · Paywall (P*)

## Research

Mobbin + Nummi anti-ref: `docs/mobbin/grahalens-mobbin-reference-report.md`

## Success

`npm run test:beta` green · fresh install → Sky ≤ 90s · natal vs fixture ≤ 0.5° · mock purchase unlocks Private ≤ 2s
