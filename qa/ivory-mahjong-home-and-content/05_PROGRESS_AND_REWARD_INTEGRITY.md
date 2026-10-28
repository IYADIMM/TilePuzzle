# Progress and Reward Integrity

Garden Treasures is isolated under `save.bonusContent.gardenTreasures`; resumable state uses `activeBonusAttempt`. Campaign `lastLevel`, the existing 1,000-level progression, star totals, and campaign rewards are not mutated by starting the bonus.

The first legal clear awards 200 coins once. Replays can improve best score/time but cannot replay the first-clear reward. Completion and reward status are persisted through the existing verified save transaction path.

Automated evidence confirms:

- first clear: `firstClear=true`, `coins=200`;
- replay: `firstClear=false`, `coins=0`;
- save domain remains valid;
- browser completion persisted `completed=true`, `bestScore=15600`, `rewardClaimed=true`;
- corrupted/legacy save recovery, Undo inventory preservation, wallet idempotency, and campaign reward tests remain green.
