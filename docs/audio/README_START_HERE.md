# Jade Garden Tiles — APPROVED Audio Integration Package

**This is a production-engineering handoff, not a complete ready-to-ship audio pack.**

## Verified contents

- 12 locally generated and user-approved SFX OGG files (including both tray-placement alternatives), with MP3 alternatives and archival WAV masters.
- 2 locally generated and user-approved music tracks, each OGG + MP3 and master WAV.
- A listening montage, event map, QC metrics, file hashes, reproducible original sound synthesis source and detailed Codex instructions.

## TWO REQUIRED USER-APPROVED ElevenLabs files are NOT inside this ZIP

- `tile_select` — original approved ElevenLabs 0.64 s ivory ceramic tile selection recording.
- `level_complete` — original approved ElevenLabs ~2.48 s victory flourish.

**Preserve both exact files.** Download original recordings from the user's ElevenLabs flow (`k799Co5X2rLuQ7EGsCku`). Put them at `Assets/ElevenLabs_Originals/tile_select.mp3` and `Assets/ElevenLabs_Originals/level_complete.mp3` inside the extracted pack, or provide separately to Codex. Do not regenerate, replace, pitch-shift, recompose or emulate them.

**Rejected original:** ElevenLabs `tile_place` v1. Do not use.

Both `tile_place_v2_A` and `tile_place_v2_B` are approved. A is the default; B can be an optional quiet same-event variation if and only if it passes in-game mix tests.

## Ordering and safety

1. Preserve audit-remediation work (local branch `codex/audit-remediation`, commit `f2a4f73`) as starting point, verify it in Codex's local repo. Do NOT merge or change main.
2. Create a fresh child branch `codex/audio-integration` based on the audit branch, after checking clean working tree.
3. Read `Docs/CODEX_AUDIO_INTEGRATION_PROMPT.md` and use supplied audio.
4. Implement all available sounds first, leave exact approved ElevenLabs file references awaiting user-provided originals if absent. Do not use fake stand-ins.
5. Add both originals, test all gameplay events and phone mix. No user-approved file gets silently changed.
6. Provide browser/device evidence and test report, then commit on child branch; no push or merge without owner approval.

No Supabase, billing, advertising or general art refactor in this particular integration milestone.
