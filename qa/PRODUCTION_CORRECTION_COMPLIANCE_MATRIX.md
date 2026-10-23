# Production Correction Compliance Matrix

Generated: 2026-10-23. Branch: `codex/jade-production-correction-premium-parity`.

The later Critical Gameplay Correction Add-on supersedes the older match-three lock. The implemented rule is match-two with exactly four tray slots.

| Requirement | Status | Evidence |
|---|---|---|
| One authoritative match size | Passed | `src/logic/GameRules.js`; `MATCH_SIZE = 2` |
| Atomic pair clear before loss | Passed | `src/logic/SlotState.js`; 70 unit tests; `qa/gameplay-report.json` |
| Four unmatched tiles lose | Passed | Genuine pointer defeat in `qa/production-correction/browser-report.json` |
| Four-slot tray remains fixed | Passed | `TRAY_CAPACITY = 4`; reducer and browser checks |
| Immutable transaction and detached visuals | Passed | Frozen reducer output; zero active tray visuals after clear |
| Mahjong top/side accessibility | Passed | Solver/input share `computeAccessibility`; interaction report |
| Full rendered-body web hitbox | Passed | Board-level uppermost-tile router; four expanded-edge taps, lowest-row edge and four portrait sizes in `qa/final-acceptance/interaction-report.json` |
| Pair-aware generator and solver | Passed | 1,000/1,000 validated in `levels-1000-validation.json` |
| Recognizable rotating silhouettes | Passed technically | Twelve deterministic layout IDs including heart, butterfly, flower, star, bear and car |
| Hint prefers completing held pair | Passed | Solver priority weights matching tray type; hint requests two moves |
| Visible Shuffle motion | Passed | Revalidated shuffle plus staggered tile motion |
| Undo exact gameplay snapshot | Passed | Pair-clear Undo browser QA and immutable snapshot tests |
| Undo inventory never refills | Passed | Save round-trip regression retains count 1; failed Undo does not charge |
| Revive empties tray and restores all four | Passed | Genuine loss/revive browser scenario; score and match count preserved |
| Crash/reload checkpoint | Passed | One-tile tray/board state restored exactly after page reload |
| Old match-three attempts invalidated safely | Passed | Permanent progress retained; only incompatible active attempt cleared |
| Treasure 5/5 migration | Passed | Missing unclaimed milestone reconstructed once; claimed milestones not requeued |
| Pause to main menu | Passed | Save-and-leave confirmation and resumable attempt |
| Match-two scoring, tutorial, reward copy | Passed | Runtime and unit evidence |
| Approved audio preserved; varied selection/win cues; no new clash cue | Passed technically | Approved hashes unchanged; three-choice no-repeat shuffle bags; decoded WAV/MP3/OGG browser report passed |
| Original branded install icon | Passed technically | Store master, transparent Android adaptive foreground, opaque iOS/PWA master and manifests under `public/assets/brand/` |
| Shop individual previews and honest inventory | Passed | Tile, tray, celebration and three booster previews replace T/C/B badges; Owned/Equipped/Available and booster counts use saved inventory; mock-only label retained |
| Premium raster coverage for all 72 icons | Passed technically | 72 PNG source masters, 72 optimized WebPs, zero normal-runtime SVG fallbacks; twelve live collection captures |
| Unique native raster body for 12 materials | Passed technically | 12 PNG source masters and optimized material WebPs selected per theme |
| Sustained desktop-browser endurance | Passed technically | 15 minutes, 71 levels, 2,631 genuine pointers, zero errors; `qa/performance-soak/browser-soak-report.json` |
| Affordable Samsung A-Series performance | Not verified | Headless desktop Chromium only; physical Android profiling still required |
| Visual approval | Pending user review | Technical integration does not grant visual acceptance |
| Store/ads/Supabase/real payments | Intentionally absent | Offline mock economy only |

Production readiness remains **internal alpha**, not store-ready, because artwork still requires user visual approval and no physical Android performance pass has been run.
