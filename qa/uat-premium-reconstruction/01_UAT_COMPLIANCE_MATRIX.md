# UAT compliance matrix

Date: 2026-10-24. Branch: `codex/uat-premium-reconstruction-v1`.

## Four player-reported visual failures

| Finding | Result | Evidence |
|---|---|---|
| Illustrated art lacked sharpness/premium scale | IMPLEMENTED; PLAYER VISUAL APPROVAL PENDING | Larger face occupancy, preserved 512 px transparent WebP sources, real captures in `screenshots/illustrated-*` |
| Classic symbols unclear | IMPLEMENTED; PLAYER VISUAL APPROVAL PENDING | Classic faces render larger; 72-key mapping remains injective; dual-style browser report passed |
| Ceramic body lacked convincing polish/depth | IMPLEMENTED; PLAYER VISUAL APPROVAL PENDING | New original `tile-body-master-v2.png` and optimized runtime WebP |
| Tray tiles did not fit four recesses | BROWSER VERIFIED | New tray master, measured slot bounds, 32/32 geometry states passed |

## Six protected passes

Match-2/four-slot loss, exposed-face tapping, top-tile targeting, fluid motion, persistent Undo inventory, and Revive score/tray behavior all remain AUTOMATED TEST PASSED and BROWSER VERIFIED. The full acceptance chain completed with exit code 0.

## Twelve formerly unverified checks

| Check | Result |
|---|---|
| Solver-supported Hint | AUTOMATED TEST PASSED and browser acceptance passed |
| Visible real Shuffle redistribution | BROWSER VERIFIED; inventory charged only after success |
| Leave/reload/restart recovery | BROWSER VERIFIED |
| Live style preservation | BROWSER VERIFIED; gallery now closes back to live board |
| Exactly one mystery level | AUTOMATED TEST PASSED |
| Treasure Trail unlock/claim idempotence | AUTOMATED TEST PASSED; isolated QA scenario available |
| Recognizable level silhouettes | 1,000-level report verifies 12 deterministic shape families; visual approval pending |
| Professional screens/buttons | IMPLEMENTED; PLAYER VISUAL APPROVAL PENDING |
| Jitter/freezes | Browser soak passed; isolated long frames remain documented |
| Rapid taps | AUTOMATED TEST PASSED and browser pointer tests passed |
| Both styles extended play | Browser dual-style and soak suites passed |
| Physical Galaxy A-Series | PHYSICAL DEVICE TEST PENDING |

No player visual approval is asserted by this report.
