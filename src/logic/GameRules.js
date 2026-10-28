export const MATCH_SIZE = 2;
export const TRAY_CAPACITY = 4;
export const LEVEL_GENERATION_VERSION = 5;
export const SUPPORTED_GENERATION_VERSIONS = Object.freeze([4,LEVEL_GENERATION_VERSION]);

export function isMatchCount(count) {
  return Number(count) >= MATCH_SIZE;
}

export function isValidLevelInventory(tileCount) {
  return Number.isInteger(tileCount) && tileCount > 0 && tileCount % MATCH_SIZE === 0;
}
