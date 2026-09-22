# Medikinetics

A personal pharmacokinetic tracker for Concerta (earlier doses of Medikinet IR/CR and Symkinet MR stay in the history).

I use this to take my meds responsibly. Stay aware of my daily intake – just basic enough to not avoid logging doses. More importantly – to visualise stacking doses – which affects how I feel but too abstract to be my mental math.

I enjoy this project because it introduces me to basic development concepts and the feelings. Learning with tools like Claude Code allows me pick my own battles and participate as a real useful thing comes together. I expect this project reveals a ton of poor judgment which i will understand someday.

**Live:** [mynameiskonrad.github.io/medikinetics](https://mynameiskonrad.github.io/medikinetics/)

## Dose types

| Label | Drug | Dose | Window |
| --- | --- | --- | --- |
| Concerta | Methylphenidate OROS | 72 / 36 / 18mg | 12h (about a fifth at once, the rest released steadily, peaking around 7h) |
| IR | Methylphenidate IR | 5mg | 4h |
| IR | Methylphenidate IR | 10mg | 4h |
| CR | Methylphenidate CR | 20mg | 6h fasted (default, single phase) · 8h with the food toggle on (50/50 bead, modeled in two phases) |
| Symkinet MR | Methylphenidate MR | 20mg | 8h (50/50; second release at ~4h) |

## How it feels

Under the dose buttons, three chips log how a dose feels: **on**, **fading**, **off**. They use the same time row as the doses, so "-1h, then fading" logs it an hour back. Each one shows as a mark on the curve (filled, half, hollow), in the 24h log with its time after the dose, and in History. They're optional; nothing asks for them.

## History

Below the log: every day, newest first. Each day has the model's curve on the same 00–24 axis, its doses and its check-ins, and runs of empty days fold into one line. Once there are check-ins, a table on top shows how long it lasts: the median time from the dose to on, fading and off, one row per daily dose (72 mg, 90 mg, …).

## Model

One-compartment oral absorption tuned to published methylphenidate parameter – constants are written at the top of the script in `index.html`. 

Output is "model estimate" everywhere — individual PK varies with weight, food, activity, etc.

This represents how it is on average. As a diabetic, I'm likely absorbing faster – self-reported experiences like that aren't modeled.

## Install

The two important files (`index.html`, `sw.js`) are hosted in this GitHub Pages repo, next to the manifest, fonts and icons they load.

I use it as a home screen PWA, it uses local storage and works offline which is dope. Dose history is kept forever now, and there's an export json button at the bottom — so losing data would take actual effort instead of one Safari cleanup.

Import takes an export file back in. It only adds what isn't already stored, so importing the same file twice changes nothing.

## Disclaimer

Not a medical device. Not medical advice. Consult a physician for dosing decisions. I mean it.
