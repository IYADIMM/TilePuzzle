# Tile and tray geometry

The old tray used nominal `slotGap` positions and a generic height constant. The artwork actually had asymmetric recess centers, so first/fourth tiles were pulled inward and every tile sat low.

The runtime tray is now measured at 1024×400. Safe slot interiors are:

| Slot | Source bounds (L,T,R,B) |
|---|---|
| 1 | 64, 94, 265, 282 |
| 2 | 300, 94, 492, 282 |
| 3 | 528, 94, 720, 282 |
| 4 | 757, 94, 958, 282 |

Each receives a 10 px horizontal and 12 px vertical safe inset before world scaling. Tile scale uses the measured visible alpha bounds of the 512×640 body (`19,13–492,626`), not the transparent texture rectangle. Vertical seating compensates for the body sprite’s optical center. Board shadows are hidden while a tile is seated in a recess.

`browser-geometry-and-qa-mode.json` records 32 passed states: one through four unmatched tiles, two styles, and 360×640, 390×844, 430×932 and 768×1024 viewports. All selections used pointer input. No body crossed its safe slot rectangle.
