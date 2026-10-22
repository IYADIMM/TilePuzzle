# Jade Garden Tiles

A portrait-first, completely silent Phaser 3 match-three game with strict layered occlusion, an atomic four-slot tray, 30 deterministic levels, 12 rotating collections, and 72 original vector icons. Glossy ivory tile faces sit on distinctly rendered mahogany, natural wood, chrome, brushed steel, glass, ceramic, leather, fabric, fur, stone, and decorative-metal bodies.

## Run and verify

```bash
npm install
npm run dev
npm test
npm run build
npm run preview
```

Use `?screen=game&level=2` to open a level directly and `?debugGrid=1` to display projected tile hit bounds. Progress, preferences, boosters, achievements, rewards, stars, XP, and unlocked themes are versioned in `localStorage`.

## Architecture

```text
src/
  art/       original SVG icon library, cached materials, particles
  data/      12 collections/materials and 30 level configurations
  game/      Tile visual, BoardManager, atomic SlotManager
  logic/     pure tray reducer, deterministic generator and solver
  scenes/    boot, home, levels, game, collection, achievements, rewards
  systems/   save migration and progression/achievements (no audio runtime)
  ui/        responsive projection, reusable controls and animated modal
tests/       tray invariants, solver/occlusion, progression and layout
scripts/     reproducible Playwright screenshot and gameplay QA
qa/          captures and machine-readable browser regression reports
```

The third identical tray entry is removed from logical state synchronously before animation or overflow evaluation. Any positive face overlap from a live higher-layer tile blocks and disables the lower tile. Shuffle is accepted only when the solver confirms the remapped remainder is still playable.

The app uses a full-viewport Phaser RESIZE canvas with a 540×960 design camera, felt extension around long/tablet aspect ratios, safe board/tray regions, and CSS notch insets. Fredoka, Poppins and Cairo load before screen layout with a bounded fallback timeout. No Web Audio, Phaser audio playback, media playback, audio timer, or background loop is created.
