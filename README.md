# Jade Garden Tiles

A portrait-first Phaser 3 match-two game with Mahjong top/side accessibility, an atomic four-slot tray, 1,000 deterministic configurations, 12 rotating collections, approved optional audio, private on-device records, and a mock-only economy catalog. Selection and completion cues each rotate through three no-repeat variations while retaining the approved originals unchanged. All 72 symbols and all 12 tile materials use original high-resolution raster sources with optimized WebP runtime assets. Technical integration is complete; human visual/audio approval and physical Android profiling remain separate release gates.

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
  scenes/    boot, home, levels, game, test shop, local records, rewards
  systems/   resilient save migration, progression, and device-local records
  ui/        responsive projection, reusable controls and animated modal
tests/       tray invariants, solver/occlusion, progression and layout
scripts/     reproducible Playwright screenshot and gameplay QA
qa/          captures and machine-readable browser regression reports
```

The second identical tray entry is removed from logical state synchronously before animation or overflow evaluation. A live higher-layer overlap blocks a tile; otherwise, a tile also needs its left or right side free. Input, dimming, solver, hint, and shuffle share this accessibility model. Shuffle is accepted only when the solver confirms the remapped remainder is playable. Pointer routing uses the complete rendered tile body, selects the visually uppermost tile, and rejects it when the shared accessibility model says it is blocked.

The app uses a full-viewport Phaser RESIZE canvas with a 540×960 design camera, felt extension around long/tablet aspect ratios, safe board/tray regions, and CSS notch insets. Fredoka, Poppins and Cairo load before screen layout with a bounded fallback timeout. Approved SFX and two ambient beds are centrally managed with separate persisted Music and SFX controls, quiet defaults, gesture unlock, voice caps, lifecycle recovery, and a fully muted mode.

Economy features are deliberately local mock/test implementations. There are no payment-provider, ad-network, Supabase, or server-authoritative operations. The Records screen shows only this device's saved results; it does not simulate online players or ranks. See `docs/MOCK_ECONOMY.md` and `docs/SAVE_MIGRATION.md` before changing persistence or enabling external services.
