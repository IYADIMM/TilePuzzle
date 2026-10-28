# Ivory Mahjong brand inventory

| Class | Original | Location | Action |
|---|---|---|---|
| A visible | Jade Garden Tiles / JADE GARDEN | web, menu, Android, listing | Replaced with Ivory Mahjong |
| A visible | Garden Cleared, Back to Garden, My Garden Records | reward/records | Rewritten naturally |
| B build | `jade-garden-tiles`, `Jade-Garden-Tiles-*` | npm/artifacts | Migrated to `ivory-mahjong` / `Ivory-Mahjong-*` |
| C permanent | `com.iyadimm.jadegardentiles` | Capacitor/Gradle/Java | Retained for update compatibility |
| C persistent | `jade-garden-tiles-save-*`, `garden-player`, achievement IDs | saves/rules | Retained; visible default name becomes Player |
| D historical | old QA/audits/prompts | `qa/`, historical docs | Retained for accuracy |
| E gameplay | Fruit Garden, Blooming Garden, Illustrated Garden | themes/styles | Retained as collection terminology |
