# Save migration and recovery

The current schema is version 5 and uses `jade-garden-tiles-save-v5`. Before replacing a valid primary record, the save manager copies it to `jade-garden-tiles-save-backup-v5`.

Load order is primary v5, backup v5, then legacy v4 (including its backup), v3, v2, and v1. Every loaded record passes through `migrateSave`, which:

- recomputes aggregate stars from per-level best records;
- preserves the greatest known unlocked level;
- merges booster, leaderboard, preference, and economy defaults;
- deduplicates unlocked themes, owned inventory, and queued chest milestones;
- normalizes independent music/SFX enabled and volume preferences. The former forced-silence v4 flag is intentionally replaced by the approved quiet default mix.

Malformed records are skipped. If a backup or legacy record succeeds, `storageRecovery` records the source for diagnostics. If no valid record exists, safe defaults are returned. Storage write failures are reported through `SaveManager.lastError` and the structured result from `SaveManager.save`; callers must never assume persistence succeeded merely because in-memory progress changed.

Before shipping a later schema, add the new key instead of overwriting v5, keep at least one readable previous version, add corrupt-primary and migration fixtures, and verify stars, unlocks, audio preferences, wallet balances, ledger IDs, and queued rewards after round-trip serialization.
