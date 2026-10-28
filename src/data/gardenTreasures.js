export const GARDEN_TREASURES_ID='garden-treasures';
export const GARDEN_TREASURE_ICON_IDS=Object.freeze([
  'garden-lotus','garden-bamboo','garden-koi','garden-lantern','garden-fan','garden-bluebird'
]);

export const GARDEN_TREASURES_THEME=Object.freeze({
  id:GARDEN_TREASURES_ID,
  name:'Garden Treasures',
  materialId:'mahogany',
  iconIds:GARDEN_TREASURE_ICON_IDS,
  palette:Object.freeze(['#e54f78','#2f8b4e']),
  rewardId:'garden-treasures-bonus'
});

export function getGardenTreasuresLevel(){return Object.freeze({
  level:1,
  bonusId:GARDEN_TREASURES_ID,
  name:'Garden Treasures',
  themeId:GARDEN_TREASURES_ID,
  theme:GARDEN_TREASURES_THEME,
  materialId:'mahogany',
  iconIds:GARDEN_TREASURE_ICON_IDS,
  layoutId:'flower',
  tileCount:24,
  layers:2,
  difficulty:2,
  seed:284771,
  rewardId:'garden-treasures-bonus',
  generationVersion:5
});}
