# Jade Garden Tiles — source-audit remediation report

Date: 2026-10-22  
Branch: `codex/audit-remediation`  
Audited baseline: `5ee9c48b1b49ce31d82982132f93d106ef1d2bce`

## Outcome

The correctness, persistence, navigation, genuine-input QA, mock-economy, and Fruit/Cars prototype tasks from the independent audit are implemented. The immutable four-slot reducer, transaction IDs, Undo snapshots, animation/state separation, and shared Mahjong accessibility rules were preserved.

This build is **not yet production-ready**. Technical integration of the Fruit and Cars raster prototype passed, but visual acceptance has not been granted. Sixty of seventy-two icons and all collection-specific raster materials remain on the procedural fallback. The leaderboard is an explicit offline simulation, and the economy has no real billing, ad network, authentication, or server authority.

## Implemented corrections

### Completion, scoring, stars, and progression

- Victory now requires an empty board and tray, no pending transaction, exactly one accepted selection per level tile, the expected number of resolved triples, and a positive score.
- A direct external mutation that marks board tiles collected cannot produce a victory.
- Stars use deterministic score-and-time targets rather than booster count.
- Replay improvements add only the positive per-level star delta; aggregate stars are also recomputed during migration.
- Combo is a timed match chain. Lifetime triple count is separate from best combo.
- Leaderboard points include capped score evidence and continue to keep only the best result per level.
- Five unique clears queue an immutable chest milestone; the queue does not drift when more levels are completed before claiming.

### Save resilience

- Save schema upgraded to v4 with a primary record, backup record, and v3/v2/v1 fallback migration.
- Corrupt primary data can recover from backup; arrays and nested structures are normalized and deduplicated.
- Unlock migration keeps the greatest known legacy unlock field.
- Save failures return structured errors and populate `SaveManager.lastError`.
- Migration and operational boundaries are documented in `docs/SAVE_MIGRATION.md`.

### Interaction, tray, Undo, and motion

- The four-slot reducer remains authoritative and resolves a third match synchronously before the full-tray check.
- Match comparison still requires validated `typeId`; there is no instance-ID fallback.
- Matched tray visuals leave the active tray immediately. Detached proxies perform the soft clear animation independently from logical state.
- Remaining tray entries compact through the existing transaction-safe animation path.
- Undo restores score, timed combo, total triples, selected-tile evidence, board state, tray state, and visuals from the pre-action snapshot.
- Input, blocked dimming, solver, hint, and shuffle continue to share the top-overlap plus left/right-side accessibility calculation.
- Browser QA now accounts for Phaser depth when selecting a genuinely exposed point inside a tile hit area. It no longer mistakes physically occluded pixels for target pixels.

### Navigation and mock economy

- Level Journey has five reachable pages covering all thirty levels and permits replay of any unlocked level.
- Added deterministic local wallet ledger, daily rewards, direct-purchase catalog, inventory/equipment state, booster purchases, and one-use rollback revive.
- Gem revive charges only after the exact pre-loss snapshot is restored.
- Mock rewarded-ad proof is local and explicit. Real-money purchase calls are disabled.
- The Shop labels itself `OFFLINE ECONOMY PREVIEW • NO REAL MONEY`.
- Boundaries and production prerequisites are documented in `docs/MOCK_ECONOMY.md`.

### Raster asset pipeline

- Tile body, face symbols, tray, and buttons remain independently composable.
- Added twelve standalone transparent native icon sources: six Fruit and six Cars.
- The deterministic processor crops alpha bounds, contains/resamples, emits individual WebP sprites, and writes dimensions and SHA-256 hashes to the runtime manifest.
- Phaser loads all twelve symbols from the raster manifest in actual Fruit and Cars gameplay.
- Approved concept images are comparison-only; no reference pixels are shipped as runtime sprites.

## Exact implementation files changed or added

### Runtime and logic

- `src/art/PremiumAssetManifest.js`
- `src/economy/DailyRewardService.js`
- `src/economy/EconomyCatalog.js`
- `src/economy/InventoryService.js`
- `src/economy/MockProviders.js`
- `src/economy/ReviveService.js`
- `src/economy/WalletLedger.js`
- `src/game/SlotManager.js`
- `src/logic/LeaderboardRules.js`
- `src/logic/LevelNavigation.js`
- `src/logic/PerformanceRules.js`
- `src/logic/VictoryState.js`
- `src/main.js`
- `src/scenes/BootScene.js`
- `src/scenes/GameScene.js`
- `src/scenes/LevelSelectScene.js`
- `src/scenes/MenuScene.js`
- `src/scenes/RewardScene.js`
- `src/scenes/ShopScene.js`
- `src/systems/ProgressionManager.js`
- `src/systems/SaveManager.js`

### Tests and QA automation

- `tests/economy.test.js`
- `tests/game-rules.test.js`
- `tests/premium-assets.test.js`
- `tests/progression-layout.test.js`
- `scripts/economy-report.mjs`
- `scripts/extract-prototype-sources.mjs`
- `scripts/final-evidence.mjs`
- `scripts/gameplay-qa.mjs`
- `scripts/generate-validation-reports.mjs`
- `scripts/interaction-qa.mjs`
- `scripts/leaderboard-qa.mjs`
- `scripts/premium-art-qa.mjs`
- `scripts/process-premium-assets.mjs`
- `scripts/qa-helpers.mjs`
- `scripts/tray-visual-qa.mjs`
- `scripts/victory-qa.mjs`
- `package.json`

### Documentation

- `README.md`
- `assets/premium/README.md`
- `assets/premium/asset-prompts.json`
- `docs/MOCK_ECONOMY.md`
- `docs/SAVE_MIGRATION.md`

### Native and runtime art

- `assets/premium/source/icons/`: `fruit-cherries.png`, `fruit-orange.png`, `fruit-strawberry.png`, `fruit-pineapple.png`, `fruit-watermelon.png`, `fruit-grapes.png`, `car-sports.png`, `car-sedan.png`, `car-suv.png`, `car-race.png`, `car-taxi.png`, `car-convertible.png`
- `public/assets/premium/`: the corresponding twelve WebP icons plus updated `manifest.json`; the existing tile, tray, and button assets remain part of the same pipeline.

### Generated evidence

- Machine-readable: `qa/ASSET_INVENTORY.json`, `qa/ECONOMY_TEST_REPORT.json`, `qa/LEVELS_30_VALIDATION.json`, `qa/QA_REAL_GAMEPLAY_REPORT.json`, and updated reports under `qa/final-acceptance/`, `qa/premium-art/`, and `qa/leaderboard/`.
- Fresh screenshots: all eighteen PNGs in `qa/audit-final-evidence/`, responsive pointer/debug captures in `qa/audit-remediation/`, and the two `*-approved-vs-runtime-audit.png` comparison sheets in `qa/premium-art/`.

## Verification results

- `npm test`: 50/50 passing.
- `npm run build`: passing; Vite reports a non-blocking 1.32 MB bundle/chunk-size warning.
- Thirty-level static validation: 30/30 solver verified and 30/30 grid aligned.
- Genuine victory: 36/36 selections were real `page.mouse.click` events; 12 triples; score 23,400; forced state-mutation victory rejected; stored score matched runtime score.
- Pointer QA: four genuinely visible face samples accepted, five physically occluded samples correctly classified instead of clicked, four portrait sizes accepted a lower-board legal tile, and an uncovered area of a blocked tile rejected input.
- Tray visual QA: two equal types remained highlighted; the third cleared the authoritative tray to zero immediately; active tray visuals were zero; combo and total-triple counters advanced once.
- Gameplay QA: rapid duplicate rejected, no false full tray, one triple did not complete the level, and Undo restored the exact two-tile pre-clear state.
- Audio silence: 61.282 seconds across menu, selection, triple, pause/resume, loss, restart, completion, and reward; zero audio contexts and zero media play calls.
- Leaderboard UI: weekly and friends tables sorted/rendered with no fabricated victory; scope is explicitly offline demo only.
- Premium asset integration: all twelve Fruit/Cars icon textures, premium tile body, four-slot tray, and button textures loaded; all 36 tiles in each prototype level used mapped runtime textures.
- Mock economy: five safety cases passed; zero real-money and zero ad-network operations.
- Evidence suite: eighteen browser captures, one canvas each, zero page errors, completion capture confirmed the Reward scene.

## Remaining defects and release gates

1. **Visual gate not passed.** The live board is cleaner and the Fruit/Cars symbols are native raster assets, but it still has less scale, density, material depth, foliage, and celebration richness than the approved concepts. Human visual review is pending.
2. **Art coverage incomplete.** Sports, Auto Parts, Wild Animals, Pets, Desserts, Flowers, Ocean Life, Music, Travel, and Space still use the SVG fallback: 60 icons remain. No collection-specific native raster material set has been produced for the twelve approved material directions.
3. **Leaderboard is not competitive infrastructure.** It is local/offline and therefore cannot provide identity, anti-cheat, cross-device standings, seasons, moderation, or authoritative rewards.
4. **Economy is not monetization-ready.** It is mock-only and intentionally lacks billing, ads, receipts, refunds, restore purchases, server wallet authority, compliance, and fraud prevention.
5. **Bundle optimization remains.** The production bundle emits Vite's chunk-size warning and should be code-split before store release.
6. **Device/store qualification remains.** Physical-device performance, memory pressure, offline/PWA behavior, accessibility, privacy disclosures, analytics consent, localization, and store policy review are not complete.

## Readiness assessment

The mechanics and local progression are suitable for an internal alpha or mechanics-focused beta. The project is **not publishable as a commercial release** until the art expansion receives human approval, online leaderboard/economy scope is decided and implemented securely (or removed from release claims), and device/store qualification is completed.
