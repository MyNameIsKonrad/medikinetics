# Medikinetics

A pharmacokinetic tracker for Medikinet IR and CR.

**Live:** [mynameiskonrad.github.io/medikinetics](https://mynameiskonrad.github.io/medikinetics/)

-----

## Dose types

|Label|Drug              |Dose|Window|Model                                                |
|-----|------------------|----|------|-----------------------------------------------------|
|IR ½ |Methylphenidate IR|5mg |4h    |Single phase, ka=2.0                                 |
|IR   |Methylphenidate IR|10mg|4h    |Single phase, ka=2.0                                 |
|CR   |Methylphenidate CR|20mg|8h    |Two phases: 10mg at 0h (ka=2.0), 10mg at +4h (ka=0.7)|

-----

## Pharmacokinetic model

One-compartment oral absorption model tuned to published methylphenidate parameters.

**Parameters:**

- `KE = 0.347` — elimination rate constant, t½ ≈ 2.0h
- `KA = 2.0` — IR bead absorption rate, Tmax ~1.1h
- `KA = 0.7` — CR delayed bead absorption rate, Tmax ~2h after phase release

**CR formulation:** Medikinet CR is a 50/50 bead formulation. The model represents this as two sequential phases: 10mg IR beads at hour 0 (ka=2.0) and 10mg coated delayed-release beads at hour +4 (ka=0.7). A single normalization factor calibrated to the IR reference rate means slower-absorbing phases naturally peak lower and broader — consistent with published Medikinet CR plasma profiles.

**Caveat:** Population-average model. Individual pharmacokinetics vary based on body weight, food intake, CES1 enzyme activity, and other factors. All curve output is labeled “model estimate.”

-----

## Features

- Live concentration curve, updates every 30 seconds
- Two stats: **taken today** (mg sum) and **in system** (PK model value at current time)
- Rising indicator for the absorption phase immediately post-dose
- Backdating via offset chips: now / -30m / -1h / -2h / -3h / -6h
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

## Planned

- Fixed daily timeline window (6am–midnight)
- “Now” marker centered on timeline
- Crosshair intersection dots
- Time-cursor: scrub to a point, simulate or log a dose there
- Custom backdate input

-----

## Stack

Vanilla JS and SVG. Google Fonts (DM Mono, Space Grotesk). No frameworks, no build tools, no backend.

-----

## Disclaimer

Not a medical device. Not medical advice. Consult a physician for dosing decisions.

-----

## License

MIT.
