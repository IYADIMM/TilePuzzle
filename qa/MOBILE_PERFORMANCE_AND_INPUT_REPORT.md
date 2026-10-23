# Mobile Performance and Input Report

## Browser evidence

- Portrait pointer sampling passed at 360×640, 390×844, 430×932 and 768×1024.
- Legal face points selected the top visible tile; covered and side-sandwiched tiles rejected input.
- Rapid duplicate taps did not create ghost occupancy.
- Input recovered after pair clear, Undo, reload and revive.
- Correction sample: average 25.00 ms, p95 36.0 ms, maximum 36.4 ms over 85 measured frames in headless desktop Chrome.
- Expanded twelve-collection capture under concurrent QA load: 42 FPS, 23.97 ms average, 36.2 ms maximum, 125 loaded Phaser textures.
- The optimized premium runtime pack contains 87 WebPs totaling 5.40 MiB on disk: 72 icons, 12 material bodies, shared tile body, tray and button. Editable PNG masters remain outside the shipped runtime path.

Evidence: `qa/final-acceptance/interaction-report.json`, `qa/production-correction/browser-report.json`, and `qa/production-visual-ux/browser-report.json`.

## Honest limitation

These measurements are desktop headless-Chromium emulation, not a physical Samsung Galaxy A-Series result. Android thermal behavior, GPU upload cost, touch latency, audio latency and memory pressure remain unverified. No adaptive graphics mode was introduced. Physical A-Series profiling is a release blocker.
