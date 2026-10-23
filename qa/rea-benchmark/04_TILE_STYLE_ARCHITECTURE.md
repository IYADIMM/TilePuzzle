# Tile style architecture

`TileStyleRegistry.js` is the presentation boundary. Gameplay continues to use stable logical `typeId` values. The resolver maps those values to either the existing illustrated collection texture or one of 72 Classic runtime identities; it never mutates board topology, match state, scoring, solver input or save progression.

Classic mapping is deterministic and collision-probed across the current level identity set. The shipped 36 authored faces are expanded into 72 globally distinguishable identities with a restrained edition seal on the second set. Tests prove injective mapping across all 72 identities and identical generated levels/solutions under both skins.

`Tile.applySkin()` repaints body, icon and icon shadow together. `BoardManager.applyStyle()` rebuilds the resolver and refreshes blocking. `GameScene.applyTileStyle()` commits the preference and repaints board plus detached tray visuals without waiting on animation callbacks. If a tray transaction is active, the change is queued until it is safe. Save schema v6 migrates existing/invalid preferences to Illustrated Garden while retaining the established v5 storage key for backward compatibility.

Asset flow:

1. Original transparent master in `assets/premium/source/classic/`.
2. 36 editable face crops in `assets/premium/source/classic/faces/`.
3. `npm run art:classic` performs crop normalization, composition and WebP optimization.
4. 72 runtime files and manifest in `public/assets/premium/classic/`.
5. `AssetFactory` preloads the manifest-defined runtime keys.

The gallery uses the actual loaded Phaser textures; it is not a detached mockup.
