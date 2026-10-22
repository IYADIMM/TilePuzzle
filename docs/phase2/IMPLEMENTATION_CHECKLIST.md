# Phase 2 implementation checklist

| Requirement | Primary files | Verification |
| --- | --- | --- |
| Adaptive board fills safe portrait region | `LayoutManager.js`, `BoardManager.js`, `GameScene.js` | responsive screenshots + geometry tests |
| Felt texture and vignette | `AssetFactory.js`, `GameScene.js`, `MenuScene.js` | runtime screenshots at four sizes |
| Ceramic depth, contact shadows, icon occupancy | `Tile.js`, `TileGeometry.js`, premium manifest | screenshot measurements + hitbox tests |
| Curated Levels 1–20 remain solvable | `LevelGenerator.js`, `levels.js` | 30-level solver suite + difficulty report |
| Six referenced themes use stable art mappings | premium asset pipeline and manifest | coverage test and CSV manifest |
| Debug cannot ship accidentally | `BoardManager.js`, Vite mode guard | automated production-flag test |
| Truthful, readable victory screen | `RewardScene.js` | genuine pointer victory screenshot |
| Player-friendly level journey | `LevelSelectScene.js` | navigation QA and screenshots |
| Shop cannot mimic live purchasing | `ShopScene.js` | player-facing copy assertions |
| Offline leaderboard is explicitly local | `LeaderboardScene.js`, menu copy | browser screenshot + text assertion |
| Interactive tutorial uses real tiles | tutorial controller + `GameScene.js` | genuine pointer tutorial QA |
| Save migration preserves tutorial/audio | `SaveManager.js` | migration and persistence tests |
| Approved audio remains byte-identical and synchronized | audio manifest/assets/events | hash tests + browser audio QA |
| No Supabase, ads, real payments, or analytics | source audit | forbidden-string/provider report |
| Compliance matrix and visual evidence | `qa/production-visual-ux/` | generated reports and gallery |
