export const LEVELS_PER_PAGE=6;
export function levelPageFor(level,total=1000){const numeric=Number(level),integer=Number.isFinite(numeric)?Math.trunc(numeric):1;return Math.max(0,Math.min(Math.ceil(total/LEVELS_PER_PAGE)-1,Math.floor((Math.max(1,integer)-1)/LEVELS_PER_PAGE)));}
export function levelsForPage(levels,page){const last=Math.max(0,Math.ceil(levels.length/LEVELS_PER_PAGE)-1),numeric=Number(page),safe=Math.max(0,Math.min(last,Number.isFinite(numeric)?Math.trunc(numeric):0)),start=safe*LEVELS_PER_PAGE;return{page:safe,pageCount:last+1,start,levels:levels.slice(start,start+LEVELS_PER_PAGE)};}

export function buildLevelJourney(levels,maxUnlockedLevel){
  const max=Math.max(1,Math.min(levels.length,Number(maxUnlockedLevel)||1));
  const unlocked=levels.slice(0,max).map(level=>({...level,locked:false,mystery:false}));
  if(max<levels.length)unlocked.push({level:max+1,locked:true,mystery:true});
  return unlocked;
}

export function clampPlayableLevel(requested,maxUnlockedLevel,total,{allowDevOverride=false}={}){
  const totalNumber=Number(total),safeTotal=Math.max(1,Number.isFinite(totalNumber)?Math.trunc(totalNumber):1),requestedNumber=Number(requested),wanted=Math.max(1,Math.min(safeTotal,Number.isFinite(requestedNumber)?Math.trunc(requestedNumber):1));
  if(allowDevOverride)return wanted;
  const unlockedNumber=Number(maxUnlockedLevel),unlocked=Number.isFinite(unlockedNumber)?Math.trunc(unlockedNumber):1;
  return Math.min(wanted,Math.max(1,Math.min(safeTotal,unlocked)));
}
