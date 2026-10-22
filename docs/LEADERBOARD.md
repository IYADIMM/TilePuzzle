# Garden League leaderboard

## Current implementation

The game ships with a fully functional offline Garden League. The player has persistent weekly and all-time best results, three standings views, league tiers, projected season rewards, and completion-screen rank feedback. Seeded rival gardens make the feature testable without a network account; the UI labels this mode **Offline Season** so it is never presented as a real global service.

Only the best result for each level contributes in a season. A better replay adds only the improvement, which prevents unlimited farming of an easy stage.

Leaderboard points are calculated from:

- level difficulty;
- one-to-three-star clear quality;
- clear time, with a capped speed bonus;
- best combo;
- a no-booster bonus.

Weekly results reset on Monday at 00:00 UTC. All-time results retain the best score recorded for every level. Ranking is descending by points with deterministic tie-breaking.

## Production service boundary

`LeaderboardManager` is the read facade used by Phaser scenes. Authoritative production rankings should replace its local standings source with a server API while leaving gameplay and reward reducers synchronous.

A production service should provide authenticated equivalents of:

- `submitResult(level, scoreProof, clientResultId)` — idempotent, server-validated submission;
- `getStandings(scope, seasonId, cursor)` — weekly, all-time, and friends pages;
- `getPlayerSummary(seasonId)` — rank, points, tier, and projected reward;
- `claimSeasonReward(seasonId)` — atomic, one-time server claim.

The server must calculate points itself, reject modified level outcomes, use idempotency keys, rate-limit submissions, retain an audit trail, and distribute rewards server-side. Never trust the browser's points or rank when real rewards are involved.
