# Jade Garden Tiles — Current Premium Rebuild Report

Date: 2026-10-23

Branch: `codex/jade-production-correction-premium-parity`
Current rule override: match two, exactly four tray slots.

This report describes the current branch, not the earlier match-three or six-icon prototype checkpoints. Automated checks do not grant visual approval on the user's behalf.

## Gameplay architecture

- `MATCH_SIZE = 2` is the single authoritative match threshold.
- The immutable tray reducer commits pair removal before evaluating four-slot fullness.
- Canonical `typeId` is mandatory; matching never falls back to a unique visual instance ID.
- Phaser objects project committed state. Cleared tiles leave active tray state immediately and detached proxies render the collision/fade.
- Undo restores the exact pre-action board, tray, symbol, score and combo snapshot without refilling its inventory.
- Revive returns all four unmatched tray tiles to their board positions, preserves prior score/matches and charges an idempotent mock transaction once.
- Victory requires zero board tiles, an empty tray, no unresolved transaction, valid full-level evidence and a single-fire guard.
- Mahjong accessibility requires no higher-layer overlap and at least one free horizontal side. Input, dimming, solver, hint and shuffle share the same pure calculation.

## Web pointer repair

The rendered tile body is larger than the logical face. The previous input rectangle covered only the smaller face and the board rejected artwork extending outside its nominal bounds, making edges—especially the lowest row—appear dead.

The current implementation:

- sizes each interactive rectangle to the complete rendered body;
- routes each pointer release once at board scope;
- chooses the visually uppermost body under the pointer;
- applies the authoritative blocked/unblocked decision after visual hit resolution;
- does not pass through a blocked top tile to an illegal lower tile;
- accepts left, right, top and bottom rendered edges, including the lowest board strip;
- removes the scene input listener during shutdown.

Proof: `qa/final-acceptance/interaction-report.json` records four accepted expanded-edge taps, four responsive portrait sizes and a rejected blocked-tile tap.

## Production artwork and interface

- 72/72 original transparent PNG icon masters are available across Fruits, Cars, Sports, Auto Parts, Wild Animals, Pets, Desserts, Flowers, Ocean Life, Music, Travel and Space.
- 12/12 material-specific tile-body masters are available: mahogany, natural wood, chrome, brushed steel, clear/frosted glass, ceramic, leather, fabric, fur, stone and decorative metal.
- The deterministic processor produces 87 optimized WebPs: base body, 12 material bodies, 72 icons, tray and button.
- Runtime assets are hash-listed in `public/assets/premium/manifest.json`; editable production prompts are retained in `assets/premium/asset-prompts.json`.
- Tile body and symbol remain separately composable.
- Home, HUD, tray, boosters, pause, defeat, rewards, collection, level journey, local records and mock shop use the shared jade/mahogany/ivory/gold design system.
- Player-facing records are explicitly device-local; no simulated online opponents or false online rank are shown.

## Audio, economy and data

- Previously approved audio files remain byte-identical with separate persisted Music/SFX controls, cautious volumes, gesture unlock, voice caps and scene cleanup.
- Tile selection and genuine victory now each use a three-choice no-repeat shuffle bag: the approved original plus two reproducible, independently synthesized alternates. No new clash sound was created or substituted.
- Economy and revive providers remain local mock/test implementations. There is no Supabase, authentication, ad network, billing or real payment processing.
- Save migration preserves permanent progress while invalidating incompatible legacy match-three attempts.
- Primary-plus-backup localStorage recovery, bounded checkpoint history and idempotent reward/economy transactions remain active.

## Verification

- `npm test`: 70/70 passing.
- `npm run build`: passed; Vite still reports the known large Phaser/application chunk advisory.
- 1,000/1,000 generated configurations: solver and grid verified.
- Genuine gameplay: full 36-pointer completion passed without direct tile-state mutation.
- Interaction: complete rendered-body edges, blocked rejection and 360×640, 390×844, 430×932 and 768×1024 passed.
- Tray: atomic pair clear, zero lingering logical/visual occupancy and pending-match treatment passed.
- Recovery: reload checkpoint, four-unmatched loss and revive passed.
- Audio synchronization and mute behavior passed.
- Fifteen-minute browser endurance completed 71 levels and 2,631 genuine pointer selections with zero errors; frame p99 was 50.1 ms and heap ended at 60.7 MB after a 165.9 MB peak.
- Premium art runtime integration passed for all twelve collections; normal gameplay uses zero procedural icon/material fallbacks.
- Twelve-theme browser capture generated 23 screenshots without console errors.

## Evidence

- `qa/PRODUCTION_CORRECTION_COMPLIANCE_MATRIX.md`
- `qa/INDEPENDENT_BUG_REPRO_AND_FIX_REPORT.md`
- `qa/ASSET_INVENTORY.json`
- `qa/premium-art/premium-art-report.json`
- `qa/production-visual-ux/browser-report.json`
- `qa/production-visual-ux/VISUAL_ACCEPTANCE_GALLERY.md`
- `qa/final-acceptance/interaction-report.json`
- `qa/production-correction/browser-report.json`
- `qa/MOBILE_PERFORMANCE_AND_INPUT_REPORT.md`

## Remaining release gates

- Human visual approval remains pending.
- Physical affordable Samsung Galaxy A-Series performance, thermal, memory, touch and audio-interruption validation has not been performed.
- The minified application/Phaser chunk remains approximately 1.35 MB and should be split or otherwise distribution-optimized.
- Generated source masters are flattened transparent PNGs with editable prompt specifications, not layered PSD/Blender project files.
- No signed native APK/AAB or app-store submission was produced.

The current classification remains **internal alpha**, not commercially publishable.
