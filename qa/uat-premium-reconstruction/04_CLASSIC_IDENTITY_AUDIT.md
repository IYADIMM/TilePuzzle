# Classic Mahjong identity audit

- 36 authored source motifs and 72 optimized runtime textures are present.
- Mapping across all 72 game identities is deterministic and injective.
- Every live level contains six unique logical identities and six unique Classic texture keys.
- Style changes only texture resolution; `typeId`, tile instance IDs, solution order, seed, board state, tray state and score are unchanged.
- The second 36 textures retain a visible edition seal so they are not byte-identical to the first 36. Collections do not mix identity groups in one puzzle.
- Classic face scale was increased independently from Illustrated Garden to improve small-screen legibility.

Unit tests and `qa/rea-benchmark/dual-style-browser-report.json` passed. Traditional art quality remains PLAYER VISUAL APPROVAL PENDING; the system does not claim that injective keys alone establish aesthetic clarity.
