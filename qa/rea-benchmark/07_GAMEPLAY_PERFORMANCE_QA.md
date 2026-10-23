# Gameplay and performance QA

## Full acceptance

- Unit tests: 81/81 passed.
- Production build: passed; 1,363.96 kB JS / 384.53 kB gzip, with Vite's >500 kB warning.
- Generated levels: 1,000/1,000 solver-verified and grid-aligned.
- Genuine pointer completion: 36/36 board selections, no state mutation shortcut.
- Four-slot tray, atomic pair clearing, Undo, checkpoint reload, revive, progression, audio, leaderboard, premium raster and responsive suites: passed.
- Dual-style browser QA: both styles passed at four portrait sizes; live switching preserved the occupied tray, remaining count and score.

## 15-minute desktop Chromium soak

| Metric | Parent baseline | Dual-style branch | Change |
|---|---:|---:|---:|
| Completed levels | 112 | 120 | +7.1% |
| Pointer events | 4,111 | 4,400 | +7.0% |
| Frame median / p95 / p99 | 16.7 / 33.3 / 33.5 ms | 16.7 / 33.3 / 33.5 ms | unchanged |
| Frame maximum | 99.2 ms | 449.9 ms | worse outlier |
| Frames >50 ms | 15 | 42 | worse |
| Input median | 20.36 ms | 13.59 ms | 6.77 ms faster |
| Input p95 / p99 | 78.98 / 98.91 ms | 80.08 / 105.85 ms | slightly worse tail |
| Scene-ready median / p95 | 159 / 213 ms | 146 / 258 ms | median better, tail worse |
| Heap start / end / peak | 67.45 / 60.32 / 176.04 MB | 55.58 / 65.00 / 188.59 MB | higher end/peak |
| Texture count | 125–129 | 200–201 | expected 72-style-asset increase, stable |

The soak completed 15.1 minutes with zero page errors. Stable texture/display-object ranges provide no evidence of per-level object growth, but the worse worst-case frame and memory peak remain optimization targets. These are desktop headless measurements, not physical Android results.
