# Home Screen Implementation

The Phaser `MenuScene` was reconstructed around the approved hierarchy while preserving the existing 540×960 logical canvas and responsive scaling.

Implemented live controls:

- Settings opens approved audio/settings UI.
- Currency display reads the authoritative saved coin balance and opens the offline mock shop.
- Play/Resume uses the current campaign or active Garden Treasures attempt.
- Tile Styles opens the existing dual-style gallery.
- Levels, Collection, My Records, and Achievements route to their production scenes.
- Treasure Trail reads the real milestone state and opens the real treasure flow.

Visual changes include Cormorant Garamond display typography, a generated lotus title motif, style-aware hero tiles, one dominant raised green play action, raised ivory secondary controls, consistent gold/mahogany depth, and stable pressed feedback. Button input locks prevent rapid double-routing without making scene state depend on animation completion.

Screenshots were captured at 360×640, 390×844, 430×932, and 768×1024. All production controls exceed the 48 dp logical target in the game's portrait coordinate system.
