import { THEMES, getThemeForLevel } from './themes.js';

const SHAPES = ['tower', 'diamond', 'hourglass', 'bridge', 'lantern', 'fan'];
const COUNTS = [36,36,39,39,42,42,45,45,48,48,51,51,54,54,57,57,60,60,60,60,60,60,60,60,60,60,60,60,60,60];

export const LEVEL_CONFIGS = Object.freeze(COUNTS.map((tileCount, index) => {
  const level = index + 1;
  const theme = getThemeForLevel(level);
  return Object.freeze({
    level,
    name: `${theme.name} ${Math.floor(index / THEMES.length) + 1}`,
    themeId: theme.id,
    materialId: theme.materialId,
    iconIds: theme.iconIds,
    layoutId: SHAPES[index % SHAPES.length],
    tileCount,
    layers: level < 4 ? 2 : level < 13 ? 3 : level < 25 ? 4 : 5,
    difficulty: Math.min(5, 1 + Math.floor(index / 6)),
    seed: 5107 + level * 7919,
    rewardId: `${theme.rewardId}-${level}`
  });
}));

export function getLevelConfig(level = 1) {
  const safe = Math.max(1, Math.min(LEVEL_CONFIGS.length, Number(level) || 1));
  return LEVEL_CONFIGS[safe - 1];
}

export const LEVEL_COUNT = LEVEL_CONFIGS.length;
