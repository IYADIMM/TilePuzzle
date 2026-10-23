# UX and Difficulty QA

## Verified

- Level 1 retains 36 tiles and two layers; levels scale deterministically to 60 tiles and five layers.
- Mahjong accessibility remains shared by input, dimming, hint, shuffle, and solver.
- The tutorial observes real gameplay events and never mutates tile state to manufacture progress.
- A real solver sequence completes Level 1 using 36 pointer clicks.
- One unmatched tray tile remains; the second identical tile clears the pair atomically before loss evaluation.
- Four unmatched entries produce a legitimate tray-full state.
- Undo restores the exact pre-transaction snapshot.
- Level completion requires zero board tiles, zero tray entries, no active transaction, and complete selection/pair evidence.

## Early-player readability

- Active tiles retain full ivory/icon brightness.
- Blocked tiles use a restrained emerald veil and lower icon saturation without becoming invisible.
- Tap routing covers the complete rendered tile body, including all four outer edges and the lowest visible strip beyond the nominal board region.
- The first-run tutorial explains free edge, blocked tile, newly exposed tile, matching pairs, and four-slot danger in concise steps.

## Remaining device QA

- Physical affordable Android device profiling is still required for thermal behavior, memory pressure, long-session frame pacing, WebAudio interruption, and touch latency.
- Difficulty telemetry from real players is not available; level tuning is solver-verified but not yet retention-tested.

