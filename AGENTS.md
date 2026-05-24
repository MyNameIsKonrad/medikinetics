# Medikinetics — Project Context

This file is the source of truth for all AI contributors. Read it fully before starting any work.

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
- Phase 9: isRising uses PK slope; clearing bar removed; CLAUDE.md added
- Phase 10: Bateman equal-rate limit fix (PR #19); fasted CR model (single phase 20mg ka=1.0, default); per-dose fed/fasted toggle chip on pill cards; GitHub Issues workflow established
- UX pass (PRs #23–#29): design tokens, Space Grotesk + DM Mono typography, interactive affordances, scale-transform press feedback (JS touchstart handler for iOS), undo toast drain bar, fed/fasted chip → toggle switch (direct DOM update in toggleFed for CSS transition), silent debounce → 400ms `.just-fired` disable, CR orange muted (#f5a050 → #b08860), double-tap zoom prevention
- Color clarification (PRs #33–#34): dose button borders → neutral --muted; fed toggle → --green; CR recolored to lavender (#9d7fd4); button sublabels simplified to "5mg" / "10mg" / "20mg"; dose buttons neutral (no type color — color lives on graph + cards only)
- Project hygiene (PR #37): PR template, issue templates, workflow rules, Decision Log, AGENTS.md as universal source of truth

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
2. Create a dedicated branch for each feature or fix — use `claude/<slug>` for Claude sessions, `codex/<slug>` for Codex sessions
3. Open a PR — do not merge yourself, wait for user approval
4. Never push directly to main
5. Never infer upcoming work from `README.md` — the README describes what is built, not what comes next. Ask the user what to do next.
6. Use conventional commit prefixes on every commit: `feat:` (new capability), `fix:` (bug), `docs:` (README/AGENTS.md only), `chore:` (refactor, rename, housekeeping).
7. Before opening a PR: check whether README needs updating (any user-visible behaviour changed?); check whether a new architectural judgment call was made (if yes, add a Decision Log entry to AGENTS.md); check open issues and link the relevant one in the PR body.
8. Fill the PR template body explicitly — no placeholder text. The `Closes #` line must contain an issue number or be removed if no issue exists.

## Multi-agent rules
This project accepts contributions from multiple AI agents (Claude: `claude/<slug>` branches, Codex: `codex/<slug>` branches). Rules for all AI contributors:
- All judgment calls go in the Decision Log in this file (`AGENTS.md`), regardless of which agent made the call
- Human is the gate for all PR merges — do not approve or merge another agent's PR
- Never infer what to work on next — ask the user

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
| 9 | `AGENTS.md` as universal source of truth; `CLAUDE.md` as thin pointer | AGENTS.md is the Linux Foundation AAIF universal standard (Dec 2025), backed by Anthropic, OpenAI, Google, Microsoft, and all major AI coding tools. All shared context lives here; CLAUDE.md defers to this file so any AI contributor reads the same authoritative context. | #37 |
| 10 | `CLEARING_THRESHOLD = 0.1` — 10% of totalMg is the "cleared" criterion | Pills remain visible and show a "clearing" state until plasma concentration drops below 10% of the total dose. 10% is a judgment call balancing meaningful residual effect vs. excessive tail visibility. Used in `pillIsVisible` and `pillCardBodyHTML`; must be kept as a single named constant so both sites stay in sync. | #40 |
| 11 | `RISING_LOOKAHEAD_MS = 5 * 60000` — 5-minute forward window for rising classification | The "↑ rising" label compares concentration now vs. 5 minutes ahead. 5 minutes is a judgment call: short enough to respond quickly after a dose, long enough to avoid toggling on noise near the peak plateau. Used in `render`, `toggleFed`, and `logRowHTML`; must be kept as a single named constant. | #40 |
| 12 | `hasFedToggle` data-driven from `MEDS[type].fastedPhases`, not hardcoded `'CR'` | Adding a new med type with a fasted profile no longer requires a parallel update to `hasFedToggle` or to `phasesFor`. The MEDS table is the single source of truth for which types have a fed mode; the helpers derive from it. | #50 |
| 13 | `UNDO_DURATION_MS` single source for both `setTimeout` and CSS `@keyframes drain` duration | The toast lifetime previously lived in two places (`animation: drain 8s` in CSS and `setTimeout(..., 8000)` in JS). Drift between them would have made the drain bar end visibly before/after the toast itself. JS constant feeds CSS via `style.setProperty('--undo-duration', ...)` at init. | #50 |
| 14 | Press-feedback timing stored in a `WeakMap`, not on the DOM element | `el._pressAt = Date.now()` pollutes the element's own-property namespace and ties the lifetime of the timing data to the element reference. WeakMap entries are GC'd automatically when the element is removed; the IIFE scope keeps the map private. | #50 |
| 15 | Animation timing tokens (`--t-base/.15s`, `--t-press/.08s`, `--t-toggle/.2s`, `--t-fill/.3s`) | All 14 `transition:` declarations previously used bare durations. Tokens make the interaction-feel a single-edit-point change. CSS custom properties work inside the `transition` shorthand in Safari 15.4+ (well within the iPhone target). | #51 |
| 16 | Color tint tokens (`--ir-tint`, `--ir-tint-sim`, `--green-tint`) and `MEDS.IR.color` for SVG curve | Inline `rgba()` literals scattered across CSS rules made tweaking opacity inconsistent. The SVG concentration curve previously had six `"#5bb8f5"` string literals; now derives from the same `MEDS.IR.color` that feeds pill cards and fills. CSS doesn't (yet) allow `var()` inside `rgba()` without `color-mix`, hence the explicit tint tokens. | #51 |
| 17 | Fed toggle is a `<button role="switch" aria-checked>`, not a `<div onclick>` | Native button semantics give keyboard operability (Space/Enter), correct screen-reader announcement ("fasted/food switch, checked/unchecked"), and `:focus-visible` styling for free. `toggleFed()` syncs `aria-checked` in its direct DOM update path so the attribute stays current without a full re-render (preserves Decision #3's slide-transition). | #52 |
| 18 | `buildCurve` single-slot memoization keyed on pill fingerprint + window | The 30-second render tick is the hot path; the same call repeats with identical inputs until a real mutation. Single-slot covers 100% of those. The simulation double-call uses different pill arrays and would miss any LRU policy below 4 entries — added complexity buys nothing measurable. Cache invalidates naturally on any pill/window change because the key encodes `id:type:takenAt:fed` for every pill. | #53 |
| 19 | `closestPoint` binary search replaces `data.reduce` in `showTooltip` | `chartData` is sorted ascending by `ts` (built left-to-right in `buildCurve`). Binary search is ~7 comparisons for the typical 144-point window. The boundary check (`lo > 0 && abs(lo-1) <= abs(lo)`) correctly resolves which of the two adjacent sample points is nearer to the scrub cursor. | #53 |
| 20 | SW non-navigation fetch caches successful responses on first use, fire-and-forget | Google Fonts CSS and WOFF2 URLs vary by User-Agent; install-time precaching would require either bundling the fonts or carefully replaying the Fonts API request. Cache-on-first-use covers the offline case after the first online visit with zero install-time complexity. `cache.put` is unawaited so the network response isn't delayed by the cache write. | #54 |
| 21 | Update banner triggers on version-string mismatch in client, not on a separate SW message type | The `VERSION` postMessage already fires on every `activate`. Comparing the previous `#version-label` text to the new version detects updates without adding a new message type. `prev && prev !== new` correctly avoids a false positive on the first activate (when `prev` is the static fallback that matches the new VERSION). | #54 |
| 22 | Self-hosted WOFF2 fonts; eliminated Google Fonts render-blocking link | The Google Fonts `<link rel="stylesheet">` was render-blocking on iOS Home Screen launches. The SW version bump clears all caches on every push, so fonts had to be re-fetched from `fonts.googleapis.com` after each update (two cross-origin TLS hops). Fix: three WOFF2 latin-subset files in `fonts/`, pre-cached during SW install. Space Grotesk 600 and 700 share one file (variable font). Supersedes the lazy-caching rationale in #20 — User-Agent URL variance no longer applies with self-hosted files. Relative `url('fonts/...')` paths in `@font-face` src (no leading slash) because the app is served at the `/medikinetics/` subpath on GitHub Pages. | ios-pwa-launch-perf |
