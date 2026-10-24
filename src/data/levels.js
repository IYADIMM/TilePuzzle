import { THEMES, getThemeForLevel } from './themes.js';
import { LEVEL_GENERATION_VERSION } from '../logic/GameRules.js';

const SHAPES = ['tower', 'diamond', 'hourglass', 'bridge', 'lantern', 'fan', 'heart', 'butterfly', 'flower', 'star', 'bear', 'car'];
const LEVEL_TOTAL = 1000;

export const LEVEL_CONFIGS = Object.freeze(Array.from({length:LEVEL_TOTAL},(_,index) => {
  const level = index + 1;
  const theme = getThemeForLevel(level);
  const tier=Math.floor(index/20);
  const tileCount=Math.min(60,36+Math.min(12,tier)*2);
  return Object.freeze({
    level,
    name: `${theme.name} ${Math.floor(index / THEMES.length) + 1}`,
    themeId: theme.id,
    materialId: theme.materialId,
    iconIds: theme.iconIds,
    // Keep collection and silhouette cadences independent across chapters.
    layoutId: SHAPES[(index + Math.floor(index / THEMES.length) * 5) % SHAPES.length],
    tileCount,
    layers: level < 4 ? 2 : level < 13 ? 3 : level < 25 ? 4 : 5,
    difficulty: Math.min(5, 1 + Math.floor(index / 6)),
    seed: 5107 + level * 7919,
    rewardId: `${theme.rewardId}-${level}`
    ,generationVersion:LEVEL_GENERATION_VERSION
  });
}));

export function getLevelConfig(level = 1) {
  const safe = normalizeLevelNumber(level,LEVEL_CONFIGS.length);
  return LEVEL_CONFIGS[safe - 1];
}

export function normalizeLevelNumber(value,total=LEVEL_CONFIGS.length) {
  const numeric=Number(value),integer=Number.isFinite(numeric)?Math.trunc(numeric):1;
  return Math.max(1,Math.min(Math.max(1,Math.trunc(Number(total))||1),integer||1));
}

export const LEVEL_COUNT = LEVEL_CONFIGS.length;
