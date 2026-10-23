# Mobile Performance and Input Report

## Browser evidence

- Portrait pointer sampling passed at 360×640, 390×844, 430×932 and 768×1024.
- Legal face points selected the top visible tile; covered and side-sandwiched tiles rejected input.
- Rapid duplicate taps did not create ghost occupancy.
- Input recovered after pair clear, Undo, reload and revive.
- Correction sample: average 17.45 ms, p95 16.9 ms, maximum 33.4 ms over 85 measured frames in headless desktop Chrome.
- Broader Phase 2 capture under concurrent QA load: 43 FPS, 23.1 ms average, 33.4 ms maximum.

Evidence: `qa/final-acceptance/interaction-report.json`, `qa/production-correction/browser-report.json`, and `qa/production-visual-ux/browser-report.json`.

## Honest limitation

These measurements are desktop headless-Chromium emulation, not a physical Samsung Galaxy A-Series result. Android thermal behavior, GPU upload cost, touch latency, audio latency and memory pressure remain unverified. No adaptive graphics mode was introduced. Physical A-Series profiling is a release blocker.
