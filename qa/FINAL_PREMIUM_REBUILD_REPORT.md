# Jade Garden Tiles — Premium Rebuild Report

Date: 2026-10-22

## Visual inputs inspected

The visual rebuild began only after reading `Jade_Garden_Codex_Visual_Evidence_Pack/VISUAL_INPUTS_README.txt` and visually inspecting both approved references plus all nine rejected screenshots. The approved images were used for direction (ivory portrait tiles, green felt, warm wood, gold trim, bold rounded type); the rejected screenshots were used only as a defect list.

No visual approval is asserted on the user's behalf.

## Implemented gameplay corrections

- Exact four-entry immutable tray reducer retained. A fifth tile can never enter.
- Canonical normalized `typeId` is mandatory; unique visual IDs are never used as a matching fallback.
- The next tray state, including triple removal, is committed synchronously before any animation or loss check.
- A fourth arriving tile that completes a triple resolves to the compacted non-full state; it cannot produce a false tray-full loss.
- Matched Phaser tile objects are hidden and detached immediately. Independent proxy objects and particles render the graceful clear animation.
- Pending pairs remain in the tray and now receive a pulsing gold face/outline treatment.
- Rapid-tap transaction locks, duplicate rejection, immutable state, detached effects, and Undo snapshots are retained.
- Selection uses one shared accessibility calculation for input, hint, shuffle, solver, and dimming: no top overlap and at least one horizontal side free.
- Completion is gated by zero remaining board tiles, an empty tray, a settled transaction, and a single-fire victory flag.

## Input and layout corrections

- Central 56×72 (7:9) portrait tile geometry drives layout, face rendering, blocking, and hit areas.
- Whole-face rectangle is interactive; overlays are children of the tile and do not intercept input.
- `input.topOnly` and depth order prevent click-through.
- `?debugGrid=1` shows the precise face hitbox, tile ID, selectable/blocked state, top/left/right blocker counts, pointer point, and accepted/rejected status.
- Early boards now begin at 36 tiles and progress to 60, creating a denser, taller layered composition while preserving solver verification.

## Motion, effects, and visual rebuild

- Selection flies over a quadratic Bézier arc with eased lift and 390 ms travel; compaction uses a 260 ms sine ease.
- Triple removal uses ivory flecks, gold shimmer, an expanding gold ring, and floating score/combo text without camera shake or harsh debris.
- Runtime tiles use a tall glossy ivory face, thick themed side walls, contact/ambient shadows, inset bevels, and specular highlights.
- Blocked tiles are dimmed but remain visually readable; active tiles retain bright ivory faces.
- Fruit, car, sports, and auto-part vector sets were enlarged and refined; strawberry seeds and orange texture are clipped inside their silhouettes, cars use shaded paint/glass/wheels/lights, and sports/metal objects use richer gradients.
- Twelve collections and twelve rotating materials remain integrated across 30 deterministic levels.
- Home, HUD, tray, boosters, modal, reward, collection, achievement, and level screens share the felt/wood/gold/ivory visual language and Fredoka/Poppins/Cairo typography.

## Dedicated premium raster prototype

- Added a separate high-resolution transparent raster pipeline under `assets/premium/` and `public/assets/premium/`; no approved-reference pixels are shipped.
- Produced original masters for an icon-free ivory tile, three fruits, three distinct cars, an exact four-slot mahogany tray, and a matching blank UI button.
- Preserved composability: tile body and face icons are separate Phaser textures.
- Added deterministic alpha-bound cropping, resizing, WebP encoding, and SHA-256 manifest generation in `scripts/process-premium-assets.mjs`.
- Integrated all prototype sprites into the actual Phaser loader and runtime. Fruit/car levels use the raster tile and matching prototype symbols; the generated tray and buttons are instantiated in live scenes.
- Created actual-browser comparisons in `qa/premium-art/` showing both approved references beside live fruit and car gameplay.
- This is a prototype gate only. The other 66 icons and additional raster material families remain on the existing fallback until visual approval.

## Score, progression, persistence, and audio

- Score counts animate during play, with combo and level scaling.
- Lifetime score, earned coins, total triples, best results, stars, achievements, chest progress, boosters, and idempotent first-clear rewards persist.
- The project remains completely silent, following the latest evidence-pack README. The live audit observed zero AudioContext constructions and zero media play calls through home, gameplay, triple, pause, loss, restart, completion, and reward.

## Verification results

- `npm test`: 32/32 passing, including raster manifest/source validation.
- `npm run build`: production Vite build succeeds (only the standard Phaser bundle-size advisory remains).
- `npm run qa:gameplay`: passed; proves atomic third-tile clear, no active matched visuals, no false completion after one triple, duplicate rejection, and Undo restoration.
- `npm run qa:interaction`: passed; real canvas clicks succeed at top/middle/lower positions, nine face points are hittable, and actual levels exhibit top-blocked, side-sandwiched, one-side-free, and lower selectable states.
- `npm run qa:victory`: passed; all 36 level-one selections were legally accepted and the only active scene afterward was `Reward` with `PERFECT CLEAR`.
- `npm run qa:tray-visual`: passed; the two-tile pair had the live gold glow/tint, and the third selection synchronously produced zero logical entries, zero active tray visuals, and combo 1.
- `npm run qa:silence`: passed over a 92-second live interaction audit.
- `npm run qa:premium-art`: passed technical integration checks: nine textures loaded, 36 raster tile bodies per fruit/car level, 18 prototype face icons per level, premium tray active, three premium home buttons active, and no browser errors. This is not an artwork-approval assertion.
- All 30 generated boards are solver-verified using the same accessibility rule used by live input.

## Primary files changed

- `src/game/TileGeometry.js`
- `src/logic/LevelSolver.js`
- `src/logic/LevelGenerator.js`
- `src/logic/MotionMath.js`
- `src/logic/VictoryState.js`
- `src/game/BoardManager.js`
- `src/game/SlotManager.js`
- `src/game/Tile.js`
- `src/scenes/GameScene.js`
- `src/scenes/RewardScene.js`
- `src/scenes/IconSheetScene.js`
- `src/scenes/BootScene.js`
- `src/scenes/MenuScene.js`
- `src/art/TileMaterialFactory.js`
- `src/art/SvgIconLibrary.js`
- `src/art/PremiumAssetManifest.js`
- `src/ui/LayoutManager.js`
- `src/systems/SaveManager.js`
- `src/systems/ProgressionManager.js`
- `src/data/levels.js`
- `src/main.js`
- `tests/levels.test.js`
- `tests/slot-state.test.js`
- `tests/game-rules.test.js`
- `scripts/gameplay-qa.mjs`
- `scripts/interaction-qa.mjs`
- `scripts/victory-qa.mjs`
- `scripts/tray-visual-qa.mjs`
- `scripts/final-evidence.mjs`
- `scripts/process-premium-assets.mjs`
- `scripts/premium-art-qa.mjs`
- `package.json`

## Evidence locations

- Curated actual-game screenshots: `qa/final-acceptance/`
- Multi-size screenshots: `qa/screenshots/`
- Gameplay report: `qa/gameplay-report.json`
- Interaction report: `qa/final-acceptance/interaction-report.json`
- Genuine completion report: `qa/final-acceptance/victory-report.json`
- Pending-pair/atomic-clear report: `qa/final-acceptance/tray-visual-report.json`
- Silence report: `qa/silence-report.json`
- Full capture manifest: `qa/final-evidence-report.json`
- Premium raster source and pipeline: `assets/premium/`
- Optimized runtime sprites: `public/assets/premium/`
- Reference-versus-runtime art comparisons: `qa/premium-art/`

## Remaining limitations

- Six icons now use original painterly raster prototypes; the remaining 66 still use procedural SVG fallback. Expansion to all 72 icons and 12 raster materials is intentionally blocked on human approval of the prototype.
- The generated masters are flattened transparent PNGs rather than layered PSD/Blender sources. Editable prompt specifications and deterministic processors are retained, but per-layer paint edits would require a dedicated art-authoring pass.
- Google Fonts require network access on first load; the configured rounded fallback remains functional offline.
- The minified Phaser bundle is approximately 1.3 MB and Vite emits a chunk-size advisory; this is not a gameplay failure but can be optimized through code splitting for distribution.
- Final visual acceptance remains with the user.
