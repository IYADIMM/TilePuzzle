# Bug Reproduction and Fix Report

## Corrected

- Match-three assumptions were replaced by one centralized match-two rule. The reducer removes both matching entries before exposing `full`, so the fourth tile can never cause a false loss when it completes a pair.
- Matching visuals are detached in the same commit. Independent proxies converge and fade while authoritative tray occupancy is already zero.
- Revive no longer rolls back only the last tile. It invalidates pending tweens, returns every unmatched tray tile to its original board position, clears highlights/maps/state, preserves prior cleared pairs and score, then charges the idempotent mock-economy transaction once.
- Partial and lost attempts now checkpoint board, tray, score, pair/combo count, elapsed time, revive state, used boosters and bounded Undo history. Reload restores the exact committed state.
- Match-three checkpoints are rejected by rule/generator version while permanent levels, currency, rewards and records survive migration.
- A migrated five-clear save with no queued chest now reconstructs `levels:1-5`; an already claimed chest is not recreated.
- Undo inventory is stored outside gameplay snapshots. A persistent count of 1 remains 1 through migration and reload; Undo does not refund itself.
- Pause now exposes a confirmed save-and-leave path. Restart explicitly discards only the active attempt.
- Shuffle now has visible staggered motion after solver validation. Hint search prioritizes the held symbol and returns the next two solver moves.

## Proof

- 66/66 unit tests passed.
- Genuine pointer match-two/Undo report: `qa/gameplay-report.json`.
- Genuine pointer loss, paid mock revive and reload report: `qa/production-correction/browser-report.json`.
- Full 36-pointer victory: `qa/QA_REAL_GAMEPLAY_REPORT.json`.
- 1,000 deterministic puzzles: `qa/production-correction/levels-1000-validation.json`.

## Remaining defects / risks

- Checkpoints keep the last eight Undo snapshots to bound localStorage growth; a player cannot resume and Undo more than eight historical moves.
- Save writes use primary-plus-backup localStorage rather than a database transaction. Quota failure remains gracefully recoverable but cannot provide cross-device sync.
- The Vite production bundle remains about 1.35 MB minified and emits the existing chunk-size warning.
