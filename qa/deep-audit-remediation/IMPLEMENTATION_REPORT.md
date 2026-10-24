# Jade Garden Tiles — Deep Audit Remediation Report

Date: 24 October 2026

Branch: `codex/deep-audit-remediation-2026-10-24`

Base: `f52b6a0631ee5d9bcef9213ac10151922ebd9cc0`

Scope: remediation of the independent audit dated 24 October 2026. No push or merge was performed.

## Outcome

The blocking persistence, generator-integrity, hint, pause-time, product-truthfulness, and several performance findings were corrected without replacing the existing Match-2/four-slot reducer, Mahjong accessibility rules, dual tile styles, approved audio, progression, or 1,000-level campaign. The game is not declared launch-ready: visual acceptance remains with the user, physical Android/audio-output testing was not performed, and the remaining performance/progression work is listed below.

## Finding-by-finding status

| Finding | Status | Implemented evidence or remaining work |
|---|---|---|
| F01 Undo checkpoint | Fixed | Undo now commits one coherent board/tray/history/score/inventory checkpoint. Browser reload restored the exact 36-tile board, empty tray, empty history, and inventory `2`. Save failure rolls the action back. |
| F02 Shuffle checkpoint | Fixed | Validated symbol assignment and inventory are saved atomically; reload retained the exact tile-ID mapping and inventory `2`. Animation cleanup is protected with `finally`. |
| F03 silhouette fallback | Fixed | Unrestricted fill and arbitrary live fallback were removed. Generation rejects invalid masks and uses capacity-aware shape scoring. |
| F04 cosmetic truthfulness | Fixed for current scope | Nonfunctional cosmetic SKUs are hidden; only functional boosters remain purchasable. Existing entitlements are preserved. |
| F05 Hint correctness | Fixed | Hint uses a verified immediate continuation (`sequence[0]`) or a validated known solution, never an arbitrary later solver move. No valid hint means no charge. |
| F06 pause time | Fixed | A monotonic active-play clock excludes pause/modal/background time and is checkpointed. A 1.4 s pause added only 17.6 ms in browser evidence. |
| F07 release gates | Fixed | `qa:acceptance` includes dual-style and premium UAT gates; `qa:release` adds soak. Android remains a separately named manual gate. |
| F08 match allocations | Improved | Match particle emitters are preallocated and reused. Small ring/text objects remain bounded per match. |
| F09 main-thread solver | Partial | Known valid continuations avoid unnecessary search. The fallback DFS is still synchronous; worker/time-sliced search remains required for worst-case device proof. |
| F10 eager art loading | Deferred | Both complete styles still preload. Production boot no longer generates procedural art, but style/chapter lazy loading and GPU residency measurements remain. |
| F11 shuffle proxies | Improved | Proxy cleanup is guaranteed on success, cancellation, and scene shutdown. Proxy pooling/batching remains future optimization. |
| F12 false best copy | Fixed | Progression computes truthful `isNewBestScore`, `isNewBestTime`, and `newStars` before mutation; inferior replay no longer claims a best. |
| F13 Classic reward art | Fixed | Completion reward resolves the active style and uses Classic assets in Classic mode. Browser evidence found three Classic and zero Illustrated reward symbols. |
| F14 difficulty plateau | Measured, deferred | Validator reports the plateau explicitly: 976 levels are declared difficulty 5. A versioned campaign rebalance requires product/playtest approval. |
| F15 weak level validation | Fixed for structural proof | Validator now checks 1,000 SHA-256 board fingerprints, mask adherence, fallback count, solver result, and difficulty distribution. Result: 1,000 unique, zero fallback, zero failures. Enjoyment still needs human playtesting. |
| F16 silent invalid fallback | Fixed | Invalid generation fails visibly after bounded attempts; no arbitrary unvalidated board is returned. |
| F17 economy IDs/idempotency | Fixed for mock economy | Collision-resistant operation IDs, duplicate-payload consistency checks, transactional rollback, and explicit mock-only behavior. No real-money work added. |
| F18 clock rollback rewards | Improved | Offline claims reject dates older than the last legitimate claim. Trusted time still requires a future server and is not claimed. |
| F19 ignored save failures | Substantially fixed | Save verifies readback. Selection, Undo, Shuffle, style, shop, win, and Revive high-value paths roll back or surface failure. A future centralized service should absorb remaining low-value menu writes. |
| F20 boot-time generation | Fixed except F10 | Felt is prebaked as WebP; production directly loads authored raster materials/icons and no longer generates procedural material/SVG fallbacks. |
| F21 standalone styles route | Fixed | `?screen=styles` starts over a guaranteed Menu host and safely returns to Menu. Browser route test passed. |
| F22 fake ranks/debug route | Fixed | Simulated rivals/podium rewards were removed. Leaderboard now shows truthful local records only with no fabricated rank; icon sheet is development-only. |
| F23 compiled art fallback | Fixed in production graph | Authored coverage is mandatory. `TileMaterialFactory` and `SvgIconLibrary` remain as isolated source/dev utilities but have no production imports. |
| F24 restore presentation | Fixed | Restore rebuilds board/tray presentation, clears pending animation state, and reapplies tray membership deterministically. |
| F25 reward skin consistency | Fixed for completion flow | Reward previews use the saved active tile style. Broader thematic collection art remains intentionally Illustrated outside gameplay-adjacent Classic rewards. |
| F26 hardware accessibility | Partial | Responsive pointer tests passed at 360×640, 390×844, 430×932, and 768×1024. Screen readers, cutouts, high-refresh touch, and physical Samsung devices remain unverified. |
| F27 compressed coupling | Partial | Transaction clock/checkpoint logic moved into focused modules. Large scene modules still merit incremental refactoring after release gates stabilize. |
| F28 repository weight | Partial | This commit adds one optimized felt and one canonical evidence set; it does not delete approved source masters. Historic QA/source-art consolidation remains a separate, reviewable task. |
| F29 incomparable performance | Partial | A repeatable two-minute headless soak was run. Equivalent 15–20 minute physical A-Series baselines remain required. |
| F30 retention proof | Deferred | Technical solvability and uniqueness are proven, not long-term enjoyment. Chapter pacing, milestone variety, and playtest telemetry remain product work. |

## Changed implementation files

### Runtime

- `src/logic/ActivePlayClock.js`
- `src/logic/AttemptCheckpoint.js`
- `src/logic/BoardActions.js`
- `src/logic/GameRules.js`
- `src/logic/LeaderboardRules.js`
- `src/logic/LevelGenerator.js`
- `src/game/BoardManager.js`
- `src/game/Tile.js`
- `src/scenes/BootScene.js`
- `src/scenes/GameScene.js`
- `src/scenes/IconSheetScene.js`
- `src/scenes/RewardScene.js`
- `src/scenes/ShopScene.js`
- `src/scenes/TileStyleGalleryScene.js`
- `src/systems/LeaderboardManager.js`
- `src/systems/ProgressionManager.js`
- `src/systems/SaveManager.js`
- `src/economy/DailyRewardService.js`
- `src/economy/WalletLedger.js`
- `src/art/AssetFactory.js`
- `src/main.js`
- `public/assets/premium/premium-felt.webp`

### Tests and QA tooling

- `tests/deep-audit-remediation.test.js`
- `tests/leaderboard.test.js`
- `scripts/deep-audit-qa.mjs`
- `scripts/generate-premium-felt.mjs`
- `scripts/validate-1000-levels.mjs`
- `scripts/gameplay-qa.mjs`
- `scripts/interaction-qa.mjs`
- `scripts/performance-soak-qa.mjs`
- `scripts/premium-art-qa.mjs`
- `scripts/production-correction-qa.mjs`
- `scripts/rea-dual-style-qa.mjs`
- `package.json`

## Verification results

| Gate | Result |
|---|---|
| Unit/regression suite | 92/92 passed |
| Production build | Passed; 1,343.10 kB raw / 376.37 kB gzip; Vite still warns above 500 kB |
| 1,000-level generator | Generation v4: 1,000/1,000 unique; 0 duplicate, 0 fallback, 0 mask/solver failure; eight stratified boards also passed independent search |
| Deep-audit browser QA | Passed 80 ms early tap, Undo reload, Shuffle reload, pause clock, Classic reward, standalone styles, and fractional route normalization |
| Genuine interaction QA | Passed visible face, expanded edges, blocked rejection, and four viewport sizes |
| Genuine gameplay QA | Passed duplicate-tap rejection, atomic pair clear, visual/logical sync, Undo |
| Genuine full victory | Passed 36 real pointer actions; forced victory rejected |
| Dual-style QA | Passed both styles at four viewport sizes, live switch, pair clear, Shuffle charge |
| Premium UAT geometry | 32/32 style/tray/viewport cases passed |
| Audio browser QA | Passed browser synchronization; no physical speaker/device claim |
| Premium art runtime QA | 12 collections had complete body/icon runtime coverage; visual approval remains pending |
| Two-minute soak | 16 levels, 597 pointer events, 6,707 frames; median 16.7 ms, p95 17.0 ms, p99 33.3 ms, max 233.3 ms |

The monolithic `qa:acceptance` command exposed and drove fixes to six QA-harness defects (occlusion assumptions, legacy art flag, OneDrive write retries, server readiness, correction-report writes, and modal-animation timing). Every component gate passed on the final tree, but the entire command was not rerun once more as one uninterrupted process after the last harness fix. This is reported as an evidence limitation, not hidden as a pass.

## Round-2 addendum

Both supplied addendum files had the same SHA-256 (`57ED80FE4EA610CDF1513AAC7F2F074C330E810ADFD9C7D4EC069611B939AB48`) and were treated as one document.

| Addendum finding | Status | Evidence or limitation |
|---|---|---|
| D01 corrupt primary recovery trap | Fixed | Loading a verified backup now repairs and verifies the primary without rotating corrupt bytes into backup. Fault-injection unit test loads `{bad`, recovers 777 coins, saves 888, and reloads 888. |
| D02 active empty-board backup before win | Fixed | `afterSettled` now routes a terminal board directly into one completion commit rather than checkpointing an active empty board first. Failed terminal writes restore the pre-final-move snapshot. |
| D03 transaction gap | Substantially fixed | Selection, Undo, Shuffle, Revive, shop, style, and win use logical-before-visual checkpoints/rollback. LocalStorage is not described as truly atomic. |
| D04 theme/shape coupling | Fixed with versioned migration | Generation v4 uses an independent coprime chapter rotation. Every collection now receives all 12 silhouettes (6–7 occurrences each); older in-progress attempts are invalidated while permanent progress remains. |
| D05 difficulty saturation | Measured, deferred | Validator still shows 976 levels at declared difficulty 5 and 760 levels at the 60-tile ceiling. Curated rebalancing requires product/playtest work. |
| D06 hidden generator fallback | Fixed | No generic live fallback; all positions must pass the named mask and solver validation. |
| D07 known-path-only proof | Improved | All 1,000 known paths remain validated; Levels 1, 25, 100, 241, 500, 750, 999, and 1000 additionally passed independent DFS (`source: search`, 37–61 nodes). This still does not prove enjoyment. |
| D08 early meta exhaustion | Deferred | No speculative retention mechanics were added. Authentic chapter milestones need product design and player research. |
| D09 Gallery blank route | Fixed | Standalone route keeps Menu active beneath Gallery; browser verification passed. |
| D10 fractional levels | Fixed | Boot, game init, level lookup, pagination, and playable clamps canonicalize finite integers. Browser `level=1.5` opened Level 1. |
| D11 intro/tap tween race | Fixed | Selection explicitly completes/cancels intro tweens before lift/flight. A genuine pointer tap at 80 ms settled visibly into the tray at the canonical slot scale. |
| D12 cancelled Shuffle visuals | Fixed | Proxies and icon alpha are restored in `finally`; restore/style operations invalidate stale action tokens. |
| D13 music cleanup | Fixed | Crossfades are tracked by owning scene; shutdown/onStop finalizes volume and destroys replaced voices exactly once. Unit fault test passed. |
| D14 misleading UI/idempotency | Fixed for current scope | Nonfunctional cosmetics hidden, replay copy truthful, fake ranks removed, and conflicting operation payloads rejected. |
| D15 invisible partial saves | Substantially fixed | Critical paths roll back and display save failure; primary writes are read-back verified. A centralized global recovery UI remains future work. |
| D16 unbounded ledger | Deferred | Mock economy remains local and noncommercial. A versioned archive/pruning policy should precede long-term or server economy deployment. |
| D17 QA rule bypass | Fixed at gate level | Geometry isolation remains explicitly labeled; separate genuine full-tray loss, Revive, pointer victory, dual-style, and soak suites are mandatory release components. |
| D18 icon alpha occupancy | Deferred to visual review/device | Runtime uses authored 512 px assets, but per-icon alpha-bound calibration and real-device density review remain. |
| D19 safe areas/accessibility | Partial | Four responsive browser sizes pass. Cutouts, gesture bars, screen readers, large text, and physical-device behavior remain unverified. |

## Performance comparison

The production bundle changed from approximately 1,371.75 kB / 386.80 kB gzip to 1,343.10 kB / 376.37 kB gzip, a reduction of about 28.7 kB raw and 10.4 kB gzip. The final short production-correction sample averaged 17.64 ms with p95 33.2 ms and max 33.3 ms. The two-minute headless soak recorded p95 17.0 ms and two frames above 50 ms; input latency was median 3.63 ms, p95 51.53 ms, p99 99.47 ms, maximum 129.37 ms. Heap rose from 39.5 MB to 57.3 MB with a 63.7 MB peak; texture count ranged 173–177.

These browser figures are diagnostic, not proof of Samsung Galaxy A-Series performance. No equivalent physical-device before/after run was available.

## Canonical evidence

- `browser-report.json`
- `undo-after-reload-390x844.png`
- `shuffle-after-reload-390x844.png`
- `pause-clock-390x844.png`
- `classic-reward-390x844.png`

## Remaining release blockers

1. User visual approval has not been granted and is not inferred from automated image/runtime checks.
2. Physical Samsung A15/A25/A35-class 15–20 minute thermal, memory, touch-latency, cutout, and speaker/audio testing remains outstanding.
3. Alternate style/chapter lazy loading is not implemented; decoded texture residency remains a mobile risk.
4. Worst-case fallback solver work remains on the main thread.
5. Difficulty plateaus after the early campaign; retention and enjoyment across 1,000 levels are not proven.
6. Historical evidence/source-master repository weight still needs a separately approved consolidation pass.
7. Economy remains local mock/test mode. There are no real payments, ads, Supabase authority, trusted leaderboard, or server-authoritative daily rewards.
8. Long-term ledger compaction and a game-wide save-recovery/export UI remain deferred.

## Production-readiness assessment

The implementation is materially safer and more truthful than the audited base and passes the final local automated/browser component gates. It is suitable for continued QA and user visual review, but it is **not yet commercially publishable** until the physical-device, visual-approval, memory-loading, solver-latency, and campaign-quality blockers above are resolved.
