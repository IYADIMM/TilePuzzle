# Mobile Performance and Input Report

## Browser evidence

- Portrait pointer sampling passed at 360×640, 390×844, 430×932 and 768×1024.
- Legal face points selected the top visible tile; covered and side-sandwiched tiles rejected input.
- Rapid duplicate taps did not create ghost occupancy.
- Input recovered after pair clear, Undo, reload and revive.
- Correction sample: average 25.00 ms, p95 36.0 ms, maximum 36.4 ms over 85 measured frames in headless desktop Chrome.
- Expanded twelve-collection capture under concurrent QA load: 42 FPS, 23.97 ms average, 36.2 ms maximum, 125 loaded Phaser textures.
- The optimized premium runtime pack contains 87 WebPs totaling 5.40 MiB on disk: 72 icons, 12 material bodies, shared tile body, tray and button. Editable PNG masters remain outside the shipped runtime path.
- Final endurance run: 15.00 minutes, 71 complete levels and 2,631 genuine pointer selections with zero page/console errors.
- Frame pacing over 32,310 samples: 16.8 ms median, 50.0 ms p95, 50.1 ms p99, 133.4 ms maximum and 901 frames over 50 ms.
- Input acknowledgement over 2,631 selections: 70.21 ms median, 140.09 ms p95, 157.39 ms p99 and 216.31 ms maximum.
- Scene readiness over 72 starts: 287 ms median and 410 ms p95. A 20,019 ms cold/outlier maximum remains visible and is not hidden.
- Browser heap moved from 56,609,694 to 60,712,935 bytes with a 165,924,048-byte peak; texture count remained 125–129. This is stable enough for the desktop-browser gate but requires physical-device profiling.

Evidence: `qa/final-acceptance/interaction-report.json`, `qa/production-correction/browser-report.json`, `qa/production-visual-ux/browser-report.json`, and `qa/performance-soak/browser-soak-report.json`.

## Honest limitation

These measurements are desktop headless-Chromium emulation, not a physical Samsung Galaxy A-Series result. Android thermal behavior, GPU upload cost, touch latency, audio latency and memory pressure remain unverified. No adaptive graphics mode was introduced. Physical A-Series profiling is a release blocker.
