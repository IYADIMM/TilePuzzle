# Main QA Fixes — Performance

## Interaction timing

- Real browser pointer-to-accepted-state samples ranged from 34.05–90.55 ms across acceptance reruns; the final sample remained below the 100 ms feedback target.
- Tile-to-tray flight: 260 ms, reduced from 390 ms.
- Pair convergence: 80 ms, reduced from 125 ms.
- Pair fade: 135 ms, reduced from 220 ms.
- Tray compaction: 135 ms, reduced from 260 ms.
- Authoritative selection and pair removal still commit before animation begins.

## Browser samples

- Checkpoint/revive run: 85 sampled frames, 18.43 ms average, 33.3 ms p95, 33.4 ms max.
- Final 15-minute soak: 112 completed levels, 4,111 pointer events, 46,458 frame samples, 16.7 ms median, 33.3 ms p95, 33.5 ms p99, 99.2 ms max, and 15 frames over 50 ms.
- Soak input acknowledgement: 20.36 ms median, 78.98 ms p95, 98.91 ms p99, 152.29 ms max.
- Scene readiness across 113 scene starts: 159 ms median, 213 ms p95; one cold/outlier start reached 7,956 ms.
- JS heap began at 67,451,720 bytes, ended at 60,319,856 bytes, and peaked at 176,038,026 bytes. Texture count remained 125–129. No browser errors were recorded.
- Full machine-readable result: `qa/performance-soak/browser-soak-report.json`.

No adaptive quality tiers were added. Routine camera shake was removed. Shuffle animations use transform/opacity work on detached icon proxies, and reduced-motion uses a short fade path.

Physical Android thermals, GPU frame pacing, and battery consumption remain unverified without a connected device.
