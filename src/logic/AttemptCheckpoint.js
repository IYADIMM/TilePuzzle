export function createAttemptCheckpoint({
  level,
  status = 'active',
  elapsedMs = 0,
  reviveUsed = false,
  boostersUsed = 0,
  snapshot,
  history = [],
  attemptId,
  generationVersion,
  updatedAt = Date.now()
}) {
  if (!Number.isInteger(level) || level < 1 || !snapshot) throw new Error('Invalid active-attempt checkpoint');
  return {
    level,
    status,
    attemptId,
    generationVersion: Number.isInteger(generationVersion)?generationVersion:undefined,
    updatedAt,
    elapsedMs: Math.max(0, Number(elapsedMs) || 0),
    reviveUsed: Boolean(reviveUsed),
    boostersUsed: Math.max(0, Number(boostersUsed) || 0),
    snapshot: clone(snapshot),
    history: clone(history.slice(-8))
  };
}

export function operationId(prefix = 'operation') {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid) return `${prefix}:${uuid}`;
  operationId.counter = (operationId.counter || 0) + 1;
  return `${prefix}:${Date.now().toString(36)}:${operationId.counter.toString(36)}:${Math.random().toString(36).slice(2,10)}`;
}

function clone(value) { return JSON.parse(JSON.stringify(value)); }
