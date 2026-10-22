# Jade Garden Tiles — Production Design System

This file is the UI source of truth for Phase 2. The supplied visual references override generic style-search suggestions.

## Visual language

- Dark desaturated emerald felt with fine matte grain and a calm, gently brighter play center.
- Glossy ivory ceramic tile faces, warm neutral sidewalls, soft upper-left lighting, and physically plausible contact shadows.
- Dark mahogany framing with restrained warm-gold trim. Gold is an accent and reward color, not a full-screen fill.
- Premium illustrated symbols with clean alpha edges, strong silhouettes, optical centering, and approximately 75–85% inner-face occupancy where the subject permits.
- Fredoka for playful display copy and Poppins for compact functional copy. Minimum production HUD copy is 13 design pixels on the 540×960 canvas.

## Layout tokens

- Design canvas: 540×960 portrait, responsive camera fit.
- Minimum interactive target: 48×48 design pixels.
- Spacing rhythm: 4, 8, 12, 16, 24, 32.
- Game board gets the largest usable region after safe HUD, tray, and booster reservations.
- Tiles are softly wider than tall in screen presentation, with face input matching visible ceramic bounds.

## State language

- Selectable: bright ivory, full-color icon, crisp highlight, deeper contact shadow.
- Blocked: recognizable icon with restrained jade veil and reduced specular response; never near-invisible.
- Pending pair: soft gold rim and breathing shimmer, disabled by Reduced Motion.
- Locked content: readable silhouette and explicit lock copy; never communicated by low opacity alone.
- Test-only commerce: explicit INTERNAL TEST label and no purchase-like premium CTA in production views.

## Motion

- Press feedback: 60–100 ms without layout shift.
- Board/tray travel: spatially continuous eased curves.
- Reward entrance: 300–450 ms, skippable, and reduced-motion aware.
- Avoid flashing, endless glow, and large repeated overshoot.

## Accessibility and safety

- Text contrast target: at least 4.5:1; meaningful boundaries and icons at least 3:1.
- All primary controls use at least 48×48 hit areas.
- Debug overlays require both development mode and an explicit query flag.
- Player-facing screens never present offline demo competitors as live online ranks.
- No real payment, ad, analytics, or backend claims in this phase.

