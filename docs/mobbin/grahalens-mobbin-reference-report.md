# Grahalens Mobbin Research Report

> Research only — **no production UI implemented in this phase.**  
> Sources: Mobbin iOS flows/screens + local Nummi AI competitive capture (`nummi-ai/`) + `docs/BRAND-BOOK.md`, `docs/SCREENS.md`, `docs/PRD.md`, `PLAN.md`.  
> Catalog: `docs/mobbin/raw/catalog.json` (~127 flow screens across 13 flows + 18 discrete screens).

**One-line read:** a private Jyotish observatory for people seeking decision clarity, combining daily sky, chart evidence, AI companion, journal, and bonds — premium, quiet, precise, non-gimmicky.

---

## 1. Executive Design Read

Grahalens is not a horoscope mill and not a spiritual chatbot with a chart bolted on. Brand Book ideology wins: dark ink, champagne accents under 5%, sacred computation, adult voice, hairlines over card soup.

### What Mobbin proved (patterns)

1. **Premium wellness (Calm, Headspace)** reduce first-run to one job at a time, then monetize after a taste of value — or after a clear habit loop is visible.
2. **Premium AI (Claude)** beats ChatGPT-class chrome for Observatory craft: serif greeting, quiet void, single accent, floating composer, explicit privacy moments.
3. **Astrology mainstream (Moonly, Tinder Cosmic, Nummi)** converge on neon/purple, feature zoos, early hard paywalls, and “vibes lists” without ephemeris “why” — Grahalens should **avoid the visual world** and **steal only the jobs**.
4. **Settings/privacy leaders (Headspace, Blinkist, Finimize, Apple patterns)** put restore, legal, delete, and subscription status in predictable list IA — users expect this (Jakob’s Law).

### Nummi wedge (anti-reference, not visual clone)

Nummi converts with Vedic + memory chat + early Pro, but:

| Gap | Opportunity |
|---|---|
| Paywall before chart proof | Soft paywall after free Big Three + houses |
| Free Today = generic Good for / Watch out | Sky Weather + Muhurta with expandable rule “why” |
| Locks sign meanings / daily shift behind Pro | Free chart literacy; gate depth / private / unlimited |
| Dual chat entry (bar + FAB) | Single Lens entry; starters grounded in *their* chart |
| Explore = Past Life / Cosmic Space / Journal zoo | Five instrument tabs; no sanctuary cosmetics |
| Chart data buried in settings | Birth facts always inspectable + recompute |

**Sales implication:** demonstrate computation honesty in the free path; sell Private as *depth, privacy, continuity* — not as unlocking identity glyphs.

### UX laws applied (design system reflexes)

| Law | Grahalens application |
|---|---|
| Hick’s | One primary CTA per viewport; ≤3 welcome pages; 2 plan choices |
| Fitts’s | 52px primary CTA; 44×44 hits; full-width birth pickers |
| Miller’s | Chunk onboarding; Lens replies 2–4 short paragraphs |
| Gestalt / Proximity / Common Region | Group Sky Weather + note; hairline regions not card grids |
| Doherty | Honest A10 stages; Lens THINKING orb within ~400ms feedback |
| Jakob’s | Familiar settings list; composer at bottom; restore + legal |
| Zeigarnik | Incomplete birth time + computing stages + daily check-in |
| Aesthetic-Usability | Quiet craft increases trust for “AI + astrology” skepticism |
| Pareto | Sky + Chart + Lens drive 80% value; polish those first |
| Serial Position | First/last: wordmark + CTA; Sky: weather then Muhurta |
| Tesler | Complexity in ephemeris engine; UI stays simple |
| Postel | Accept unknown birth time; degrade honestly |
| Parkinson | Constrain onboarding fields; no gender-as-astrology chore |
| Von Restorff | Champagne only on active graha / primary CTA / wordmark period |
| Similarity / Continuity / Closure / Prägnanz | Consistent icons; Living Chart completes as one figure |

---

## 2. Reference Set

Legend: **Adopt** = keep pattern · **Adapt** = keep job, restyle · **Avoid** = anti-pattern for Observatory.

### Onboarding / birth profile

| App | Flow / screen | Link | Pattern | Verdict |
|---|---|---|---|---|
| Co–Star | Onboarding | [flow](https://mobbin.com/flows/ca4b6afb-f05a-462f-b9a7-ab026b438d39) | Minimal identity → birth facts → account | **Adapt** structure; avoid B&W snark |
| Moonly | Onboarding | [flow](https://mobbin.com/flows/992bc16a-8d0b-4961-8078-98e2e807a32a) | Long personalization + cosmic chrome | **Adapt** birth steps only; **Avoid** neon |
| Calm | Onboarding + Subscribe | [flow](https://mobbin.com/flows/38549b00-2fe8-4fd1-914b-13c4905db245) | Goal → personalize → paywall | **Adapt** pacing |
| Coffee Meets Bagel | Positioning | [screen](https://mobbin.com/screens/5d6c98af-8be6-42e7-98e7-333cb3a339b2) | High-trust “not for everyone” copy | **Adapt** for A2 voice |
| Nummi (local) | IMG_3653–3655 | `nummi-ai/` | Name/gender → birth → fluff loading | **Avoid** gender weight; improve unknown-time |

### Daily home / sky screen

| App | Flow / screen | Link | Pattern | Verdict |
|---|---|---|---|---|
| Calm | Discover / Home habit | [flow](https://mobbin.com/flows/e3f9f96b-d21f-400c-a94f-39bc53f8f40c) | One hero progress + day strip | **Adapt** → Sky Weather field (not streak circus) |
| Calm | Profile check-ins | [flow](https://mobbin.com/flows/32f53762-649e-4ac9-b0dc-2bc8fd8cce70) | Quiet list of reflection entry points | **Adopt** for Atelier |
| Lóvi | Insights hub | [screen](https://mobbin.com/screens/89a3980e-0e72-4f40-9927-ea3c7b411e84) | Education + personalization badge | **Adapt** “why this weather” |
| Nummi (local) | Today | IMG_3663–3664 | Mood PRO + Good for/Watch out + dual chat | **Avoid** as composition |

### Chart / evidence screen

| App | Flow / screen | Link | Pattern | Verdict |
|---|---|---|---|---|
| Moonly | Calculate birth chart | [flow](https://mobbin.com/flows/9ef67bb7-3a11-456f-8866-a38c8fa4b9ce) | Date/time/place → result | **Adapt** |
| Pinterest | Audience insights empty | [screen](https://mobbin.com/screens/a8e525f4-cc16-43a1-9e9d-2a414a545122) | Honest empty + “about this data” | **Adopt** for unknown time / loading |
| Nummi (local) | You / Chart | IMG_3659–3660 | Big Three + locked meanings + streak | **Avoid** locking identity text |

### AI companion / Lens chat

| App | Flow / screen | Link | Pattern | Verdict |
|---|---|---|---|---|
| Claude | Dark empty + composer | [screen](https://mobbin.com/screens/ee3f2db4-079b-4034-8905-9938a40e8f0e) | Serif greeting, single accent, quiet void | **Adopt** (closest peer) |
| Claude | Composer + attachment | [screen](https://mobbin.com/screens/e502b32e-3771-49cd-b0db-92eeff96922e) | Attachment chip + send | **Adapt** (Lens: chart context chips, not files-first) |
| Claude | Thread history | [screen](https://mobbin.com/screens/f3b4e44f-c25f-4915-87f7-f8bdfdde0609) | Search + new + long-press manage | **Adopt** for L2 |
| Claude | Incognito privacy | [screen](https://mobbin.com/screens/cee9016f-f39a-4a08-b55d-aa25b66b84b0) | Explicit memory/privacy empty | **Adopt** trust copy |
| ChatGPT | Chat + starters | [flow](https://mobbin.com/flows/86f171f6-2b2c-498b-a76d-fd21dd493a10) | Starter cards + bottom composer | **Adapt** starters; **Avoid** white SaaS + purple Plus |
| Nummi (local) | Ask Nummi | IMG_3661 | Blank “Afternoon flow…” | **Avoid** blank-page |

### Journal / reflection

| App | Flow / screen | Link | Pattern | Verdict |
|---|---|---|---|---|
| Journal (Apple) | Insights calendar | [screen](https://mobbin.com/screens/26ddbf34-3a78-4967-8550-f2157492d96f) | Calendar dots → featured entry | **Adapt** for R2 |
| Calm | Check-ins list | [flow](https://mobbin.com/flows/32f53762-649e-4ac9-b0dc-2bc8fd8cce70) | Named reflection types | **Adopt** for R7 |
| Tiimo | Weekly mood | [screen](https://mobbin.com/screens/0cc0bb9a-f7a5-414b-9eb0-61e5a93d2782) | Week strip of logged days | **Adapt** without emoji faces |

### Bonds / compatibility

| App | Flow / screen | Link | Pattern | Verdict |
|---|---|---|---|---|
| Moonly | Compatibility | [screen](https://mobbin.com/screens/490a2f20-98cf-4fef-a109-e8be7040db20) | Domain chips + CTA | **Adapt** domains; **Avoid** neon 3D |
| Tinder | Cosmic Spark | [screen](https://mobbin.com/screens/7c552e9f-1f66-4fd1-97f8-cdaa08b265b2) | Bars + locked traits + purple nebula | **Avoid** visual; **Adapt** incomplete-data honesty |
| BFF | Relationship select | [screen](https://mobbin.com/screens/ad69c5b3-03d2-4dba-bef4-37647adb2c27) | Large single-select targets | **Adapt** for bond type if needed |

### Paywall / subscription

| App | Flow / screen | Link | Pattern | Verdict |
|---|---|---|---|---|
| Headspace | Subscribe | [flow](https://mobbin.com/flows/ccf14439-4c45-4d56-b031-45173490cafe) | Value → plans → trial clarity | **Adopt** structure |
| Headspace | Onboarding→paywall | [flow](https://mobbin.com/flows/31b21791-dec6-448a-8253-648f5ebbba3e) | Personalize then ask | **Adapt** (ask after chart) |
| Moonly | Onboarding + Subscribe | [flow](https://mobbin.com/flows/87813e2f-8e67-4cd7-9510-7892c0676442) | Early monetize | **Avoid** timing |
| Fabric | Restore | [screen](https://mobbin.com/screens/8fb686eb-6ecb-4c9c-b50b-43954b129929) | Dedicated restore surface | **Adapt** into X8 |
| Nummi (local) | Paywall | IMG_3656 | Feature laundry before proof | **Avoid** timing/copy shape |

### Settings / privacy

| App | Flow / screen | Link | Pattern | Verdict |
|---|---|---|---|---|
| Headspace | Subscription details | [flow](https://mobbin.com/flows/f3815335-5ab5-41f4-9299-7d81f32340ab) | Type / renew / store path | **Adopt** for X7 |
| Headspace | Cancel flow | [flow](https://mobbin.com/flows/a2f8004c-5004-40b6-9f58-ed0953a391b7) | Feedback before cancel | **Adapt** tone (no mascot) |
| Blinkist | Settings | [screen](https://mobbin.com/screens/05c19142-a8e0-4097-bd36-ca2f4ab2d80e) | Restore + legal + delete | **Adopt** IA |
| Tiimo | Settings | [screen](https://mobbin.com/screens/a70332c5-eb5a-4f01-8e14-1348848f6aae) | Restore / redeem / delete / privacy | **Adopt** grouping |
| Finimize | Delete confirm | [screen](https://mobbin.com/screens/5eb08061-e97f-46dd-980e-85db04d7db5b) | Sub warning before wipe | **Adopt** for X13 |

---

## 3. Patterns Top Apps Converge On

### Onboarding friction

- One question per screen; progress indicator; skip only where Postel allows (birth time).
- Collect birth date → time → place → confirm before compute (matches SCREENS A6–A10).
- Avoid long personality quizzes before first “proof moment.”

### Daily habit home

- One hero instrument (Calm streak / Grahalens Sky Weather).
- Secondary strip of time-boxed actions (Muhurta).
- Do not bury companion behind a second FAB.

### Chat composer / history / empty

- Empty: brand presence + 2–4 starters (Hick’s), not a wall of capabilities.
- Composer bottom-docked; clear send; generation feedback (Doherty).
- History: searchable list + rename/delete (Claude).
- Privacy: say what memory does / does not do (Claude incognito).

### Subscription value-before-ask

- Best converters show a free artifact first (wellness sample / chart snapshot).
- Two plans; yearly default with trial badge; restore + skip where soft.
- Nummi/Moonly-style early hard sell without proof burns skeptics — Grahalens soft A11 once, hard gates later.

### Trust & privacy visible

- Settings lists with Restore, Privacy, Terms, Disclaimer, Delete, Export.
- Destructive actions: confirm + subscription reminder (Finimize).
- Birth data editable (accuracy = product).

### Settings structure

- Grouped lists + hairlines (Jakob’s).
- Subscription status separate from legal.
- Appearance (Ink/Dawn) near top for Observatory identity.

---

## 4. Grahalens-Specific UX Decisions

### A2 Welcome

- **Job:** Position private observatory; one CTA into auth/guest.
- **Refs:** CMB positioning; Calm/Co-Star carousel restraint.
- **Do:** 3 pages max — companion / sky / bonds; wordmark hero; adult copy.
- **Avoid:** emoji, nebula, feature laundry, Nummi “spiritual AI” crown.
- **Components:** Carousel, progress dots, primary CTA 52px.
- **States:** N/A (static); reduced motion = no auto-advance.

### A6 Birth date

- **Job:** Capture date with calendar clarity.
- **Refs:** Moonly/Co-Star birth steps.
- **Do:** Large picker; meta label; progress “1 of 3.”
- **Avoid:** gender/pronouns as astrology prerequisite (Nummi).
- **Components:** DateWheel / Calendar, Continue.
- **States:** Invalid future date error inline.

### A7 Birth time

- **Job:** Capture time or honest unknown.
- **Refs:** Tinder incomplete Rising prompt (honesty); Postel.
- **Do:** Primary “I don’t know” equal weight; explain house degrade.
- **Avoid:** silent 12:00 default without disclosure (Nummi).
- **Components:** Time picker, UnknownTimeSheet.
- **States:** Unknown → ALERT orb later; chart banner.

### A8 Birth place

- **Job:** Geocode place; offline top cities.
- **Refs:** Moonly place step.
- **Do:** Typeahead search; top cities offline; lat/lon stored.
- **Avoid:** separate dead-end Search tap with no inline results.
- **Components:** PlaceSearch, CityChip list.
- **States:** Offline / no results / permission deny.

### A10 Computing

- **Job:** Honest stages; build trust in computation.
- **Refs:** Pinterest “about this data”; Zeigarnik stages.
- **Do:** resolve → natal → dasha → weather; show real milestones.
- **Avoid:** Nummi “Creating Your Space” fluff.
- **Components:** StageList, LensOrb READING.
- **States:** Error retry; timeout with offline fallback narrative.

### A11 Welcome paywall

- **Job:** Soft monetize after first chart proof.
- **Refs:** Headspace value→plans; **Avoid** Nummi pre-proof.
- **Do:** Show Big Three peek above plans; skip once; yearly default + trial.
- **Avoid:** Feature laundry without sample; dark patterns trapping skip.
- **Components:** PlanCards, Restore, SkipOnce, LegalRow.
- **States:** Store unavailable → P4; restore success → Private.

### S1 Sky home

- **Job:** Morning orientation instrument.
- **Refs:** Calm single-hero home; Brand Book §07 composition.
- **Do:** wordmark + Sky Weather + Lens note + Muhurta strip.
- **Avoid:** lucky color/number; dual chat FAB; mood PRO gate first (Nummi).
- **Components:** SkyWeatherField, MuhurtaStrip, LensNoteCard, ObservatoryTabBar.
- **States:** Loading skeleton; empty if no birth; error with retry.

### C1 Living chart

- **Job:** Sacred evidence object + placements.
- **Refs:** Moonly chart result job; Pinterest honesty.
- **Do:** Skia Living Chart; free Big Three + houses readable; mono degrees.
- **Avoid:** Locking “what this means” on core signs (Nummi); purple wheel cosmetics.
- **Components:** LivingChart, PlacementList, UnknownTimeBanner.
- **States:** Computing; unknown-time degraded; selection sheet.

### L1 Lens companion

- **Job:** Grounded conversation with memory.
- **Refs:** Claude quiet empty + composer; ChatGPT starters (structure only).
- **Do:** LensOrb states; 3 chart-grounded starters; quota meter; no second FAB.
- **Avoid:** blank page; purple Plus pill; emoji tone.
- **Components:** ThreadView, Composer, StarterChips, QuotaHint, Orb.
- **States:** Empty; thinking; error; quota GATE → paywall.

### B1 / B2 / B3 Bonds

- **Job:** Relationship clarity without snark.
- **Refs:** Moonly domain chips (structure); Tinder incomplete-data honesty; **Avoid** neon.
- **Do:** Free 1 bond; wizard mirrors birth onboarding; constellation + Talk/Care/Spark/Friction/Growth.
- **Avoid:** Percentage soulmate carnival; purple glow.
- **Components:** BondList, AddWizard, Constellation, DomainRow.
- **States:** Empty invite; computing; GATE bond #2; share card.

### R1 / R2 / R3 Atelier journal

- **Job:** Reflection linked to sky.
- **Refs:** Apple Journal calendar; Calm check-in list.
- **Do:** Hub → list → compose with weather-linked prompt.
- **Avoid:** Past-life theater as free novelty; emoji mood soup.
- **Components:** AtelierHub, EntryList, Composer, WeatherPrompt.
- **States:** Empty; save error; Private gates for Soul/Patterns.

### X1 Settings

- **Job:** Trust, control, subscription hygiene.
- **Refs:** Blinkist/Tiimo/Headspace lists; Finimize delete.
- **Do:** Birth editable near top; Restore; legal; delete with sub warning; Ink/Dawn.
- **Avoid:** Burying chart; Upgrade as only hero.
- **Components:** SettingsGroup, Row, DestructiveRow.
- **States:** Loading entitlement; restore pending.

### P1 Paywall

- **Job:** Clear Private value; purchase or restore.
- **Refs:** Headspace subscribe; Brand Book paywall craft.
- **Do:** Monthly $7.99 / Yearly $49.99 + 3-day trial; entitlement `grahalens_private`.
- **Avoid:** Nummi crown + laundry before evidence; purple gradients.
- **Components:** OfferingList, CTA, Restore, Legal.
- **States:** Purchasing; success P3; unavailable P4.

---

## 5. Visual System Extraction

### Steal (pattern only)

| Pattern | Source | Grahalens translation |
|---|---|---|
| Quiet empty + serif greeting | Claude | Lens empty with Cormorant + Orb |
| Floating composer | Claude / ChatGPT | Raised surface + hairline; champagne send |
| Habit hero | Calm | Sky Weather field, not streak ring |
| Check-in list | Calm | Atelier / R7 |
| Plan dual-choice + restore | Headspace / Fabric | A11 / P1 / X8 |
| Grouped settings + delete confirm | Blinkist / Finimize | X* routes |
| Domain chips for relationships | Moonly | Bond domains without neon |
| Honest incomplete data | Tinder Cosmic / Pinterest | Unknown time banners |
| High-trust positioning | CMB | A2 adult “not for carnival seekers” |

### Never copy

- Purple / indigo nebula (Tinder Cosmic, Moonly glow)
- Co-Star pure meme B&W snark
- Nummi terracotta card soup + dual FAB + early laundry paywall
- Default Ionicons tab chrome
- Emoji as UI
- Lucky color / number widgets
- Card soup dashboards

### Brand Book lock-ins

- Ink `#07080A` / Dawn `#F3EFE7`; accent `#C4A574` < 5%
- Cormorant + Manrope + IBM Plex Mono
- Custom `ObservatoryTabBar`
- Living Chart sacred; tabular degrees
- Max 2 idle motions

---

## 6. Proposed Grahalens Design Plan

### Implement first (sales + trust)

1. Theme tokens + ObservatoryTabBar + LensOrb  
2. Auth/onboarding A1–A10 (proof path)  
3. Soft A11 + P1–P5 billing state machine  
4. S1 Sky + C1 Chart (free value)  
5. L1 Lens + quota gate  
6. Bonds B1–B3  
7. Atelier R1–R3 / R7  
8. Settings X* polish  

### Likely file areas (when approved)

- `app/(auth)/*`, `app/onboarding/*`, `app/(app)/*`, `app/paywall/*`, `app/settings/*`
- `components/brand/*`, `components/chart/*`, `components/lens/*`
- `theme/tokens.ts`
- `lib/billing/*`, `lib/ephemeris/*`

### Shared components to confirm

`ObservatoryTabBar`, `LensOrb`, `SkyWeatherField`, `MuhurtaStrip`, `LivingChart`, `PlanCard`, `PaywallSheet`, `SettingsRow`, `EmptyState`, `ErrorState`, `UnknownTimeBanner`, `StarterChips`

### Remain unchanged (locked)

- Expo 54 + Router + TS strict  
- Whole-sign Lahiri; computation before narration  
- Entitlement `grahalens_private`; IAP mock|store  
- Four-lane state ownership (PLAN §2)  
- Screen inventory SCREENS.md  

---

## 7. Implementation Prompt Pack

Paste one prompt per chat. Each references Brand Book + SCREENS. ≤5 files when possible. **Do not start until this report is approved.**

### Prompt 1 — Tokens + TabBar + Orb

```
Read docs/BRAND-BOOK.md and docs/SCREENS.md.
Implement/confirm Observatory tokens in theme/tokens.ts (Ink+Dawn),
components/brand/ObservatoryTabBar.tsx (5 tabs, champagne active, no Ionicons defaults),
and components/brand/LensOrb.tsx (IDLE/READING/THINKING/SPEAKING/FOUND/ALERT + reduced motion).
No purple, emoji, or UI kits. Verify: tsc / lint on touched files; visual check tab bar on S1 stub.
Touch ≤5 files.
```

### Prompt 2 — Onboarding birth path A6–A10

```
Read docs/BRAND-BOOK.md and docs/SCREENS.md (A6–A10).
Ship birth date/time/place/confirm/computing with honest unknown-time, place typeahead,
and A10 stages (resolve→natal→dasha→weather). No fluff “creating your space.”
Verify: complete guest path to chart fixture; unknown time shows banner.
Touch onboarding routes + shared birth components only.
```

### Prompt 3 — Soft paywall A11 + P1 shell

```
Read docs/BRAND-BOOK.md, docs/SCREENS.md (A11, P1–P5), PLAN.md entitlements.
Build soft welcome paywall after first chart (skip once) and full P1 with monthly/yearly,
restore, legal; EXPO_PUBLIC_IAP_MODE=mock purchase unlocks grahalens_private.
Show chart proof above plans. No feature-laundry-before-proof.
Verify: mock purchase → entitlement true within 2s; skip once works.
```

### Prompt 4 — S1 Sky composition

```
Read docs/BRAND-BOOK.md §07 and docs/SCREENS.md S1–S3.
Implement Sky home: wordmark + Sky Weather field + one Lens note + Muhurta strip.
No lucky color/number, no dual chat FAB, no card soup.
Loading/empty/error required. Verify: npm test or screen render with fixture weather.
```

### Prompt 5 — C1 Living Chart free literacy

```
Read docs/BRAND-BOOK.md (sacred chart) and docs/SCREENS.md C1–C2.
Living Chart + placements; free Big Three + houses readable; never lock identity meanings.
Mono degrees; unknown-time banner. Verify: natal vs fixture ≤0.5° if tests exist.
```

### Prompt 6 — L1 Lens quiet companion

```
Read docs/BRAND-BOOK.md (Lens voice/orb) and docs/SCREENS.md L1–L6.
Claude-quiet empty: Orb + Cormorant greeting + 3 chart-grounded starters + composer.
Quota 5/day free → GATE paywall. No emoji, no purple Plus.
Verify: starter sends message; quota blocks 6th; THINKING orb on request.
```

### Prompt 7 — Bonds B1–B3

```
Read docs/BRAND-BOOK.md and docs/SCREENS.md B1–B7.
Bond list, add wizard (mirrors birth), bond home with domains.
Free 1 bond; #2+ GATE. Avoid neon % soulmate UI; use constellation + domains.
Verify: add one bond; second opens paywall; empty state CTA.
```

### Prompt 8 — Settings X1 + delete/restore

```
Read docs/BRAND-BOOK.md and docs/SCREENS.md X1–X14.
Settings hub with birth edit, Ink/Dawn, subscription, restore, legal, delete confirm
(warn if active sub), export Private-gated. Hairline groups, Jakob’s list IA.
Verify: restore mock; delete confirm copy; appearance toggles theme.
```

---

## Appendix — Nummi anti-patterns (sales)

1. Early paywall before chart evidence → soft A11 after compute.  
2. Free today without planetary “why” → Sky Weather explanations.  
3. Locking sign meaning → free literacy, paid depth.  
4. Dual chat affordances → single Lens.  
5. Feature zoo (Cosmic Space) → five instruments.  
6. Indeterminate mystical loading → staged A10.  
7. Mood gated before insight → free weather first.  
8. Buried birth data → settings birth + recompute.

---

**Status:** Research complete. **Awaiting approval before any production screen edits.**
