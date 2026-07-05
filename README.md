# Medikinetics

A personal pharmacokinetic tracker for Medikinet IR and CR.

I use this to take my meds responsibly. Stay aware of my daily intake – just basic enough to not avoid logging doses. More importantly – to visualise stacking doses – which affects how I feel but too abstract to be my mental math.

I enjoy this project because it introduces me to basic development concepts and the feelings. Learning with tools like Claude Code allows me pick my own battles and participate as a real useful thing comes together. I expect this project reveals a ton of poor judgment which i will understand someday.

**Live:** [mynameiskonrad.github.io/medikinetics](https://mynameiskonrad.github.io/medikinetics/)

## Dose types

| Label | Drug | Dose | Window |
| --- | --- | --- | --- |
| IR ½ | Methylphenidate IR | 5mg | 4h |
| IR | Methylphenidate IR | 10mg | 4h |
| CR | Methylphenidate CR | 20mg | 8h (50/50 bead, modeled in two phases) |

## Model

One-compartment oral absorption tuned to published methylphenidate parameter – constants are written at the top of `index.html`. 

Output is "model estimate" everywhere — individual PK varies with weight, food, activity, etc.

This represents how it is on average. As a diabetic, I'm likely absorbing faster – self-reported experiences like that aren't modeled.

## Install

The two important files (`index.html`, `sw.js`) are hosted in this GitHub Pages repo.

I use it as a home screen PWA, it uses local storage and works offline which is dope. Dose history is kept forever now, and there's an export json button at the bottom — so losing data would take actual effort instead of one Safari cleanup.

## Disclaimer

Not a medical device. Not medical advice. Consult a physician for dosing decisions. I mean it.
