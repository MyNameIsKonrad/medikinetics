# Medikinetics — Project Context

This file is the source of truth for all AI contributors. Claude reads it through `CLAUDE.md`; Codex reads it directly. Read it fully before starting any work, then read `ARCHITECTURE.md` (how the app works, its history, and the Decision Log) before changing anything it covers.

## What this is
A personal PWA for tracking methylphenidate pharmacokinetics. All app logic lives in `index.html`; `sw.js` is the service worker; `manifest.webmanifest`, `fonts/` and `icons/` are static assets. One-compartment oral absorption model (Bateman equation). No build step, no framework, no test suite.
Deployed on GitHub Pages from `main` (the repo is public); test target is Safari on iPhone, installed to the home screen.
Run locally with `python3 -m http.server 8642` from the repo root (`.claude/launch.json` has this config). The service worker needs http(s), not `file://`.

## Medications modelled
| Button | Drug | Dose | Phases |
|-------|------|------|--------|
| IR · 5mg | Methylphenidate IR | 5mg | Single phase, ka=2.0 |
| IR · 10mg | Methylphenidate IR | 10mg | Single phase, ka=2.0 |
| CR · 20mg | Methylphenidate CR | 20mg | **Fasted (default):** 20mg at 0h (ka=1.0). **Fed:** 10mg at 0h (ka=2.0) + 10mg at +4h (ka=0.7) |
| Symkinet MR · 20mg | Methylphenidate MR | 20mg | 10mg at 0h (ka=2.0) + 10mg at +4h (ka=0.7); no food-specific mode |

Shared constants: `KE=0.347` for every med; `NORM` makes "mg eq" IR-peak-equivalent (see `ARCHITECTURE.md` → PK model).

## Invariants and conventions
- All app logic and styles stay in `index.html`; only `sw.js`, the manifest, `fonts/` and `icons/` ship alongside (Decision #1).
- `MEDS` keys are storage keys. `loadPills` drops any stored dose whose `type` is not a `MEDS` key, and the next save makes the loss permanent. Never remove or rename a key. (verified: `loadPills`, 2026-09-22)
- Today every `MEDS` entry gets a dose button, in declaration order. To retire a med, hide its button and keep its key. (verified: dose-grid build in `render()`, 2026-09-22)
- All phase iteration goes through `phasesFor(pill)`. CR pills store `fed: boolean` (default false).
- Med colors live in `MEDS.*.color`, and `MEDS.IR.color` is also the total-curve color. The `:root` tokens `--cr: #9d7fd4` and `--sym: #d4ad68` mirror `MEDS.CR.color` / `MEDS.SYMR20.color` for reference (no rule reads them) — keep them matching.
- `toggleFed()` never calls `render()` — it would kill the toggle's slide transition (Decision #3).
- Named constants stay single-source: `CLEARING_THRESHOLD`, `RISING_LOOKAHEAD_MS`, `UNDO_DURATION_MS`, `KE`/`KA_REF`/`NORM`.
- Previews (`simulatedPills`) are ephemeral and never saved. Dose history is kept forever; never prune `medikinetics-v1`.
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
