# Main QA Fixes — Remaining Issues

1. Physical low-cost Android verification is still required. Headless Chromium results are not evidence for Samsung Galaxy A-series thermals, touch firmware, speaker quality, or sustained GPU behavior.
2. Final visual acceptance remains a human art-direction decision. The live build is materially improved, but this report does not mark the premium-art gate approved.
3. Phaser remains in a single large JavaScript bundle; Vite reports a roughly 1.36 MB minified chunk. Code splitting and boot-time profiling are future release-hardening work.
4. Hint and shuffle searches are node-bounded and deferred to the next task, but still execute on the browser main thread. Current 36-tile boards test quickly; a Worker migration would provide stronger isolation if future board sizes grow.
5. Online leaderboard, Supabase, real advertisements, and real-money purchases remain intentionally out of scope. The current leaderboard/economy are local/mock systems.
6. Audio QA verifies browser playback, event synchronization, variants, mute behavior, and original hashes; final speaker mixing still needs physical-device listening.

Production readiness assessment: gameplay correctness and browser regression quality are strong, but publishing should wait for physical Android profiling, store/privacy packaging review, accessibility review, and explicit visual/audio sign-off.
