# Grahalens — agent notes

This folder is a from-scratch build pack. Specs + 30 ordered Cursor prompts in
`PROMPTS.md`. Code is produced by running prompts **01 → 30**, one chat each.

## Build order

1. Read `PLAN.md` then `docs/SCREENS.md` before scaffolding.
2. Run `PROMPTS.md` Prompt 01 first. Verify before Prompt 02.
3. Phases 1–2 (ephemeris + intelligence) before UI polish.
4. Gate: `npm run test:beta` + `TESTING.md`.

## Locked decisions (do not reopen casually)

- Expo SDK **54** + Expo Router + TypeScript strict (pin to Expo Go App Store)
- Whole-sign Lahiri houses; computation before narration
- Single entitlement `grahalens_private`; `EXPO_PUBLIC_IAP_MODE=mock|store`
- State ownership four-lane table in `PLAN.md` §2 (Zustand / TanStack Query /
  component / derived ephemeris) — do not invent per-screen conventions
- Observatory design only — no UI kits, no emoji/nebulas

## graphify

This project has a knowledge graph at `graphify-out/` with god nodes, community
structure, and cross-file relationships.

Rules:
- For codebase / spec questions, first run `graphify query "<question>"` when
  `graphify-out/graph.json` exists. Use `graphify path "<A>" "<B>"` for
  relationships and `graphify explain "<concept>"` for focused concepts.
- If `graphify-out/wiki/index.md` exists, use it for broad navigation instead
  of raw source browsing.
- Read `graphify-out/GRAPH_REPORT.md` only for broad architecture review or
  when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current
  (AST-only for code, no API cost).
