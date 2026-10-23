export const LEVELS_PER_PAGE=6;
export function levelPageFor(level,total=1000){return Math.max(0,Math.min(Math.ceil(total/LEVELS_PER_PAGE)-1,Math.floor((Math.max(1,Number(level)||1)-1)/LEVELS_PER_PAGE)));}
export function levelsForPage(levels,page){const last=Math.max(0,Math.ceil(levels.length/LEVELS_PER_PAGE)-1),safe=Math.max(0,Math.min(last,Number(page)||0)),start=safe*LEVELS_PER_PAGE;return{page:safe,pageCount:last+1,start,levels:levels.slice(start,start+LEVELS_PER_PAGE)};}

export function buildLevelJourney(levels,maxUnlockedLevel){
  const max=Math.max(1,Math.min(levels.length,Number(maxUnlockedLevel)||1));
  const unlocked=levels.slice(0,max).map(level=>({...level,locked:false,mystery:false}));
  if(max<levels.length)unlocked.push({level:max+1,locked:true,mystery:true});
  return unlocked;
}

export function clampPlayableLevel(requested,maxUnlockedLevel,total,{allowDevOverride=false}={}){
  const safeTotal=Math.max(1,Number(total)||1),wanted=Math.max(1,Math.min(safeTotal,Number(requested)||1));
  if(allowDevOverride)return wanted;
  return Math.min(wanted,Math.max(1,Math.min(safeTotal,Number(maxUnlockedLevel)||1)));
}
