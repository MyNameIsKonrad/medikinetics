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
- Phase 10: Bateman equal-rate limit fix (PR #19); fasted CR model (single phase 20mg ka=1.0, default); per-dose fed/fasted toggle chip on pill cards; GitHub Issues workflow established
- UX pass (PRs #23–#29): design tokens, Space Grotesk + DM Mono typography, interactive affordances, scale-transform press feedback (JS touchstart handler for iOS), undo toast drain bar, fed/fasted chip → toggle switch (direct DOM update in toggleFed for CSS transition), silent debounce → 400ms `.just-fired` disable, CR orange muted (#f5a050 → #b08860), double-tap zoom prevention

## Key architectural decisions
- Single-file: all app logic lives in `index.html`. Keep it that way.
- PK model: Bateman equation, KE=0.347, KA=2.0 (IR), KA=0.7 (CR fed delayed phase), KA=1.0 (CR fasted — judgment call, single phase)
- CR pills store `fed: boolean` (default false). `phasesFor(pill)` selects `MEDS.CR.fastedPhases` or `MEDS.CR.phases` accordingly. All phase iteration must go through `phasesFor()`.
- Simulation is ephemeral (`simulatedPills` array, never saved) — not "scheduled doses"
- Graph window left edge anchors to today's midnight; PK curve uses 24h rolling filter
- "taken today" stat uses `startOfLocalDay()`; PK curve uses rolling 24h
- `html, body` has `touch-action: manipulation` — blocks iOS double-tap zoom globally without disabling pinch zoom
- `.pill-card` carries `data-id="${pill.id}"`. `toggleFed()` updates toggle DOM directly (class toggles on `.fed-track` and `.fed-lbl` only) then calls `renderChart()` + stats inline — does NOT call `render()`, so the `.2s` CSS slide transition plays on the thumb
- Dose button debounce removed. After a real log, all `.dose-btn` get `disabled` + `.just-fired` (opacity .35) for 400ms. The `touchstart` handler skips `disabled` elements — feedback and action stay in sync
- `--cr: #b08860` (muted warm brown); `--clearing: #7a6248`. `MEDS.CR.color` must match `--cr`

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
| CR | Methylphenidate CR | 20mg | **Fasted (default):** 20mg at 0h (ka=1.0). **Fed:** 10mg at 0h (ka=2.0) + 10mg at +4h (ka=0.7) |
