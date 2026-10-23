# Main QA Fixes — Compliance Matrix

Date: 2026-10-23  
Branch: `codex/main-qa-premium-corrections`

| Requirement | Status | Evidence |
|---|---|---|
| Match-2 and four-slot tray remain authoritative | PASS | `tests/slot-state.test.js`; tray visual browser report |
| Atomic clear before loss evaluation | PASS | reducer tests and `qa/final-acceptance/tray-visual-report.json` |
| Unlocked journey plus exactly one mystery level | PASS | fresh, 10, 999, and 1000 model tests; browser screenshots 01–02 |
| No locked theme/name/icon spoilers | PASS | mystery cards contain only level number, `?`, and generic copy |
| Production direct-route gating | PASS | requested level 999 resolved to unlocked level 10 in browser QA |
| Solver-backed hint; no arbitrary fallback | PASS | `BoardActions.planHint`, stale revision guard, tests |
| Hint prefers a held match and charges once on delivery | PASS | unit and browser QA; pending-action guard prevents rapid double charge |
| Shuffle is solvable, non-noop, and multiset-preserving | PASS | preflight solver plan, visual proxies, tests and browser report |
| Shuffle commits display state after symbol travel | PASS | icons are detached into travel proxies; live icons update after travel |
| Explicit leave/restart abandonment semantics | PASS | destructive confirmation, checkpoint cleared, permanent state preserved |
| OS/browser interruption resumes exact checkpoint | PASS | `qa/production-correction/browser-report.json` |
| Pause contains Resume/Main Menu/Restart | PASS | screenshot 05 and 44px action hit regions |
| No routine camera shake | PASS | match and shuffle shake removed; completion flash remains |
| Faster overlapping tray motion | PASS | flight 260ms, clash 80+135ms, compaction 135ms |
| Responsive premium tile geometry | PASS | body aspect is preserved; position spacing compresses independently |
| Tray body fits recessed slot | PASS | geometry test and screenshot 04 at portrait viewport |
| 1,000 deterministic levels still solve | PASS | `qa/production-correction/levels-1000-validation.json` |
| Approved audio preserved | PASS | original hashes, variants, mute, placement, match, and completion browser audit |
| Premium raster inventory preserved | PASS | no runtime art asset was removed or replaced; 87-asset manifest remains intact |
| Physical Galaxy A-series verification | NOT VERIFIED | No physical Android device was connected in this environment |
| Human visual approval | PENDING | Runtime evidence is supplied; no approval is claimed for the user |

No Supabase, advertising SDK, payment processing, adaptive quality mode, or new clash sound was added.
