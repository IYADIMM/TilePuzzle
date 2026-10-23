# Classic Mahjong asset source

This directory contains an original, project-owned visual source and the 36 transparent face crops generated from it. It does not contain pixels extracted from Vita Mahjong or Double Tile.

## Source prompt

Create one original premium casual-game Mahjong symbol master sheet on a transparent background. Arrange 36 isolated, centered face symbols in a precise 6 × 6 grid: circles 1–9, bamboo 1–9, characters 1–9, east/south/west/north winds, red/green/white dragons, plum and chrysanthemum. Use crisp high-resolution painterly rendering, lacquer red, deep jade, navy and restrained gold, consistent upper-left lighting, rounded dimensional strokes and excellent small-size readability. Symbols only: no tile bodies, captions, interface, scenery, shadows between cells, copied game art, trademarks or watermarks.

The source was generated with the built-in image-generation tool, then processed locally by `scripts/process-classic-mahjong-assets.mjs`. The script crops and alpha-trims the 36 faces, composes 72 deterministic runtime identities, adds a subtle jade/gold edition seal to identities 37–72, exports WebP files, and writes the runtime manifest.

Run `npm run art:classic` to rebuild the runtime set. The source and face crops remain PNG; optimized assets are written beneath `public/assets/premium/classic/`.
