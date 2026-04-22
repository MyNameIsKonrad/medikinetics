# Medikinetics — Claude Code context

## What this is
A single-file PWA (`index.html` + `sw.js`) for tracking methylphenidate pharmacokinetics.
One-compartment oral absorption model (Bateman equation). No build step, no framework.
Deployed on GitHub Pages; test target is Safari on iPhone.

## Current state
Check `git log` for the latest. Phases completed so far:
- Phases 1–5: bug fixes, smarter graph window, crosshair dots, unified scrub/time chip, PK-threshold pill visibility, clearing cards
- Phase 6: graph window anchored to today's midnight; "taken today" = calendar day
- Phase 7: README cleanup; "in system" label → "mg eq"
- Phase 8: dose simulation / preview (ephemeral, never persisted)
- Phase 9: isRising uses PK slope; clearing bar removed; this file added

## Key architectural decisions
- Single-file: all app logic lives in `index.html`. Keep it that way.
- PK model: Bateman equation, KE=0.347, KA=2.0 (IR), KA=0.7 (CR delayed phase)
- Simulation is ephemeral (`simulatedPills` array, never saved) — not "scheduled doses"
- Graph window left edge anchors to today's midnight; PK curve uses 24h rolling filter
- "taken today" stat uses `startOfLocalDay()`; PK curve uses rolling 24h

## Workflow — follow exactly
1. Read `git log` and recent merged PRs to understand current state before starting
2. Create a dedicated branch for each feature or fix
3. Open a PR — do not merge yourself, wait for user approval
4. Never push directly to main
5. Never infer upcoming work from `README.md` — the README describes what is built, not what comes next. Ask the user what to do next.

## Medications modelled
| Label | Drug | Dose | Phases |
|-------|------|------|--------|
| IR ½ | Methylphenidate IR | 5mg | Single phase, ka=2.0 |
| IR | Methylphenidate IR | 10mg | Single phase, ka=2.0 |
| CR | Methylphenidate CR | 20mg | 10mg at 0h (ka=2.0) + 10mg at +4h (ka=0.7) |
