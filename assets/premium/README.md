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
2. Cherries, orange, and strawberry symbols.
3. Red sports coupe, blue luxury sedan, and green compact SUV symbols.
4. Mahogany tray with exactly four wells.
5. Blank matching mahogany/gold button plate.

The fruit and car masters are atlases only at the source stage. Processing extracts each independently generated cell into its own transparent 512×512 runtime sprite. The tile body remains separate from all face icons.

## Rebuild optimized assets

```powershell
node scripts/process-premium-assets.mjs
```

The processor:

1. Reads master PNG alpha.
2. Finds visible-pixel bounds per atlas cell.
3. Preserves aspect ratio and transparent padding.
4. Resamples with high-quality browser canvas filtering.
5. Emits WebP sprites at declared target dimensions.
6. Rewrites `public/assets/premium/manifest.json` with checksums.

## Runtime policy

- Phaser preloads the raster prototypes under stable texture keys.
- Fruits and cars use the premium tile body plus three premium symbols each.
- Remaining icons and material themes retain the SVG/canvas fallback until visual approval.
- Tray and primary buttons use raster sprites globally because their geometry is collection-independent.
- State, hitboxes, blocking, and matching never depend on image dimensions.

## Expansion gate

Do not automatically expand this prototype to 72 icons or 12 raster materials. First review `qa/premium-art/fruit-approved-vs-runtime.png` and `qa/premium-art/cars-approved-vs-runtime.png`. After approval, generate one source master per coherent collection/material family, process through this script, and add stable mappings without changing gameplay IDs.

## Editable-source limitation

The current original masters are flattened transparent PNG renders; layered PSD/Blender source is not produced by the available generator. The editable source-of-truth available here is the prompt specification plus deterministic processing configuration. Visual acceptance remains pending human review.
