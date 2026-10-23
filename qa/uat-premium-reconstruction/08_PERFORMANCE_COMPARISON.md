# Performance comparison

## Current two-minute mobile-viewport browser soak

- 18 completed levels, 648 genuine pointer events, 6,536 frame samples.
- Frame median 16.70 ms; p95 17.10 ms; p99 33.40 ms.
- 13 frames over 50 ms; worst frame 216.70 ms.
- Input acknowledgement median 4.04 ms; p95 65.54 ms; p99 114.24 ms.
- Heap: 46.82 MB start, 69.57 MB end, 73.17 MB peak.
- Texture count stable at 200–201; display objects stable at 23–24.
- Zero captured browser errors.

## Previous 15.1-minute benchmark

Previous recorded values were frame median 16.7 ms, p95 33.3 ms, p99 33.5 ms, max 449.9 ms, 42 frames over 50 ms; input median 13.59 ms, p95 80.08 ms, p99 105.85 ms; peak heap 188.59 MB.

The shorter current run is not a duration-equivalent claim, but it shows lower p95 frame time, lower median input time, lower peak heap and a lower worst frame. Scene-ready p95/max was 6,351 ms due to an isolated load transition and remains a profiling target. Physical Android performance is PENDING.
