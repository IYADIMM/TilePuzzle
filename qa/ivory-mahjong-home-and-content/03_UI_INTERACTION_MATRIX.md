# UI Interaction Matrix

| Home control | Destination | Evidence | Status |
|---|---|---|---|
| Settings | `AudioSettings` | genuine pointer route | PASS |
| Currency | `Shop` | genuine pointer route | PASS |
| Play/Resume | `Game` | genuine pointer route | PASS |
| Tile Styles | `TileStyleGallery` | genuine pointer route | PASS |
| Levels | `LevelSelect` | genuine pointer route | PASS |
| Collection | `Collection` | genuine pointer route | PASS |
| My Records | `Leaderboard` | genuine pointer route | PASS |
| Achievements | `Achievements` | genuine pointer route | PASS |
| Garden Treasures card | bonus `Game` | genuine pointer route | PASS |
| Garden completion | `Reward` | 24 legal pointer selections | PASS |

`browser-report.json` contains the route results, hitbox bounds, four viewport captures, all 24 pointer-selected tile IDs, and the persisted post-completion state. The stale audio QA play coordinate discovered during acceptance was updated from the old menu geometry to the new primary button location.
