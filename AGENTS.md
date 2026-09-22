# Medikinetics — Project Context

This file is the source of truth for all AI contributors. Claude reads it through `CLAUDE.md`; Codex reads it directly. Read it fully before starting any work, then read `ARCHITECTURE.md` (how the app works, its history, and the Decision Log) before changing anything it covers.

## What this is
A personal PWA for tracking methylphenidate pharmacokinetics. All app logic lives in `index.html`; `sw.js` is the service worker; `manifest.webmanifest`, `fonts/` and `icons/` are static assets. One-compartment oral absorption model (Bateman equation). No build step, no framework, no test suite.
Next to the model's curve, the owner logs how a dose feels (on / fading / off check-ins). A History section shows every stored day and, from the check-ins, how long a dose lasts. Export and import carry both.
Deployed on GitHub Pages from `main` (the repo is public); test target is Safari on iPhone, installed to the home screen.
Run locally with `python3 -m http.server 8642` from the repo root (`.claude/launch.json` has this config). The service worker needs http(s), not `file://`.

## Medications modelled
| Button | Drug | Dose | Phases |
|-------|------|------|--------|
| Concerta · 72mg / 36mg / 18mg (`CON72`/`CON36`/`CON18`) | Methylphenidate OROS (Concerta; generic Atenza fits the same model) | 72 / 36 / 18mg | 22% bolus at 0h, then zero-order release windows: 20% over 1–4h, 36% over 4–7h, 22% over 7–12h; all ka=2.0; no food mode |

Retired — no button, kept in `MEDS` so past doses still load and render:
| Key | Drug | Dose | Phases |
|-----|------|------|--------|
| `IRH` / `IR` | Methylphenidate IR | 5 / 10mg | Single phase, ka=2.0 |
| `CR` | Methylphenidate CR (Medikinet) | 20mg | **Fasted (default):** 20mg at 0h (ka=1.0). **Fed:** 10mg at 0h (ka=2.0) + 10mg at +4h (ka=0.7) |
| `SYMR20` | Methylphenidate MR (Symkinet) | 20mg | 10mg at 0h (ka=2.0) + 10mg at +4h (ka=0.7); no food-specific mode |

Shared constants: `KE=0.347` for every med; `NORM` makes "mg eq" IR-peak-equivalent (see `ARCHITECTURE.md` → PK model).

## Invariants and conventions
- All app logic and styles stay in `index.html`; only `sw.js`, the manifest, `fonts/` and `icons/` ship alongside (Decision #1).
- `MEDS` keys are storage keys. `loadPills` drops any stored dose whose `type` is not a `MEDS` key, and the next save makes the loss permanent. Never remove or rename a key. (verified: `loadPills`, 2026-09-22)
- To retire a med, set `retired: true` and keep its key: it loses its dose button, and its history still loads. Only non-retired entries get buttons, in declaration order.
- Check-ins live in their own key, `medikinetics-feel-v1`, never in `medikinetics-v1` (`loadPills` would drop them). `FEELS` keys are storage keys the same way: `loadFeels` drops a check-in whose `feel` is not a key, so never remove or rename one.
- Import only adds. It skips anything already stored, anything with an unknown type or a future time, and never changes or removes a stored dose or check-in.
- All phase iteration goes through `phasesFor(pill)`, and every concentration goes through `phaseConcFor(ph, tH)` (bolus vs zero-order window). Every phase carries `durationHours` (display, window end, visibility); zero-order phases also carry `windowHours` (PK). CR pills store `fed: boolean` (default false).
- Med colors live in `MEDS.*.color`, and `MEDS.IR.color` is also the total-curve color. The `:root` tokens `--con: #e58fb8`, `--cr: #9d7fd4` and `--sym: #d4ad68` mirror the Concerta, `MEDS.CR` and `MEDS.SYMR20` colors for reference (no rule reads them) — keep them matching.
- `toggleFed()` never calls `render()` — it would kill the toggle's slide transition (Decision #3).
- Named constants stay single-source: `CLEARING_THRESHOLD`, `RISING_LOOKAHEAD_MS`, `UNDO_DURATION_MS`, `KE`/`KA_REF`/`NORM`.
- No dose or check-in is ever in the future: `selectedTime` clamps both to now (Decision #38). History is kept forever; never prune `medikinetics-v1` or `medikinetics-feel-v1`.
- `VERSION` in `sw.js` and `#version-label` in `index.html` are stamped by CI on every push to `main`. Never hand-edit them.
- The repo is public: no personal health data beyond the meds the app models.

## Workflow — follow exactly
1. Read `git log`, recent merged PRs and `ARCHITECTURE.md` to understand current state before starting
2. Create a dedicated branch for each feature or fix — use `claude/<slug>` for Claude sessions, `codex/<slug>` for Codex sessions
3. Open a PR — do not merge yourself, wait for user approval
4. Never push directly to main. The only exception is the CI version-stamp bot, which commits to `main` after every merge — pull before branching.
5. Never infer upcoming work from `README.md` — the README describes what is built, not what comes next. Ask the user what to do next.
6. Use conventional commit prefixes on every commit: `feat:` (new capability), `fix:` (bug), `docs:` (README/AGENTS.md/ARCHITECTURE.md only), `chore:` (refactor, rename, housekeeping).
7. Before opening a PR: check whether README needs updating (any user-visible behavior changed?); check whether a new architectural judgment call was made (if yes, add a Decision Log row to `ARCHITECTURE.md`, and update its sections if the architecture changed); check open issues and link the relevant one in the PR body.
8. Write the PR body explicitly — what changed, why, and how it was tested (on iPhone Safari where it matters). No placeholder text. Include a `Closes #N` line only when an issue exists.

## Multi-agent rules
This project accepts contributions from multiple AI agents (Claude: `claude/<slug>` branches, Codex: `codex/<slug>` branches). Rules for all AI contributors:
- All judgment calls go in the Decision Log in `ARCHITECTURE.md`, regardless of which agent made the call
- Human is the gate for all PR merges — do not approve or merge another agent's PR
- Never infer what to work on next — ask the user
