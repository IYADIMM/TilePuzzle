# Evidence-based gap matrix

| Area | Before this branch | Implemented result | Evidence | Status |
|---|---|---|---|---|
| Tile styles | Illustrated collections only | Illustrated Garden plus original Classic Mahjong | `dual-style-browser-report.json` and screenshots | PASS |
| Style selection | No player-facing selector | Gallery from menu/settings/pause, saved selection | Live gallery and switch capture | PASS |
| Logic parity | Risk of art identity changing match rules | Visual resolver leaves `typeId`, seeds and solutions unchanged | 81 unit tests; style identity tests | PASS |
| In-progress switching | Not available | Board and occupied tray repaint atomically without resetting score/state | `live-switch-with-tray-classic-390x844.png` | PASS |
| Input response | Pointer-up acknowledgement | Pointer-down board routing with full rendered-body hit bounds | interaction and dual-style reports | PASS |
| Hit targeting | Previous QA could misclassify occlusion | QA now distinguishes visible face points and topmost blocked routing | interaction report | PASS |
| Shuffle clarity | Existing symbol reassignment | Visible proxy redistribution retained for both skins | classic shuffle frame | PASS |
| Tray fit | Previously corrected | Four recessed slots and scaled full bodies preserved | unit/visual QA | PASS |
| 1,000 levels | Existing deterministic set | Same set, identities and solutions under both styles | 1,000-level validator | PASS |
| REA investigation | Requested | ADB/device/APKs unavailable | report 00 | BLOCKED |
| Android performance | Requested | Desktop Chromium soak only | performance report | BLOCKED |
| Visual approval | Required from owner | Runtime evidence prepared; no approval claimed | comparison screenshots | PENDING USER REVIEW |
