# Jade Garden Tiles

A portrait-first, completely silent Phaser 3 match-three game with Mahjong top/side accessibility, an atomic four-slot tray, 30 deterministic levels, 12 rotating collections, an offline leaderboard, and a mock-only economy preview. Fruit and Cars currently use twelve original premium raster symbols; the remaining sixty symbols retain the procedural fallback pending human visual approval.

## Run and verify

```bash
npm install
npm run dev
npm test
npm run build
npm run preview
npm run qa:acceptance
```

Use `?screen=game&level=2` to open a level directly and `?debugGrid=1` to display projected tile hit bounds. Progress, preferences, boosters, achievements, rewards, stars, XP, and unlocked themes are versioned in `localStorage`.

## Architecture

```text
src/
  art/       premium raster manifest, procedural fallbacks, materials, particles
  economy/   deterministic mock wallet, catalog, daily rewards, revive providers
  data/      12 collections/materials and 30 level configurations
  game/      Tile visual, BoardManager, atomic SlotManager
  logic/     pure tray reducer, accessibility, generator, solver, scoring rules
  scenes/    boot, home, levels, game, shop, leaderboard, rewards
  systems/   resilient save migration and progression (no audio runtime)
  ui/        responsive projection, reusable controls and animated modal
tests/       tray invariants, solver/occlusion, progression and layout
scripts/     reproducible Playwright screenshot and gameplay QA
qa/          captures and machine-readable browser regression reports
```

The third identical tray entry is removed from logical state synchronously before animation or overflow evaluation. A live higher-layer overlap blocks a tile; otherwise, a tile also needs its left or right side free. Input, dimming, solver, hint, and shuffle share this accessibility model. Shuffle is accepted only when the solver confirms the remapped remainder is playable.

The app uses a full-viewport Phaser RESIZE canvas with a 540×960 design camera, felt extension around long/tablet aspect ratios, safe board/tray regions, and CSS notch insets. Fredoka, Poppins and Cairo load before screen layout with a bounded fallback timeout. No Web Audio, Phaser audio playback, media playback, audio timer, or background loop is created.

Economy features are deliberately local mock/test implementations. There are no payment-provider, ad-network, or server-authoritative operations. See `docs/MOCK_ECONOMY.md` and `docs/SAVE_MIGRATION.md` before changing persistence or enabling external services.
