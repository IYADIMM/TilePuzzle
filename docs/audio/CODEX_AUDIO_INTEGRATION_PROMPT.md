# CODEX TASK — JADE GARDEN TILES APPROVED AUDIO INTEGRATION

You are the Lead Phaser.js Audio Engineer and release QA owner for **Jade Garden Tiles**. The user explicitly approved the original procedural audio pack and TWO specific ElevenLabs sounds. **This task is audio-only.**

## Provenance, repo and immutable baseline

- Repository: `https://github.com/IYADIMM/TilePuzzle`. Use local checked-out repo, NOT a new repository.
- According to prior Codex report, the independent audit remediation is on local branch `codex/audit-remediation`, commit `f2a4f73`, clean tree, NOT pushed. Verify those facts; do not assume.
- Before any changes, inspect `git status`, current branch, head, diff, repo architecture, sound configuration, progression and test scripts. If dirty, preserve user changes and do not override them.
- Create a new clean child branch `codex/audio-integration` **from verified local remediation head**, rather than editing the remediation branch. Do NOT merge, force-push, push or reset main. Do NOT alter unrelated files.
- The reported remediation fixed immutable 4-slot tray matching, Mahjong top/side access, timer combos, star aggregation, honest win checks, 30-level navigation, save recovery and mock economy. All of these must remain correct.

## Assets & approval — critical

Read `README_START_HERE.md` and `Docs/ASSET_MANIFEST.json` in this archive.

**Approved ORIGINAL ElevenLabs assets — must preserve EXACT audio recordings:**
1. `tile_select` = first ElevenLabs approved ivory ceramic click (~0.64s). Source: user's connected ElevenLabs flow id `k799Co5X2rLuQ7EGsCku`.
2. `level_complete` = approved ElevenLabs victory chime (~2.48s). Same flow.

These binary files ARE NOT in this ZIP. Ask user to provide/download them into `Assets/ElevenLabs_Originals` (exact names) if not already local. You may implement all other audio and event mappings meanwhile; NEVER invent replacement versions for these two and NEVER accidentally use rejected `tile_place` v1. Final audio acceptance must be BLOCKED until the exact original recordings have been installed and tested. Do not claim these two files were integrated if absent.

**User-approved LOCAL audio included here**:
- `tile_place_v2_A` (primary placement); `tile_place_v2_B` (optional natural variation)
- `tile_match`, `tile_blocked`, `combo`, `ui_click`, `booster`, `chest_open`, `level_failed`
- optional `undo_optional`, `shuffle_optional`, `star_earned_optional`
- `music_gameplay_ambient`, `music_menu_ambient`

The OGG/MP3 are runtime options; original masters are in `Masters/WAV`. Keep asset mapping explicit and deterministic. Do not change approved sound design, substitute stock music or generate new audio.

## Implementation requirements

1. **Architecture**: inspect latest Phaser config; prior game intentionally disabled audio with `audio: { noAudio: true }`. Switch to playback only within this audio integration branch, applying Phaser-native APIs and version-specific feature checks. Gracefully support no audio capability, missing file, browser autoplay lock and resumed audio contexts.
2. **Audio manager**: one `AudioManager`/service (or appropriate established project architecture), with typed/documented sound event keys and centralized loading/preloading, scene transition behavior, audio preference storage and graceful fallbacks to SILENCE, not fabricated sounds. Ensure every in-game event passes through one place with minimal scene coupling.
3. **Event triggers (authoritative transitions only)**:
  - `tile_select` once for accepted tile tap.
  - `tile_place` only once when tile successfully arrives in four-slot tray. Choose A default; B optional variant at lower probability and never simultaneously with A.
  - `tile_match` exactly once after an atomic verified triple.
  - `tile_blocked` after an actually rejected blocked-tile attempt; debounce.
  - `combo` only when a valid consecutive combo is detected, not every three tiles.
  - `level_complete` exactly once after evidence-backed genuine completion.
  - `ui_click` on eligible UI actions without doubled tile sound.
  - `booster`, `chest_open`, `level_failed`, optional `undo`, `shuffle`, `star earned` on real committed states only.
  - menu and gameplay ambient music start/stop/crossfade predictably across scene transitions, avoid two overlapping music beds, save preference.
4. **Sound ergonomics**: independent Sound Effects and Music mute+volume settings (default both enabled but low background mix; user option to turn game fully silent). Persist preferences without interfering with existing progression save schema or mock economy. Touch targets >=44 CSS px equivalent, mobile safe areas, contrast, accessibility labels where possible.
5. **Performance**: OGG+MP3 fallback based on browser capability; use smallest asset suitable; cap simultaneous voices, enforce ~50-90 ms trigger minimum on repeated tap effects and suppress duplicates due to animations/tween callbacks. Set cautious sound levels; avoid clipping even on rapid taps, maintain performance on 360x640. Music should loop/crossfade without pop and not abruptly restart on every popup. Pause/recover correctly on app background, WebGL context loss, mobile interruption.
6. **Preload**: avoid loading large archival WAV masters at runtime. Verify file paths, MIME types and decoded buffer creation. Use optimized assets, lazy load music if appropriate. Keep no exceptions and playable silent fallback even when sources fail.
7. **Security & scope**: NO Supabase changes, no economy redesign, no advertising, no external SDK, no monetization, no new visual placeholder artwork, no unrelated refactor. No secrets added. Ensure audio stays user-gesture compliant in iOS Safari / Android Chrome.
8. **Tests**: Add unit tests for event emission and each mute/volume path, concurrency guards, failure-to-load, settings persistence/migration, scene crossfade, pause/resume, varying audio capabilities. Replace the prior '61s complete silence' smoke test with new expectations reflecting opt-in audio, and also test fully muted mode and silent fallback. Run existing 50 tests, 30/30 level solver and genuine 36-pointer victory checks again, plus visual/regression evidence for phone widths 360,390,430 and tablet. Record actual outcomes; do not claim device QA unless real devices were used.
9. **Proof**: supply files changed, manifest of assets copied to game, event-to-function mapping, screenshot of Settings audio controls, short gameplay capture/screenshots where available, automated test results, measured bundle size, supported audio codecs and any failing cases. Include original ElevenLabs license verification note for commercial release.
10. **Git**: keep clean new branch and one or more well-described commits. No remote push, PR or merge without explicit user approval. Summarize blockers separately; if two original ElevenLabs files absent, DO NOT invent them or mark 100% complete.

## Strict definition of done

- Every *supplied* approved SFX/BGM correctly plays on the intended event.
- The two exact ElevenLabs favorites are installed & audible, OR explicitly pending with a clear actionable request for those two MP3 files; not replaced.
- Pass regression suite, real pointer interactions, save migration, mute tests, graceful no-audio, mobile browser compatibility, repeat interactions, no clipping or music-loop pop, and report honest evidence.
- Player can completely mute audio.
- No change to game logic, offline mock economy or Supabase schemas.
- Local child branch and commit reported; no push/merge without approval.

If any requirement conflicts with current architecture, identify and justify a minimal safe adaptation. Don't skip or declare success without evidence.
