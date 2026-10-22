# Development Lessons and Reusable Patterns

## State first, animation second

For a capacity-limited match tray, calculate and commit the complete reduced state synchronously. Loss evaluation must observe the resolved state, never the pre-clear animation state. Visual objects should be projections of state, not state owners.

## Detached effects prevent ghost occupancy

When matched items clear, immediately remove their IDs from authoritative and active-visual maps. Hide the original objects, then animate independent proxies. This makes interruption, restart, Undo, and rapid taps deterministic.

## One accessibility oracle

Mahjong exposure is easy to desynchronize. Use one pure function for input, solver, hint, shuffle, blocked styling, and debug labels. It should return structured reasons—top, left, right—not only a boolean.

## Geometry is product logic

Tile proportions, footprints, side-neighbor tolerance, layer offsets, hitboxes, and board projection must share a central geometry definition. Otherwise a tile can look covered while logic says it is free.

## Completion needs a multi-condition gate

Victory is not “a match happened” or “the tray is empty.” Require zero board tiles, zero tray entries, no in-flight transaction, and a single-fire guard. Keep that predicate pure and unit tested.

## Test rendered truth

Unit tests proved the reducer and solver, but live screenshots exposed sparse composition, unreadable blocked tiles, and a reward tween scaling bug. Browser QA should assert scene identity and logical state in addition to writing screenshots; filenames are not evidence by themselves.

## Premium motion can remain deterministic

Use a mathematical curve driven by a tweened scalar. The state can commit instantly while a quadratic Bézier arc provides deliberate motion. Transaction IDs and shutdown guards make the animation safely disposable.

## Visual evidence should be curated

Keep approved references and rejected builds explicitly labeled. Generate evidence from the current runtime at representative devices, add a runtime asset contact sheet, and state visual limitations honestly rather than claiming subjective approval.
