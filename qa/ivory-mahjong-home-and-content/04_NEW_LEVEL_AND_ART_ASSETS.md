# New Level and Art Assets

## Garden Treasures bonus

- 24 tiles, six stable symbol identities, Match-2, four-slot tray.
- Uses the existing `LevelGenerator`, solver, exposure rules, `BoardManager`, reducer-backed tray, Hint, Shuffle, Undo, dual-style resolver, scoring, and Reward scene.
- Seed: `284771`; generation version: 5; flower layout with two layers.
- The generated solution contains 24 legal selections and was completed in the real browser with 24 pointer events.

## Art pipeline

- Editable/high-resolution source: six transparent PNGs.
- Runtime: six separately composable 512×512 transparent WebP symbols.
- Runtime loading: registered in `PremiumAssetManifest` and loaded by `BootScene`/`AssetFactory`.
- Tile body and face symbol remain separate so Illustrated Garden and Classic Mahjong presentation share identical logical state.

The new level does not alter `THEMES`, the 12 campaign collections, or the 1,000 seeded campaign configurations.
