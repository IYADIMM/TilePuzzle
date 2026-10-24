export const MATCH_SIZE = 2;
export const TRAY_CAPACITY = 4;
export const LEVEL_GENERATION_VERSION = 4;

export function isMatchCount(count) {
  return Number(count) >= MATCH_SIZE;
}

export function isValidLevelInventory(tileCount) {
  return Number.isInteger(tileCount) && tileCount > 0 && tileCount % MATCH_SIZE === 0;
}
