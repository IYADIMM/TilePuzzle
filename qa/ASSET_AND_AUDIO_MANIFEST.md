# Asset and Audio Manifest

## Raster game art

- All 72 collection icons have individual editable transparent PNG source masters and optimized 512×512 WebP runtime assets.
- Shared premium ivory tile, mahogany tray and mahogany button raster assets are loaded by Phaser.
- Twelve independent 512×640 native raster tile bodies cover mahogany, natural wood, chrome, brushed steel, clear glass, frosted glass, ceramic, leather, fabric, fur, stone and decorative metal while preserving the ivory playing face.
- Procedural SVG and Canvas art remains only as a defensive loading fallback; normal runtime coverage is 72/72 icons and 12/12 material bodies.
- New original brand asset: `public/assets/brand/jade-garden-app-icon-1024.png` (built-in image-generation pipeline; no reference pixels cropped or reused).
- Android adaptive foreground: `public/assets/brand/jade-garden-adaptive-foreground-1024.png` (transparent, no outer frame; native packaging background color is `#07352c`).
- iOS/PWA opaque master: `public/assets/brand/jade-garden-ios-opaque-1024.png` (full-bleed emerald felt, no transparency).
- Install metadata: `public/manifest.webmanifest`.

Machine-readable inventory: `qa/ASSET_INVENTORY.json` and `public/assets/premium/manifest.json`.

## Audio

- Approved `tile_select` and `level_complete` originals retain their supplied hashes.
- Existing approved selection, placement, blocked, match shimmer, combo, booster, failure, reward and music mappings remain unchanged.
- No new pair/clash sound was generated or integrated.
- Music/SFX preferences, cautious volumes, voice caps, interruption recovery and mute paths passed browser QA.

Evidence: `qa/audio/audio-browser-report.json`. Playback was verified through browser audio state/events; no physical loudspeaker quality claim is made.

## App icon generation record

Built-in image generation was used with a square logo-brand prompt specifying one glossy ivory tile, a jade leaf emblem, emerald felt, mahogany depth, warm gold trim, upper-left studio lighting, no text and no copyrighted game imagery. Two derived production masters were then created through the same image pipeline: (1) a transparent adaptive foreground retaining only the centered tile and leaf with mask-safe padding, and (2) an opaque iOS/PWA square with full-bleed emerald felt and no platform-inappropriate outer frame. Final workspace paths are listed above. The original generated files remain preserved under the Codex generated-images directory.
