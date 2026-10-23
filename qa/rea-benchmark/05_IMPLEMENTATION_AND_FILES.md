# Implementation and files

## Runtime

- `src/art/TileStyleRegistry.js`: style metadata, normalization, deterministic mapping and skin resolver.
- `src/art/AssetFactory.js`: Classic WebP preload integration.
- `src/game/Tile.js`: atomic skin repaint and premium ivory Classic body.
- `src/game/BoardManager.js`: skin application and pointer-down routing.
- `src/scenes/TileStyleGalleryScene.js`: selectable gallery using live runtime textures.
- `src/scenes/MenuScene.js`, `AudioSettingsScene.js`, `GameScene.js`, `BootScene.js`: entry points, live application and QA route.
- `src/systems/SaveManager.js`: schema-v6 preference migration.
- `src/main.js`: gallery registration and subpixel-safe rendering configuration.

## Assets and pipeline

- `assets/premium/source/classic/`: original master, prompt record and 36 face sources.
- `public/assets/premium/classic/`: 72 optimized runtime WebPs and manifest.
- `scripts/process-classic-mahjong-assets.mjs`: reproducible source-to-runtime pipeline.

## QA

- `tests/tile-styles.test.js`: inventory, mapping, seeded-level parity and save migration.
- `scripts/rea-dual-style-qa.mjs`: responsive real-browser style, pointer, live-switch, pair and shuffle checks.
- `scripts/interaction-qa.mjs`: correct visible-point and blocked-route validation.
- `scripts/audio-qa.mjs`: updated for the new settings layout and bounded, efficient blocked-tap discovery.
- `qa/rea-benchmark/`: reports and runtime screenshots.

Existing tray reducer, transaction guards, Undo, checkpoints, revive, scoring, inventory, progression, approved audio and mock-only economy were retained.
