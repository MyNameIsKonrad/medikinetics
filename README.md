# Medikinetics

A pharmacokinetic tracker for Medikinet IR and CR.

**Live:** [mynameiskonrad.github.io/medikinetics](https://mynameiskonrad.github.io/medikinetics/)

-----

## Dose types

|Label|Drug              |Dose|Window|Model                                                                                          |
|-----|------------------|----|------|-----------------------------------------------------------------------------------------------|
|IR ½ |Methylphenidate IR|5mg |4h    |Single phase, ka=2.0                                                                           |
|IR   |Methylphenidate IR|10mg|4h    |Single phase, ka=2.0                                                                           |
|CR   |Methylphenidate CR|20mg|6–8h  |**Fasted (default):** single phase 20mg, ka=1.0. **Fed:** 10mg at 0h (ka=2.0) + 10mg at +4h (ka=0.7). Toggle per dose on the pill card.|

-----

## Pharmacokinetic model

One-compartment oral absorption model tuned to published methylphenidate parameters.

**Parameters:**

- `KE = 0.347` — elimination rate constant, t½ ≈ 2.0h
- `KA = 2.0` — IR bead absorption rate, Tmax ~1.1h
- `KA = 0.7` — CR delayed bead absorption rate, Tmax ~2h after phase release

**CR formulation — fed:** Medikinet CR is a 50/50 bead formulation. The fed model represents this as two sequential phases: 10mg IR beads at hour 0 (ka=2.0) and 10mg enteric-coated delayed-release beads at hour +4 (ka=0.7), producing the intended biphasic plasma profile.

**CR formulation — fasted (default):** Without food, the enteric coating's programmed delay fails and the full dose front-loads into a single peak. The fasted model uses a single phase: 20mg, ka=1.0. ka=1.0 is a judgment call — slower than pure IR (2.0) to reflect residual bead-matrix retardation, faster than the fed delayed phase (0.7) — consistent with Haessler et al. 2008 reporting a “steady absorption / single Tmax” profile for Medikinet under fasted conditions. Each CR pill card defaults to fasted; tap the chip to switch to the fed model for that dose.

**Caveat:** Population-average model. Individual pharmacokinetics vary based on body weight, food intake, CES1 enzyme activity, and other factors. All curve output is labeled “model estimate.”

-----

## Features

- Live concentration curve, updates every 30 seconds
- Two stats: **taken today** (calendar-day mg sum) and **in system** (PK model estimate in mg-equivalent units — normalized to the IR reference, not plasma ng/mL)
- Rising indicator for the absorption phase post-dose
- Fed/fasted toggle per CR dose — fasted is the default; tap the ⇅ chip on the pill card to switch to the with-food biphasic model, updating the curve immediately
- Backdating via offset chips: now / -30m / -1h / -2h / -3h
- Custom time entry and chart scrubber chip — scrub the chart to a past time then log a dose at that exact moment
- Simulate future dose – scrub to a fiture time, tap the custom entry, and log a dose to see a temporary overlay
- Crosshair intersection dots on the concentration curve
- "Now" marker on the timeline
- Undo delete, 8-second window
- LocalStorage persistence, auto-purge after 48h
- Service worker for offline use and update-safe caching

-----

## Accessibility

Blue (`#5bb8f5`) for IR doses, orange (`#f5a050`) for CR — selected for deutan (red-green) color vision deficiency.

-----

## Self-hosting

Two files, no build step, no dependencies.

1. Fork or download this repo
1. Place `index.html` and `sw.js` in the root of a GitHub Pages repo
1. Enable GitHub Pages (Settings → Pages → Deploy from branch → main)
1. Open the URL in Safari on iOS → Share → Add to Home Screen

**Updating:** bump `VERSION` in `sw.js`, push both files, pull to refresh once in the app. LocalStorage data survives.

-----

## Stack

Vanilla JS and SVG. Google Fonts (DM Mono, Space Grotesk). No frameworks, no build tools, no backend.

-----

## Disclaimer

Not a medical device. Not medical advice. Consult a physician for dosing decisions.

Im hella serious about this, i dont know what im doing, in fact, look away and dont use this.
-----

## License

MIT.
