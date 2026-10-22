# Premium Raster Asset Pipeline

This pipeline is intentionally separate from the procedural SVG fallback. Approved concept images are direction-only and are never cropped, traced, or shipped as game assets.

## Directory contract

- `assets/premium/source/` — immutable high-resolution transparent PNG masters generated specifically for this project.
- `assets/premium/asset-prompts.json` — editable generation brief, common lighting/material rules, and master-specific prompts.
- `public/assets/premium/` — optimized transparent WebP runtime sprites and `manifest.json` with dimensions and SHA-256 hashes.
- `src/art/PremiumAssetManifest.js` — Phaser texture-key mapping and controlled prototype rollout.
- `scripts/process-premium-assets.mjs` — deterministic alpha-bound crop, contain-resize, and WebP encoding pipeline.

## Prototype inventory

1. Icon-free glossy ivory rectangular tile body.
2. Cherries, orange, strawberry, pineapple, watermelon, and grapes symbols.
3. Sports coupe, luxury sedan, SUV, race car, taxi, and convertible symbols.
4. Soccer, basketball, tennis, baseball, football, and trophy symbols.
5. Gear, spark plug, tire, piston, steering wheel, and brake disc symbols.
6. Lion, elephant, zebra, giraffe, tiger, and panda symbols.
7. Puppy, kitten, rabbit, hamster, parrot, and goldfish symbols.
8. Mahogany tray with exactly four wells.
9. Blank matching mahogany/gold button plate.

Collection masters are extracted from transparent 3×1 or 3×2 source atlases into standalone native PNG sources. Processing handles all 36 symbols through the same manifest-driven path and emits an independent 512×512 WebP for each symbol. The tile body remains separate from every face icon.

## Rebuild optimized assets

```powershell
node scripts/process-premium-assets.mjs
```

The processor:

1. Reads each standalone source PNG with alpha.
2. Finds its visible-pixel bounds.
3. Preserves aspect ratio and transparent padding.
4. Resamples with high-quality browser canvas filtering.
5. Emits WebP sprites at declared target dimensions.
6. Rewrites `public/assets/premium/manifest.json` with checksums.

## Runtime policy

- Phaser preloads the raster prototypes under stable texture keys.
- Fruits, cars, sports, auto parts, wild animals, and pets use the premium tile body plus six premium symbols each.
- Desserts, flowers, ocean life, music, travel, and space retain the SVG/canvas fallback until their production artwork is complete and visually reviewed.
- Tray and primary buttons use raster sprites globally because their geometry is collection-independent.
- State, hitboxes, blocking, and matching never depend on image dimensions.

## Expansion gate

The current six-collection implementation is a production candidate, not approved artwork. Review the live browser captures in `qa/production-visual-ux/` against the supplied concept sheets. Expand the remaining six collections through the same source/master/manifest pipeline without changing gameplay IDs; do not represent technical integration as human visual approval.

## Editable-source limitation

The current original masters are flattened transparent PNG renders; layered PSD/Blender source is not produced by the available generator. The editable source-of-truth available here is the prompt specification plus deterministic processing configuration. Visual acceptance remains pending human review.
