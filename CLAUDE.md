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
- Color clarification (PRs #33–#34): dose button borders → neutral --muted; fed toggle → --green; CR recolored to lavender (#9d7fd4); button sublabels simplified to "5mg" / "10mg" / "20mg"; dose buttons neutral (no type color — color lives on graph + cards only)

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
- `--cr: #9d7fd4` (lavender/violet); `--clearing: #614f8a`. `MEDS.CR.color` must match `--cr`

## Workflow — follow exactly
1. Read `git log` and recent merged PRs to understand current state before starting
2. Create a dedicated branch for each feature or fix
3. Open a PR — do not merge yourself, wait for user approval
4. Never push directly to main
5. Never infer upcoming work from `README.md` — the README describes what is built, not what comes next. Ask the user what to do next.
6. Use conventional commit prefixes on every commit: `feat:` (new capability), `fix:` (bug), `docs:` (README/CLAUDE.md only), `chore:` (refactor, rename, housekeeping).
7. Before opening a PR: check whether README needs updating (any user-visible behaviour changed?); check whether a new architectural judgment call was made (if yes, add a Decision Log entry to CLAUDE.md); check open issues and link the relevant one in the PR body.
8. Fill the PR template body explicitly — no placeholder text. The `Closes #` line must contain an issue number or be removed if no issue exists.

## Medications modelled
| Label | Drug | Dose | Phases |
|-------|------|------|--------|
| IR ½ | Methylphenidate IR | 5mg | Single phase, ka=2.0 |
| IR | Methylphenidate IR | 10mg | Single phase, ka=2.0 |
| CR | Methylphenidate CR | 20mg | **Fasted (default):** 20mg at 0h (ka=1.0). **Fed:** 10mg at 0h (ka=2.0) + 10mg at +4h (ka=0.7) |

## Decision Log

Judgment calls made during development. Add an entry whenever a non-obvious choice is made so future sessions do not re-litigate it.

| # | Decision | Rationale | PR / phase |
|---|----------|-----------|------------|
| 1 | Single-file architecture (`index.html` only) | Rejected frameworks and build tools. Zero build step; single file is auditable with no dependency surface. | Phase 1 |
| 2 | CR fasted ka=1.0 | Slower than pure IR (2.0) to reflect residual bead-matrix retardation; faster than fed delayed phase (0.7). Consistent with Haessler et al. 2008 "steady absorption / single Tmax" fasted profile. Population-average estimate, not a measured value. | #21 |
| 3 | `toggleFed()` direct DOM update, does not call `render()` | `render()` re-creates the pill card and kills the CSS `.2s` slide transition on the toggle thumb. Direct class toggles on `.fed-track`/`.fed-lbl`, then `renderChart()` + stats inline. | #27 |
| 4 | Graph window left edge anchors to midnight | Rolling window scrolls during the day and makes morning doses hard to read visually. Midnight anchor matches daily medication rhythm. | Phase 6 |
| 5 | "taken today" stat uses calendar day; PK curve uses rolling 24h | Two different questions: what have I taken since waking (calendar) vs current plasma estimate (rolling decay). Conflating them would make one of the two wrong. | Phase 6 |
| 6 | CR color `--cr: #9d7fd4` (lavender/violet) | Earlier warm orange (`#f5a050`, then `#b08860`) was too close to IR warm-brown at various screen brightness levels. Lavender gives clear hue separation from IR blue (`#5bb8f5`) and fed-toggle green (`--green`). `MEDS.CR.color` must always match `--cr`. | #33–34 |
| 7 | Dose buttons neutral (`--muted` border), no type color | Color lives on the graph and pill cards (output). Buttons are input; type-coloring them created visual double-encoding and made interaction/state colors (pressed, disabled) ambiguous. | #33–36 |
| 8 | `touch-action: manipulation` on `html, body` | Blocks iOS double-tap zoom globally without disabling pinch zoom or accessibility scaling. Alternative (`user-scalable=no` in viewport meta) disables all scaling. | #29 |
