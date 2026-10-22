# Jade Garden Tiles — Production Master Specification v1.0

**Approval:** Gameplay mechanics completed per external Codex audit report dated 2026-10-22; visual/style and release QA still pending. Local audio v2 assets and two original ElevenLabs recordings approved by owner. This spec is a *release plan*, not evidence of deployed features.

## Product identity

A relaxing, polished Mahjong-side-access, layered tile-matching puzzle game with a **four-slot transactional tray**, premium pastel/ivory material language, distinct themed symbols, meaningful progress and fair optional monetization. Mood: soothing, tactile, clean and readable; no noisy visual clutter or loud UI. The game must remain functional when audio is muted and when offline.

## Immutable core rules (Gate G0)

- Exactly 4 active tray slots, validated 3-identical-tile atomic clear, no fake wins or user/client manipulation of official scores.
- Respect genuine Mahjong top+both-side blocking and committed state transitions; Undo snapshots and stale callbacks cannot break reducer.
- 30 current levels all available, proper level navigation, correct score-derived stars and highest replay stars, combo timing, offline progress persistence and repair.
- Base case evidence from Codex: 50/50 tests, 30/30 solver, 36-click real pointer victory; **not independently re-run by this assistant**.
- Never merge unfinished QA/code into main; snapshot and audit before new phases.

## Sound gate G1 — next engineering milestone

- Use approved local audio pack v2 (12 SFX candidate files incl. 2 placement variations, two background music tracks).
- Retain exact user-approved ElevenLabs selection tap and victory chime: both MUST be manually exported; not present in ZIP. Rejected original placement v1 never used.
- Centralized Phaser AudioManager, browser gesture unlock, separate music/SFX controls with stored preferences, quiet default levels, voice cap/debounce, graceful failure silence, mobile interruption/resume, seamless BGM transitions.
- Audio must only fire for legitimate actions and wins; all existing mechanics tests remain green.

## Visual and content gate G2

- Finalize master ivory tile proportions, face shadow/contact depth, collectible tile icon scale, tray, button design, reward icon style, camera crop and background dimming.
- Codex says 12 original raster symbols (Fruit + Cars) and 60 procedural fallbacks; **not release ready** until every visible icon for target launch chapter is premium and consistent.
- Build one visually cohesive 20-level chapter with tutorial and human-tested solutions before producing many themed icon assets.
- Use consistent image creation/export naming, atlas pipeline, accessibility/contrast tests and device viewport screenshots.
- Later complete 72 validated symbols and additional themed asset families; long-term ambition of 320 icons only if useful after launch.

## Online identity/leaderboards gate G3

- Use existing user-approved Sydney Supabase project `lbkjfjrjdnljamvsbbhq`; DB migrations and four tables exist and were security-checked.
- Keep Supabase integration on a separate phase and branch after audio, use official authentication and verified server scoring.
- Online score service must verify replay, challenge/level version and server-computed rank and reject client-supplied score/trust.
- Keep anonymous offline progress as unverified; only online validated runs reach official leaderboard. Friends scores only when actual relationship feature exists.
- Enforce profile ownership, RLS, data security and audit.

## Progression and fair economy gate G4

- A 20-level first-chapter playtest candidate; ~60–100 well-tuned levels before soft launch, subject to evidence.
- Collect difficulty metrics: legal choice count, forced moves, required lookahead, loss rate, completion time, tray pressure, undo/booster usage; tune based on uninformed human play, not solver alone.
- Coins, gems, rewards and purchases must use auditable server ledger and replay/idempotency controls before any real monetization. Existing economy is mock-only; do not confuse it with safe real-money fulfillment.
- Daily streaks, chests and collectibles need explicit cooldown, anti-duplicate and recovery semantics.

## Store/product gate G5

- Android App Bundle and appropriate Capacitor/native shell, lifecycle, save migration, sign-in linking, offline handling, app links and clear opt-in permissions. iOS later after tested Android baseline.
- Ad SDK/reward validation and in-app billing or lifetime no-ads require official platform compliance, full privacy disclosures and correct user entitlement restoration.
- All generated/purchased assets need commercial rights documented (including original ElevenLabs recordings).
- Privacy policy, support contact, account deletion if accounts, age rating, truthful screenshots/store listing and platform-appropriate data disclosures.
- Check up-to-date Google Play/Apple policies immediately before submission, not only this historical document.

## Performance & QA gate G6

- Target responsive portrait screens including 360x640, 390x844, 430x932, modern iPhones, tablets and low-end Android, safe area and pointer correctness.
- Load smaller optimized texture atlases, memory budget, lazy-load, bundle splitting when justified and robust context-loss handling.
- Real devices, offline sessions, interruptions, corrupt save recovery, rapid multitouch, Undo+Shuffle, long sessions, frame timing and network failures. No invented claims of device QA.
- Audio QA must include actual speaker/headphone listening and audio-unlock path on iOS/Android. Visual QA includes screenshots and manual owner approval.

## Soft-launch gate G7

- Controlled closed testing on real users. Monitor tutorial completion, level 1/5/10/20 progression, crashes, session length, D1/D7 retention, uninstalls, rage quits and spend/ads sentiment.
- Fix biggest funnel and quality issues before broad release; 100 levels or 320 assets without retention is not a business case.

## Execution sequence and branch policy

1. **G0 audit finished per Codex report**, source report not inspected here; preserve local branch/commit.
2. **G1 sound integration** next, from clean audit branch child; collect actual approved ElevenLabs MP3 originals.
3. **G3 secure Supabase** once audio branch passed QA; use separate integration branch and existing backend handoff.
4. **G2 polish first chapter** and ensure all shipped symbols are premium, then extend release content.
5. **G4 economy**, G5 stores, G6 QA, G7 soft launch. A test group may review G2 concurrently after G1 but no risky branch merges.

## Non-negotiable acceptance report for each phase

Commit/branch, all changed files, explicit before/after evidence, passed and failed tests, real-device vs emulator distinction, user-visible limitations, regression assurance, new dependencies/licenses, and unresolved blocker list. Do not state 'commercially publishable' before G0–G6 all pass and human visual/audio acceptance is complete.
