# JADE GARDEN TILES — CODEX MASTER PROMPT 02
## Final v2 · Post-Audio Visual, Art, Board & UX Production · Six Collection Art Sheets

**ROLE:** Act as Principal Phaser Game Engineer, Lead Casual-Mobile Game Designer, Senior UI/UX Art Director, Technical Artist, and QA Lead.

**REPOSITORY:** Existing `IYADIMM/TilePuzzle` project (Jade Garden Tiles). Do not create a new project or replace the game.

**BASELINE:** The independent-audit remediation is on local branch `codex/audit-remediation`, commit `f2a4f73`. The approved audio integration is being implemented on a successor branch. **Start from the latest successfully completed and tested audio-integration commit, not from `main` or an older branch.** First verify branch/commit, clean working tree, and tests. If audio is incomplete, do not silently discard it: report the baseline conflict and preserve it.

**REFERENCE MATERIAL:** Examine the existing repository and QA folders, especially `qa/premium-art/`, `qa/audit-remediation/`, `qa/audit-final-evidence/`, `assets/premium/README.md`, and **all 12 reference images supplied with this handoff**: six actual gameplay/QA images and six new themed collection concept sheets. Confirm actual paths rather than assuming they exist. The six collection sheets are **art-direction/contact-sheet references, NOT production atlases or per-tile sprite files**. Refer to `REFERENCE_IMAGE_INDEX.md`. The game must show original, independently authored and approved runtime assets, never a collage or cropped screenshots misrepresented as sprites.

## NON-NEGOTIABLE INSTRUCTIONS

1. Read this entire instruction set carefully and independently audit the current code and visual state before modifying anything. Produce a requirements-to-file-to-test checklist and use it throughout execution.
2. **Implement corrections, not merely recommendations, mockups, fake screenshots, or an audit report.** Do not declare completion based only on a unit-test count.
3. Preserve immutable four-slot tray semantics, valid Mahjong top/side blocking, genuine completion evidence, input transaction safety, atomic triple clears, Undo snapshots, combo and star rules, honest level scoring, 30/30 solvable level catalog, save migration, all 30 level navigation, mock economy integrity, and the newly approved audio. The two user-approved ElevenLabs sounds (tile_select and level_complete) take precedence over any local synthesized substitutes. Never restore rejected tile_place v1.
4. Make ALL work on a new local branch named `codex/production-visual-ux-v1` created from the correct audio-integration commit. No `main` changes. Do not push or merge without explicit permission.
5. Do not implement Supabase, advertising networks, real payment processing, external analytics SDKs, or live economy transactions in this phase; they are separate milestones. Keep interfaces compatible with later integration.
6. No unlicensed stock art, copyrighted commercial-game icons, unauthorized screenshot cropping, or placeholder-generated production claims. Preserve original premium art already accepted and its provenance.
7. Avoid breaking changes and uncontrolled refactors. Every modified subsystem must have tests and before/after evidence. Minimize expensive image generation; complete an excellent first chapter before requesting/creating hundreds of assets.
8. Never describe fake rank, imaginary competitors, simulated economic value, or mocked premium entitlement as real online achievements.

## WHY THIS PHASE IS NECESSARY — EVIDENCE FROM THE SCREENSHOTS

- **Fruit/Cars comparison:** The middle approved reference is richly detailed with large readable tiles, strong icon silhouettes, convincing ceramic depth, and intentional layering. The actual live Phaser output on the right is comparatively tiny, compressed and visually sparse, with hard-to-identify blocked/background tiles and large unused space. Correct this gap in the *running game*, not just a static image.
- **Gameplay debug screenshot:** Tile IDs, blocking flags, coordinates and debug boxes obscure icons. Debug HUD is allowed only under a deliberate development-only flag and must be impossible to accidentally ship enabled.
- **Victory screen:** The score numerals are dark, bulky and difficult to read on a cream panel; many labels are tiny. Improve hierarchy, typography, contrast, spacing and balance. The offline `RANK #12` or equivalent must not impersonate an online competitive standing; show an honest offline/pending state until real verification exists.
- **Level Journey:** Locked cards are excessively dim and generic, information is small, and internal phrases like `solver-verified boards` appear to players. Replace internal jargon with inviting player-facing copy, show clear lock/unlock and earned-star states, and keep all 30 levels accessible through sensible navigation.
- **Shop:** Prices/reward quantities and mock-only commerce states need clear presentation. `ACTIVATE PREMIUM PREVIEW` must NOT resemble a real purchasable premium entitlement in a public build. Preserve the offline mock economy for internal tests, but gate or label it appropriately.
- **Current art coverage:** Only 12 native premium raster symbols (Fruit and Cars collections) are integrated; approximately 60 remaining symbols still use procedural fallbacks. Twelve collection-specific tile material families are unfinished. Do not misrepresent these as launch-ready.

## ART DIRECTION PRIORITY & NEW SIX CATEGORY REFERENCES

The user has now provided **six additional thematic asset concept sheets**. Treat them as important approved *directional references* for theme identity, symbol subjects, detailed illustrations, lighting, ivory ceramic materials, subdued dark emerald felt background, wood trim, and overall cohesive premium design. They show rows of tiles on wooden shelves as **catalog displays**; this is NOT a request to change the actual layered Mahjong board to rows or wooden shelves. The actual gameplay **must remain a layered tile-match puzzle**.

**Collection-specific guidance (inspect every sheet and derive an auditable per-category plan):**

1. **Fruit Garden** — bright recognizable fruit silhouettes, carefully outlined colorful illustrations, consistent saturation; apples, bananas, pears, kiwi, citrus, berries and the other illustrated fruits are candidate motifs, **not a guaranteed canonical typeId list**.
2. **Dream Garage** — unmistakable different vehicle silhouettes, varied body colors and car/truck/motorcycle types, detailed but not photorealistic, avoid tiny indecipherable details.
3. **Champions Club** — balls and sports equipment, medals, trophies and sports accessories; confident strong silhouette with consistent scale and a unified sport-illustration language.
4. **Master Garage** — tools and garage hardware, including spanners, hammers, screwdrivers, drills, gears, hand tools and workshop items; instantly recognizable for gameplay at small size.
5. **Wild Safari** — charming but credible illustrated wildlife, distinguishable fur/shape/color markings, intentional wildlife diversity and readable heads/whole silhouettes.
6. **Cozy Companions** — appealing friendly illustrated domestic pets and small animals, expressive but not overly cartoonish; soft balanced color palette and clean tile silhouettes.

Each sheet depicts **about 30 tiles, including some repeat subjects**. **Do not treat its 30 tiles as a mandate to create 30 distinct production icons, or assume that the six sheets automatically mean 180 verified game symbol types.** First inspect the source catalog's stable `typeId` mappings, documented collection counts and current rule that matching uses IDs not visual similarity; build a per-collection typeId-to-art mapping. Keep old saved games compatible. If the production roadmap calls for 16 distinct symbols per collection, reconcile that against the code's actual schema rather than inventing IDs.

**Reference precedence and conflicts:** Preserve proven mechanics, accepted original per-symbol raster assets and approved audio first. Use these six sheets as primary *theme-specific artwork and texture* references; use prior premium gameplay references as primary board-layout and HUD-polish references. If the references conflict about illustration finish, choose one consistent polished illustrated look across all collections, document any proposed change, and do not silently discard existing approved assets. Note the reference banners are decorative concept typography, not text to paste into game UI. Normalize the brand to **Jade Garden Tiles** and avoid reproducing the accidental double word in the Cozy Companions heading.

**Asset creation is not a screenshot-cropping task:** Every production icon must have an independently usable transparent source, consistent trim/lighting/scale, a matching stable catalog/typeId entry, correctly optimized runtime file, and documented source/provenance. A perspective-distorted tile from a reference sheet cannot simply be cropped and shipped as a game sprite. No ref pixels should be cut out and labeled as an original production master. The sheet can instead guide new individual illustrations through the existing asset pipeline; preserve rights and note generated/derived provenance.

## PHASE A — PRIORITY 0: FIX GAMEPLAY PRESENTATION

**A1. Responsive board sizing.** Inspect the true usable gameplay viewport (including top HUD, tray, booster controls, safe areas, and short-screen constraints). Fit every board with a layout algorithm based on visible tile bounding boxes and overlap depth; maximize perceptual tile size while NEVER clipping hit areas, tray, top bars or controls. Keep coherent margins and intentional silhouette. Test 360×640, 390×844, 430×932, 768×1024, and desktop. Ensure touch target comfort where practical and font readability at 360×640.

**A2. Depth and selectability.** Make tile thickness, contact shadow, overlap order and raised selectable status immediately readable. Add a distinct **soft physically plausible contact shadow** under every stacked tile, slightly deeper/darker at higher layer separations and directly below exposed face edges. Favor cached/lightweight shadow textures or batched effects over expensive individual full-frame Phaser postprocessing filters. Confirm shadows follow moving tiles and remain aligned under scale/zoom and all device sizes. Preserve logical blocking exactly. Background/covered tiles may dim slightly but remain recognizable; selectable tiles must be more legible and prominent. Avoid opacity so extreme that players cannot plan moves. Add a very subtle optional idle highlight after inactivity, with reduced-motion support; no excessive glow or flashing.

**A3. Board shape and difficulty.** Rework visually chaotic layouts into curated, intentional silhouettes, especially Levels 1–20. Reduce extreme overlap on early levels while preserving actual solvability and genuine Mahjong side/top access. Every level must be replay/solver validated after modifications. Do not alter rules merely to make screenshots prettier. Track human-playable legal options, tray-danger states, forced moves, needed lookahead and booster dependence where feasible.

**A4. Dark felt background — MANDATORY.** Replace the flat gameplay green with a **rich, dark green felt-like texture** with very fine, matte grain and a **subtle radial vignette**. The center must stay calm and a little lighter; corners gently darken for focus. Use a seamless lightweight authored background texture or deterministic procedural texture converted to reusable art, *not* a high-frequency shader animation. Keep jade hue rich but desaturated enough that bright ivory tile faces and gold controls stand out. No busy foliage directly behind board; peripheral ornaments may remain small and restrained. Verify actual readability and no crushing into near-black on low-brightness phones.

**A5. Icon sizing and framing — MANDATORY.** For Fruit and Cars initially, and then all active themes, increase symbol visual occupancy **slightly** while respecting the usable ceramic face. Target an *approximate* 75–85% inner-face visual bounding width/height where the silhouette permits; account for asymmetrical fruit stems, cars, portrait wildlife, long sports tools, negative space, bevel protection and optical centering. Do **not** stretch or crop icons to hit a number; scale according to subject class. Keep transparent pixel edges clean and prevent clipping/texture bleeding. Demonstrate actual before/after tile screenshots on 360×640 and 390×844.

**A6. Tile geometry and balance.** Keep a balanced ivory ceramic tile silhouette, softly wider than tall where consistent with existing game art, avoiding tall narrow tiles and excessive thickness. Match the approved reference's material depth and rounded highlights. Tune board scale using calculated real screen space, not an arbitrary global zoom that causes touch and blocking mismatches.

**A7. Responsive visual consistency.** Preserve the brand direction: dark jade felt, ivory ceramic tiles, tasteful warm gold and dark wood details, lush but restrained premium raster symbols. Decorative plants and wooden shelving from the sheets are supporting/gallery motifs, never substitutes for game-board logic. Use coherent lighting direction, contact shadows, consistent perspective, and unified icon padding.

## PHASE B — PRIORITY 0: BUILD A FINISHED FIRST-CHAPTER ART STANDARD

**B1. Preserve 12 approved Fruit/Cars native assets** if their quality is acceptable at actual runtime scale. Inspect individual icons for recognizability, alpha edges, raster blur, off-center alignment, padding, exaggerated shine, and mismatched lighting. Do not randomly replace approved visual direction.

**B2. Polish the first 20 levels as a cohesive playable chapter.** Cover the six reference collection themes where they are used by those levels, rather than only polishing Fruit and Cars. Every visible piece must meet one uniform production bar. When a level uses an icon not yet available as premium raster, create an original matching asset through the existing reproducible premium asset pipeline, or clearly mark that level's visual acceptance pending. Do not silently ship mismatched fallbacks. Avoid using expensive image generation for all 60 pending assets until the first-chapter standard is proven.

**B3. Establish reusable art specifications:** tile dimensions/ratio, ivory ceramic texture, top bevel, sidewall thickness, bottom contact shadow, icon target area, icon resolution/atlas, lighting direction, blocked state, selected state, masked content, animation pivot, and device pixel ratio handling. Make a source-of-truth asset manifest mapping every theme and symbol to production file, variant, license/provenance, and fallback/development status.

**B4. Review the 12 planned collection-specific material families**, but *do not falsely claim all are completed*. Implement the first premium tile family in-game end-to-end and document a feasible scalable asset recipe for the rest. Show the same family in board, tray, win preview, and collection UI.

**B5. Six theme-specific visual acceptance sheets — MANDATORY.** Produce a per-category acceptance view for **Fruit Garden, Dream Garage, Champions Club, Master Garage, Wild Safari and Cozy Companions** showing: approved visual reference; current runtime tile sprites; completed individually exported new icons (only where actually generated); count of distinct valid typeIDs; and unresolved placeholders. Use the user-supplied sheets as input references, not as an output substitute. The actual gameplay must match the approved *quality level*, not the reference shelf-grid layout. Aim for **zero procedural fallbacks shown in polished Levels 1–20**; if some remain because of asset-generation limitations, flag Phase 2 visual acceptance **partial/blocked**, not finished.

**B6. Stable content and duplicates.** Some sheets show similar animals, repeated tools, paired cherries or similarly colored vehicles. Each distinct gameplay symbol must remain unambiguously distinguishable in a small tile. In-game copies intended to match must share the exact same typeId and artwork. Different typeIds must not become visually indistinguishable, and decorative repeated concepts do not create new data IDs automatically. Add an automated catalog-to-runtime-art coverage report and fail acceptance if a required Level 1–20 symbol lacks a valid production asset.

## PHASE C — PRIORITY 0: POLISH SCREENS AND NAVIGATION

**C1. Gameplay HUD:** clear level/chapter, actual score, remaining tiles, accessible pause, compact controlled boosters. Larger board must remain first priority. Prevent tiny all-caps copy and badges from crowding the screen.

**C2. Victory / Perfect Clear:** replace muddy unreadable score rendering with prominent high-contrast legible typography. Present 3-star award, score, earned currency, truthful bonus and collection progress with disciplined spacing. Use existing validated score/star/economy rules only. Remove bogus ranked claims while online leaderboard is not integrated. Give one unmistakable primary CTA (`Next Level`) and a smaller secondary action. Reward animation must be pleasant and skippable; no forced excessive delay.

**C3. Level Journey:** refined chapter/collection navigation, consistent icons, stars on cleared levels, clear unlocked/current/locked states, meaningful level names, readable pagination and back navigation. Remove player-facing debug terms. All 30 levels must remain navigable as before.

**C4. Shop / currency:** cleanly differentiate coin and gem balances, costs and entitlements. Preserve rollback/idempotent mock transaction logic. All mock-only state must remain unmistakably TEST MODE to testers. Never promote a fake premium purchase or fake ad claim in a release-facing UI; remove or hide deceptive calls to action behind a development-only flag. No real purchases in this phase.

**C5. Menus, pause, settings, collection gallery:** audit for design consistency and touch comfort; improve only existing screens that actually exist; no uncontrolled feature proliferation. Audio sliders, music/SFX toggles and persistence from the audio phase must remain functional.

## PHASE D — PRIORITY 1: FIRST-TIME USER EXPERIENCE

Implement a concise, optional/replayable guided tutorial in the first few levels that uses real interactive board tiles:
- Show an exposed edge tile that can be selected.
- Explain visually why a tile blocked on both sides cannot be taken.
- Demonstrate removing a neighbor to reveal an unlocked tile.
- Demonstrate collecting three identical symbols; the third clears atomically.
- Demonstrate the four-slot tray danger and loss condition.
- Minimal contextual hints and optional animated pointer; no long paragraphs, forced wait screens or false interactive examples.
- Persist completion correctly across save migration and interruptions. Tutorial must not create artificial wins or alter validated game outcomes.

## PHASE E — PRIORITY 1: EFFECTS, PERFORMANCE, ACCESSIBILITY

- Preserve all newly approved SFX/music and the two original ElevenLabs-approved SFX exactly as integrated. Do not regenerate, replace, or rename without mapping changes. Validate correct event sync, mobile audio unlocking, mute, volume, idle/background pause, and no double playback.
- Prefer gentle transitions (short touch feedback, fast tray arrival, delightful but restrained triple-match, composed completion). Add motion-reduction preference and respectful flashing limits.
- Review memory allocations and render performance on dense levels; optimize textures / atlases, asset loading, WebP pipeline and avoid unnecessary large masters loaded at runtime.
- Verify WebGL context restoration, browser background/resume, rapid taps, safe area and keyboard/back input where applicable.
- Audit color contrast and minimum readable text sizes. Keep essential icons recognizable at the smallest supported viewport.

## PHASE F — REQUIRED VERIFICATION GATES

**Gameplay:** re-run existing 50+ unit tests plus newly added coverage; 30/30 level solvability; actual pointer completion; Undo/Shuffle/Hint/restart and combinations thereof; no fake victory; score/stars/coin calculations unchanged except documented and tested corrections; repeated replay save/load/restore.

**Visual:** capture before/after side-by-side screenshots at 360×640, 390×844, 430×932, and 768×1024 for all six themed collections (at least one actual gameplay shot each), Fruit/Cars enlarged symbols, felt/vignette background, tile contact shadow and blocking depth, tray transitions, level completion, Level Journey, Shop, pause/settings, and tutorial. Also provide theme acceptance/asset coverage sheets. Add screenshot-diff checks for critical screens. Compare explicitly against approved direction. Show actual Phaser runtime (not generated mockups); do not reuse/crop the new contact sheets as proof of gameplay.

**Audio:** test event traces and real audible playback after first user gesture with safe mute and volume handling, while guarding against multiple simultaneous taps. Preserve approved files.

**Performance:** provide measured bundle size, runtime memory/texture sizes where measurable, and FPS/frame-time evidence on available environments. Do not invent real-device measurements; list any physical-device tests not completed.

**Safety:** ensure player-facing screens have no debug identifiers, misleading mock online rank, fake purchases, simulated live leaderboards or inaccessible buttons. Confirm no payments, ads or Supabase backend were added in this task.

## DEFINITION OF DONE

Produce a `qa/production-visual-ux/` evidence folder including:
1. `PRODUCTION_VISUAL_UX_REPORT.md` with a requirements compliance matrix: complete / partial / blocked, changed files, and actual measured before/after.
2. `VISUAL_ACCEPTANCE_GALLERY.md` linking actual test screenshots (for all six themes) and describing where they do or do not match target quality. Explicitly show **before/after felt texture, shadow layering and icon scaling**.
3. `ASSET_MANIFEST.csv` listing original raster assets, approved/prototype/fallback status and provenance, per-collection typeID mappings, named art source, dimensions, and actual scene usage. Include a `THEME_ART_COVERAGE.md` grid for all six new references.
4. `UX_AND_DIFFICULTY_QA.md` documenting human-readability and gameplay checks, not just deterministic solver results.
5. Verified unit, integration and browser tests, including failures/limitations and no console errors.
6. Accurate list of next-phase backlog items: unmade art (remaining symbols/material families), first-party backend and leaderboard integration, economy/payments, compliance, packaging, accessibility and real-device QA.

Commit on your NEW local branch only. Do not push or merge. Report commit ID, clean/dirty tree, screenshots, precise blockers and overall readiness as either **First Chapter Visual Candidate**, **Internal Alpha**, or **Not Ready**. **Never declare commercially publishable unless all release requirements genuinely pass.**

**START NOW:** Inspect repository, the full set of twelve image references and screenshot evidence; map the six themed sheets to the source catalog; make the action plan, then implement the highest-priority actual runtime corrections. Finish as much verified work as possible without asking repetitive questions; if asset generation is constrained, fully complete what can be achieved and clearly mark the rest.
