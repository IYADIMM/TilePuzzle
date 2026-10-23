import { getLevelConfig } from '../data/levels.js';
import { MATCH_SIZE } from './GameRules.js';

export const COMBO_WINDOW_MS = 8000;

export function performanceTargets(level) {
  const config=getLevelConfig(level),matches=config.tileCount/MATCH_SIZE,levelFactor=1+Math.floor((config.level-1)/20)*.08;
  const baseScore=Math.round(matches*200*levelFactor);
  const parSeconds=Math.round(58+matches*5+config.layers*9);
  return Object.freeze({matches,baseScore,threeStarScore:Math.round(baseScore*1.5),twoStarScore:Math.round(baseScore*.9),parSeconds});
}

export function calculateStarRating({level,score=0,seconds=Infinity}) {
  const target=performanceTargets(level),safeScore=Math.max(0,Number(score)||0),safeSeconds=Math.max(0,Number(seconds)||Infinity);
  if(safeScore>=target.threeStarScore&&safeSeconds<=target.parSeconds)return 3;
  if(safeScore>=target.twoStarScore&&safeSeconds<=target.parSeconds*1.5)return 2;
  return 1;
}

export function isGameplayEvidenceValid({levelTileCount,selectedTileCount,resolvedMatchCount,resolvedTrioCount,score}) {
  const tileCount=Number(levelTileCount),selected=Number(selectedTileCount),matches=Number(resolvedMatchCount??resolvedTrioCount);
  return tileCount>0&&tileCount%MATCH_SIZE===0&&selected===tileCount&&matches===tileCount/MATCH_SIZE&&Number(score)>0;
}
