# grahalens. — Observatory Design System (Brand Book v1.0, July 2026)

> Normative for every UI prompt in `PROMPTS.md`. When PRD and brand book
> conflict on visuals, **this wins**.

Tagline: **"See through the sky."**

---

## 01 · Ideology

Grahalens is a **private observatory**, not a carnival of the cosmos. The
interface should feel calm and precise — soft gray light by default (ABY-warm),
with an optional quiet Ink evening mode. Still: no neon, no mascot circus.

**P1 — Black + lavender, not carnival.** High-contrast black CTAs; lavender for
identity (tabs, period, focus). Soft washes only on atmosphere screens.

**P2 — Alive, not busy.** Max 2 idle motions per viewport. Motion = sky state
or agent state — never decoration loops.

**P3 — The chart is sacred.** Every degree on screen comes from computation.
Typography for degrees is tabular mono. Never ornamental fake glyphs.

**P4 — Quiet luxury.** Editorial spacing, one composition per screen, no card
soup. Cards exist only when they contain a primary interaction.

**P5 — Adult voice.** Warm, precise, slightly literary. Never snark, never
guru, never fear.

**Hard bans (do not ship):**
- Purple / indigo nebula gradients
- Emoji anywhere in UI or generated copy
- Crystal / mandala clipart
- Rounded-full pill clusters as decoration
- Multi-layer neon glow
- Co-Star pure meme black-and-white clone (we are warmer and more material)
- Default Inter-only stacks without a display face

---

## 02 · Wordmark & agent identity

- Wordmark: `grahalens.` — always lowercase.
- Display face for wordmark: **Inter** 700, tracking −0.02em.
- **The period is lavender accent** (`--accent`) and may optionally be the
  Lens orb.
- Never set the wordmark in all caps. Never omit the period.

### Lens — presence, not mascot

Lens is a single **optical orb**: a soft disc with a thin glass ring. No face,
no stars inside, no pupils.

| State | Motion | Meaning |
|---|---|---|
| IDLE | Slow breathe 4s opacity 0.72→1 | Present |
| READING | Fine radial scan 1.6s | Loading chart / memory |
| THINKING | Soft orange shimmer on ring | LLM in flight — **only** extra accent motion |
| SPEAKING | Gentle pulse synced to token stream | Replying |
| FOUND | Single flare 2s → idle | New insight pinned |
| ALERT | Cool silver ring pulse | Needs attention (time unknown, sync error) |

Reduced motion: static orb; state via accessibility label only.

---

## 03 · Color — Dawn default (ABY Journal–inspired), Ink evening

> Palette sourced from ABY Journal iOS on Mobbin (welcome, onboarding, timeline,
> insights). **Jobs and craft stay Grahalens** — soft gray void, solid white
> squircles, black CTAs, lavender used sparingly for focus/selection only.

### Dawn (default — light)

| Token | Hex | Use |
|---|---|---|
| `--void` | `#F2F2F0` | Flat soft gray app background |
| `--surface` | `#FFFFFF` | Solid white cards / panels |
| `--raised` | `#EBEBEA` | Quiet gray fills (active chrome) |
| `--text-1` | `#1A1A1A` | Primary |
| `--text-2` | `#6E6E6E` | Secondary |
| `--text-3` | `#757575` | Tertiary / meta |
| `--accent` | `#A394D9` | Soft lavender — selection, meters |
| `--cta` | `#0A0A0A` | Primary actions (ABY black pill) |
| `--on-cta` | `#FFFFFF` | Text on CTA |

### Ink (dark evening)

Warm near-black surfaces; lighter text; inverted CTA (light pill on dark).

### Washes (atmosphere only)

Whisper pastels that settle into `--void`. Daily chrome uses `neutral`
(flat gray). No frosted glass or loud coral/gold floods.

### Rules
- Black CTA + quiet lavender accent. No purple nebula photography.
- Solid white squircles (~28–32px radius) + soft shadow on gray void.
- Charts: dark strokes on light; active planet uses `--accent`.
- CTAs are stadium/pill radius.

---

## 04 · Typography

> ABY Journal–inspired (Mobbin): **one geometric sans** (Inter ≈ SF Pro / ABY).
> Hierarchy by weight + size. Mono for sacred degrees only.

| Role | Face | Weights | Notes |
|---|---|---|---|
| Display / UI | Inter | 400, 500, 600, 700 | Headlines, wordmark, body, tabs |
| Mono | IBM Plex Mono | 400, 500 | Degrees, times, dasha keys only |

### Scale (iPhone 390 reference)

| Token | Size / line | Use |
|---|---|---|
| `display-xl` | 34 / 40 | Rare hero greetings |
| `display-l` | 28 / 34 | Screen titles |
| `title` | 20 / 26 | Section |
| `body` | 16 / 24 | Default |
| `body-sm` | 14 / 20 | Secondary |
| `meta` | 13 / 16 | Soft labels — sentence case |
| `degree` | 12 / 16 | Mono tabular |

Rules: max one display-xl per screen. Hierarchy via weight, not a second family.

---

## 05 · Voice

**Lens sounds like:** a precise friend who has read your chart and your last
journal — calm, specific, never theatrical.

**Do:** “Mars presses your 7th today — conversations run hot. Prefer clarity
over winning.”  
**Don’t:** “Yikes your love life 💀” / “The universe has a surprise!!!”

**Vocabulary preferences:** pressure, opening, friction, clarity, ribbon,
window, lens, observatory.  
**Avoid:** vibes (as filler), manifestation spam, doom, guru honorifics.

Companion replies: 2–4 short paragraphs max on mobile; offer one gentle
follow-up question max.

---

## 06 · Motion

ABY-soft interactions (Mobbin) adapted for sky / Lens state.

| Name | Spec | Use |
|---|---|---|
| `press` | scale 0.97 + opacity 120ms | Buttons, chips, tabs |
| `enter` | fade + 14px rise 480ms ease-out | Screen / section mount |
| `stagger` | 70ms between siblings | Welcome, tab roots |
| `breathe` | opacity ~4.2s ease-in-out | Orb idle |
| `chart-in` | stroke draw 900ms + fade 420ms | First Living Chart paint |
| `transit-settle` | outer ring 1100ms ease-out | Daily transits |
| `weather-drift` | wash drift 14s — **Sky only if Opening > 0.6** | Ambient |
| `flare` | 1.8s once | Orb FOUND |
| `sheet-up` | 460ms cubic-bezier(0.22, 1, 0.36, 1) | Bottom sheets |
| `dot` | width morph 220ms | Carousel progress |
| `spring` | damping 18 / stiffness 220 | Tab active bubble |

**Reduced motion:** disable scale/drift; opacity swaps + final frames only.

**Budget:** ≤ 2 concurrent idle animations.

---

## 07 · Layout & components

### Composition
- Every screen has one dominant job and a visible reading path. Large
  sentence-case headings replace wordmark-plus-uppercase-label chrome.
- Auth and onboarding are full-screen atmospheric scenes with thin progress,
  one focused input/choice area, and a bottom-pinned black CTA.
- Sky uses a date/status header and layered timeline/card-stack composition.
  Chart uses one large focal chart card followed by clean instrument rows.
- Translucent panels communicate content layered over a changing sky; they
  are not decorative wrappers. Avoid nested cards and uniform card grids.

### Touch
- Min hit 44×44.
- Primary CTA height 56, **stadium/pill** radius; soft press scale.
- Sheet grabber soft pill, large top radius (32).

### Bottom tab bar (G1) — production chrome (locked)

Component: `components/brand/ObservatoryTabBar.tsx` — **custom**, not default
Expo/React Navigation chrome.

| Spec | Value |
|---|---|
| Height | 64 + bottom safe-area inset |
| Background | solid white floating capsule + soft shadow |
| Edge | 16px screen inset, full capsule radius; no full-width top rail |
| Layout | 5 equal columns: Sky · Chart · Lens · Bonds · Atelier |
| Icon size | Lucide 22–24px, rounded stroke 1.75–2.25 |
| Label | Inter ~11px |
| Inactive | icon + label `--text-3` |
| Active | black `--text-1` + quiet `raised` bubble |
| Lens tab active | centered Sparkles mark; no raised FAB |
| Press | SoftPress scale 0.97 |
| Badge | none on tabs in v1 |
| Hide on | full-screen paywall, onboarding, auth, computing |

Do **not** use: default Material/Ionicons chrome, centered raised FAB, emoji
labels, full-width tab rails, frosted-glass tab bars, or lavender-as-active.

### Living Chart
- Diameter ~ min(screen−48, 340).
- Sign ring opacity 0.35; house numbers meta.
- Planet glyphs from `components/icons/graha/*` — stroke 1.5.
- Aspect lines: ivory 8% default; highlight 35% on selection.

### Bond Constellation
- Two focal points; threads = aspects.
- Domain lenses as five labeled arcs — not emoji hearts.

---

## 08 · Iconography (locked system)

**Strategy:** `lucide-react-native` is the interface and navigation language:
recognizable rounded forms, 22–24px optical size, stroke 1.75–2, and theme
colors. First-party SVG remains reserved for Graha, weather axes, and
domain-specific astrology marks that have no truthful generic equivalent.

### Package & API

```
components/icons/
  Icon.tsx              // specialized astronomy marks + compatibility registry
  graha/                // Sun Moon Mercury Venus Mars Jupiter Saturn Rahu Ketu Lagna
  domains/              // Talk Care Spark Friction Growth
  weather/              // Clarity Pressure Friction Opening (axis marks)
lucide-react-native     // tabs, navigation, actions, status, ordinary objects
```

Ordinary icon-only actions use `IconButton`: 44–48px hit target, explicit
accessibility label, 22px glyph, and selected/disabled state. Specialized
`Icon` marks remain 16–24px, stroke 1.5, round caps/joins, and no decorative
fill.

### Required inventory (ship all)

**Tabs:** CloudSun (Sky), Orbit (Chart), Sparkles (Lens), UsersRound (Bonds),
NotebookPen (Atelier).

**Graha (mandatory):** sun, moon, mercury, venus, mars, jupiter, saturn,
rahu, ketu, lagna — distinct, legible at 16px.

**System:** use the closest semantic Lucide glyph; never use Unicode arrows or
text characters as controls.

**Domains:** talk, care, spark, friction, growth — geometric, no hearts/fire emoji.

**Weather axes:** clarity, pressure, friction, opening — simple meter marks.

### Dev gallery requirement

`/dev/system` must render the **full icon sheet** (every icon at 16/24/32,
Ink + Dawn) so QA can catch missing or mismatched strokes.

---

## 09 · Sound (optional post-beta)

Silent by default. If added later: single soft glass tick on chart open —
never notification chirps in UAT.

---

## 10 · Photography / illustration

Soul Cartography may use a **generated abstract grain portrait** (soft ink
wash) — never photoreal faces, never stock “ ethereal woman.” Prefer generative
grain field from signatures hash.

---

## 11 · Fallback ladders

| Level | When | UX |
|---|---|---|
| L0 | All systems | Full narration + motion |
| L1 | LLM slow | Skeleton note → populate |
| L2 | LLM down | Template lines from weather + dasha; Lens quieter mode |
| L3 | Offline | Cached chart/weather/journal; composer disabled with honest line |
| L4 | Compute fail | Empty observatory + recover CTA — never fake planets |

---

## 12 · Accessibility

- Dynamic Type: body scales; display may cap.
- Contrast: text-1 on void ≥ 7:1 Ink; ≥ 7:1 Dawn.
- Screen reader: Living Chart exposes planet list as accessibility elements;
  wheel is decorative if list present.
- Focus / explore: VoiceOver order Sky Weather → Muhurta → Lens note → Chart peek.

---

## 13 · Content samples (canonical)

**Sky Weather note:**  
“Clarity runs high; friction gathers around conversations after dusk. Prefer
one honest talk over three careful ones.”

**Muhurta:**  
`CONNECT · 18:40–20:10` — “Venus presses your 3rd — messages land softer.”

**Empty Bonds:**  
“No one in your sky yet. Add a birth to see how two charts braid.”

**Quiet Lens (LLM down):**  
“I’m on quieter mode — I can still read your chart and dasha, just without
longer conversation.”

**Paywall headline:**  
“Grahalens Private — the full observatory.”

**Paywall sub:**  
“Unlimited Lens, every Bond, Soul Cartography, and the Pattern Thread —
still quiet, still precise.”

**Quota chip:**  
“3 of 5 free messages today”

**Gate line:**  
“This opens with Private.”

---

## 14 · Paywall & commerce craft

Paywalls are **product surfaces**, not guilt traps.

**Do:** one composition; Wordmark or short title; 2 plan cards; primary CTA on
yearly (trial badge); secondary monthly; Restore as text button; legal footer
(auto-renew, length, price, manage in store); Skip only on welcome soft paywall.

**Don’t:** fake countdown timers; stacked checkmark spam; confetti after
purchase; “everyone’s upgrading” social proof lies; emoji; purple gradients;
blocking the app on first launch with no skip.

**LockGlyph:** 14px orange stroke lock — never a neon badge.  
**Success screen:** one calm line + CTA “Enter observatory” — no fireworks.

---

## 15 · Ship checklist (per screen)

Run on: Welcome, Onboarding, Sky, Chart, Lens, Bonds, Atelier, Paywall,
Settings — and spot-check nested routes from `docs/SCREENS.md`.

| Audit | Check |
|---|---|
| Accent | Champagne < 5%; no purple |
| Motion | ≤ 2 idle; reduced-motion parity |
| Numbers | Degrees mono tabular; from compute only |
| Voice | No emoji/snark/fear; catalog empties verbatim |
| Theme | Ink + Dawn both designed |
| Silence | Empty states one honest line |
| State | Loading / empty / error / offline present |
| Chart | Living Chart accessible list + visual |
| Error | Cause + fix; nothing half-written to DB |
| Pay | Soft skip once; hard gates honest; restore visible; legal footer |
