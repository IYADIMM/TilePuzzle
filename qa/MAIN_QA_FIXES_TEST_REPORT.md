# Main QA Fixes — Test Report

## Automated logic

- `npm test`: 77/77 passed.
- New cases cover mystery journey boundaries, route gating, abandonment persistence, tray fit, solver-backed hints, no fabricated hint fallback, and solvable/non-noop shuffle plans.
- Existing coverage retained for state migration, star aggregation, treasure milestones, Undo inventory, Match-2, four-slot loss, atomic clear, duplicate taps, blocking, 72 icons, and 12 materials.

## Browser/gameplay

- `scripts/main-fixes-qa.mjs`: PASS.
  - Fresh journey: Level 1 plus one mystery.
  - Progress 10: 10 unlocked plus mystery 11.
  - Level 999 route gated to level 10.
  - A rapid genuine-pointer double-click on Hint consumed exactly one inventory unit; shuffle consumed exactly one unit after success.
  - Shuffle changed assignment and preserved the exact multiset.
  - Explicit leave cleared the attempt and retained permanent inventory/progress.
  - Pointer targets passed at 360×640, 390×844, and 430×932.
  - A complete 36-tile level was cleared with genuine pointer events; reward score was 34,200.
- `npm run qa:correction`: PASS for exact checkpoint resume and revive rollback.
- `npm run qa:tray-visual`: PASS for pending-pair highlight and immediate logical/visual clear.
- `npm run qa:victory`: PASS; forced false victory rejected, one legitimate pointer victory emitted.
- `npm run qa:levels1000`: PASS; 1,000/1,000 generated and solved.
- `npm run qa:audio`: approved originals and variants verified in Chromium. The match/combo count gate permits voice-cap skips because the approved single-voice policy intentionally prevents overlap after the shortened animation cadence.
- `npm run build`: PASS. Vite reports the pre-existing large Phaser bundle warning.

## Evidence policy

Gameplay screenshots were captured from the live Phaser canvas. The full playthrough uses mouse/touch-equivalent pointer events and does not mutate tile state to create a victory.
