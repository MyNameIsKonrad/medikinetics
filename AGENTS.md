# Medikinetics — Project Context

This file is the source of truth for all AI contributors. Claude reads it through `CLAUDE.md`; Codex reads it directly. Read it in full before starting work, then read `ARCHITECTURE.md` (how the app works, its history, and the Decision Log) before changing anything it covers, so a change builds on decisions already logged instead of redoing or undoing them.

## What this is
A personal PWA for tracking methylphenidate pharmacokinetics. All app logic lives in `index.html`; `sw.js` is the service worker; `manifest.webmanifest`, `fonts/` and `icons/` are static assets. One-compartment oral absorption model (Bateman equation). No build step, no framework, no test suite.
Next to the model's curve, the owner logs how a dose is working (want more / good / too intense check-ins). A History section shows every stored day and, from the check-ins, how long a dose lasts. Export and import carry both.
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
- `MEDS` keys are storage keys. `loadPills` drops any stored dose whose `type` is not a `MEDS` key, and the next save makes the loss permanent, so keep every key exactly as it is, including when a med is retired.
- To retire a med, set `retired: true` and keep its key: it loses its dose button, and its history still loads. Only non-retired entries get buttons, in declaration order.
- Check-ins live in their own key, `medikinetics-feel-v1`, not in `medikinetics-v1`, where `loadPills` would drop them. `FEELS` keys are storage keys the same way: `loadFeels` drops a check-in whose `feel` isn't a key, so keep every feel key exactly as it is. To retire a feel, set `retired: true` and keep its key: it loses its button, its past check-ins still load and draw, and it stops counting in "how long it lasts".
- Import only adds: it skips anything already stored, anything with an unknown type or a future time, and leaves stored doses and check-ins as they are.
- All phase iteration goes through `phasesFor(pill)`, and every concentration goes through `phaseConcFor(ph, tH)` (bolus vs zero-order window). Every phase carries `durationHours` (display, window end, visibility); zero-order phases also carry `windowHours` (PK). CR pills store `fed: boolean` (default false).
- Med colors live in `MEDS.*.color`, and `MEDS.IR.color` is also the total-curve color. The `:root` tokens `--con: #e58fb8`, `--cr: #9d7fd4` and `--sym: #d4ad68` mirror the Concerta, `MEDS.CR` and `MEDS.SYMR20` colors for reference (no rule reads them); keep them matching.
- `toggleFed()` doesn't call `render()`, since a render would kill the toggle's slide transition (Decision #3).
- Named constants stay single-source, so a tuning change happens in one place: `CLEARING_THRESHOLD`, `RISING_LOOKAHEAD_MS`, `UNDO_DURATION_MS`, `KE`/`KA_REF`/`NORM`.
- No dose or check-in is in the future: `selectedTime` clamps both to now (Decision #38). History is kept forever, so leave `medikinetics-v1` and `medikinetics-feel-v1` unpruned.
- CI stamps `VERSION` in `sw.js` and `#version-label` in `index.html` on every push to `main`; leave both to CI rather than editing them by hand.
- The repo is public: keep personal health data out of it beyond the meds the app models.

## Workflow
1. Read `git log`, recent merged PRs and `ARCHITECTURE.md` to understand current state before starting
2. Work on a dedicated branch for each feature or fix, named `claude/<slug>` for Claude sessions and `codex/<slug>` for Codex sessions, so two agents' work stays separate and reviewable on its own.
3. Open a PR and leave the merge to the user, who approves it, since merging to `main` deploys to GitHub Pages.
4. Push to your branch rather than directly to `main`, for the same reason: `main` is the live app. The only exception is the CI version-stamp bot, which commits to `main` after every merge, so pull before branching.
5. Ask the user what to do next rather than inferring upcoming work from `README.md`; the README describes what is built, not what comes next.
6. Start each commit with a conventional prefix, so the history shows the kind of change at a glance: `feat:` (new capability), `fix:` (bug), `docs:` (README/AGENTS.md/ARCHITECTURE.md only), `chore:` (refactor, rename, housekeeping).
7. Before opening a PR, run three checks so the docs and issues stay in step with the code: whether README needs updating (any user-visible behavior changed?); whether a new architectural judgment call was made (if yes, add a Decision Log row to `ARCHITECTURE.md`, and update its sections if the architecture changed); and which open issue the work relates to, so the PR body can link it.
8. In the PR body, say what changed, why, and how it was tested (on iPhone Safari where it matters), in real words rather than placeholder text, since the user decides on the merge from that description. Include a `Closes #N` line only when an issue exists.

## Multi-agent rules
This project accepts contributions from multiple AI agents (Claude: `claude/<slug>` branches, Codex: `codex/<slug>` branches). For all AI contributors:
- All judgment calls go in the Decision Log in `ARCHITECTURE.md`, regardless of which agent made the call, so every agent reads the same record of why things are as they are
- The human is the gate for all PR merges, so leave approving and merging another agent's PR to them
- For what to work on next, ask the user (workflow step 5)
