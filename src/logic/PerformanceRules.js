import { getLevelConfig } from '../data/levels.js';

export const COMBO_WINDOW_MS = 8000;

export function performanceTargets(level) {
  const config=getLevelConfig(level),triples=config.tileCount/3,levelFactor=1+Math.floor((config.level-1)/6)*.12;
  const baseScore=Math.round(triples*300*levelFactor);
  const parSeconds=Math.round(72+triples*7+config.layers*10);
  return Object.freeze({triples,baseScore,threeStarScore:Math.round(baseScore*1.5),twoStarScore:Math.round(baseScore*.9),parSeconds});
}

export function calculateStarRating({level,score=0,seconds=Infinity}) {
  const target=performanceTargets(level),safeScore=Math.max(0,Number(score)||0),safeSeconds=Math.max(0,Number(seconds)||Infinity);
  if(safeScore>=target.threeStarScore&&safeSeconds<=target.parSeconds)return 3;
  if(safeScore>=target.twoStarScore&&safeSeconds<=target.parSeconds*1.5)return 2;
  return 1;
}

export function isGameplayEvidenceValid({levelTileCount,selectedTileCount,resolvedTrioCount,score}) {
  const tileCount=Number(levelTileCount),selected=Number(selectedTileCount),triples=Number(resolvedTrioCount);
  return tileCount>0&&tileCount%3===0&&selected===tileCount&&triples===tileCount/3&&Number(score)>0;
}
