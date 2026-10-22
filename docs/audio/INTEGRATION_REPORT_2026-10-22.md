# Approved audio integration report — 2026-10-22

## Scope

This phase integrates the user-approved Jade Garden Tiles handoff pack into the existing audit-remediated Phaser game. It does not add Supabase, payments, advertising, or any other online service. Gameplay reducers, four-slot tray transactions, Undo snapshots, Mahjong accessibility rules, progression, save recovery, leaderboard logic, premium raster prototypes, and the offline mock economy remain intact.

## Authoritative originals

The two separately supplied ElevenLabs recordings are copied byte-for-byte and are loaded directly by Phaser:

| Runtime asset | SHA-256 |
| --- | --- |
| `public/assets/audio/tile_select.mp3` | `e12c4e4b761262ec278a65f6eec3ffb41b8c0d0517d1b0995c00121b6e8b573f` |
| `public/assets/audio/level_complete.mp3` | `a357be041b994207d85c52d8c194e6fd12ae6b5478e188d97cb1863bdfce0916` |

The remaining approved local assets use OGG first with MP3 fallback. The rejected first tile-placement version is not present. Source provenance, quality metrics, and the handoff manifest are retained beside this report.

## Runtime behavior

- `AudioManager` owns music, sound effects, debounce, concurrency, deterministic placement variation, crossfades, interruption recovery, and silent fallback.
- Audio unlock is attempted only from a user gesture. Missing or rejected playback never blocks gameplay.
- Music and sound effects have independent enabled flags and volume controls, persisted in save schema v5.
- Quiet defaults are 35% music and 55% SFX before each event's conservative mix coefficient.
- Menu and gameplay ambient beds crossfade and never intentionally stack.
- Accepted selection, tray arrival, atomic triple resolution, blocked input, committed boosters, failure, genuine completion, stars, and chest claims use their matching approved cues.
- Completion audio is emitted only by the existing board-clear victory path. Tray arrival is emitted only after the curved flight reaches the tray.
- A full mute control and separate Music/SFX toggles are available in the responsive `AudioSettings` overlay.

## Save migration

Schema v5 uses `jade-garden-tiles-save-v5` and backup key `jade-garden-tiles-save-backup-v5`. It reads v4 primary/backup and earlier records. The old v4 forced-silence flag migrates to the newly approved quiet defaults; explicit v5 audio preferences are preserved.

## Verification

`npm run qa:acceptance` passed on 2026-10-22:

- 59/59 Node tests passed.
- Vite production build passed.
- 30/30 generated levels remained solver verified and grid aligned.
- Real pointer gameplay, blocked-pointer routing, four-slot atomic clear, Undo, and genuine 36-pointer victory passed.
- Chromium decoded/cached OGG and MP3, exercised gesture unlock, persisted mute/restore, and recorded synchronized playback for selection, placement A/B, match, combo, blocked input, boosters, failure, completion, and star award.
- Muted gameplay remained playable with zero played events.
- Audio settings rendered at 360x640, 390x844, 430x932, and 768x1024.

Machine-readable results and screenshots are in `qa/audio/`. The browser run is headless Chromium emulation; it verifies decoded playback state and event synchronization, not physical speaker quality.

## Remaining release gates

- Listen on representative iOS and Android devices through speakers, wired headphones, and Bluetooth; verify autoplay recovery, interruption, and hardware volume behavior.
- Confirm the commercial license/provenance record for the approved ElevenLabs originals before store submission.
- Have the product owner approve the integrated mix in context. Automated checks do not constitute subjective audio acceptance.
- Resolve the existing production bundle-size warning through code splitting before final publication hardening.
- Visual approval remains independent; only twelve of the planned seventy-two icon assets currently use the premium raster pipeline.
