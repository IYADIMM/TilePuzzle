# Visual asset fidelity

## Source-to-runtime pipeline

- New ceramic source: `assets/premium/source/tile-body-master-v2.png`.
- New four-recess tray source: `assets/premium/source/tray-master-v2.png`.
- Optimized runtime outputs: 512×640 tile WebP and 1024×400 tray WebP.
- Existing 72 illustrated icons remain independent 512×512 transparent WebPs; no reference-image pixels are used.
- Classic symbols remain separate from the tile body, so both styles share geometry without changing identity or state.
- Phaser keeps antialiasing enabled and device resolution capped at 2×.

The new assets were generated as original production sprites using the built-in image-generation workflow, then alpha-trimmed, high-quality resampled and recorded in `public/assets/premium/manifest.json`. Lighting is consistently upper-left.

The runtime audit passed for all 12 collections, 72 illustrated identities, 12 materials, both styles, and the premium tray. Technical integration is PASSED. Aesthetic acceptance remains PLAYER VISUAL APPROVAL PENDING.
