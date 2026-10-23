import { MATCH_SIZE, TRAY_CAPACITY } from './GameRules.js';
export { MATCH_SIZE, TRAY_CAPACITY };

export function normalizeTypeId(value) {
  return String(value ?? '').trim().toLowerCase();
}

export function createTrayState(entries = []) {
  if (entries.length > TRAY_CAPACITY) throw new Error('Tray invariant violated: capacity is four');
  const normalized = entries.map(entry => Object.freeze({
    visualId: String(entry.visualId),
    typeId: normalizeTypeId(entry.typeId)
  }));
  if (normalized.some(entry => !entry.visualId || !entry.typeId)) throw new Error('Tray entries require stable visualId and typeId values');
  return Object.freeze({ entries: Object.freeze(normalized) });
}

export function reduceTray(state, action) {
  if (action.type !== 'INSERT') throw new Error(`Unsupported tray action: ${action.type}`);
  const visualId = String(action.tile?.visualId ?? '');
  const typeId = normalizeTypeId(action.tile?.typeId);
  if (!visualId || !typeId) throw new Error('Tray insert requires visualId and typeId');
  if (state.entries.some(entry => entry.visualId === visualId)) return rejected(state, 'duplicate');
  if (state.entries.length >= TRAY_CAPACITY) return rejected(state, 'capacity');

  const inserted = Object.freeze({ visualId, typeId });
  const entries = [...state.entries];
  const lastSame = entries.reduce((last, entry, index) => entry.typeId === typeId ? index : last, -1);
  const insertAt = lastSame >= 0 ? lastSame + 1 : entries.length;
  entries.splice(insertAt, 0, inserted);

  // Authoritative match resolution happens here, before any renderer or callback can observe occupancy.
  const matching = entries.filter(entry => entry.typeId === typeId);
  const cleared = matching.length >= MATCH_SIZE ? matching.slice(0, MATCH_SIZE) : [];
  const clearedIds = new Set(cleared.map(entry => entry.visualId));
  const resolvedEntries = cleared.length ? entries.filter(entry => !clearedIds.has(entry.visualId)) : entries;
  const nextState = createTrayState(resolvedEntries);

  return Object.freeze({
    accepted: true,
    state: nextState,
    inserted,
    insertAt,
    cleared: Object.freeze(cleared),
    didClear: cleared.length === MATCH_SIZE,
    full: nextState.entries.length === TRAY_CAPACITY
  });
}

function rejected(state, reason) {
  return Object.freeze({ accepted: false, reason, state, cleared: Object.freeze([]), didClear: false, full: state.entries.length === TRAY_CAPACITY });
}
