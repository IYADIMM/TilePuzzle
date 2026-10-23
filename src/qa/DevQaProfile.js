const PREFIX='jade-garden-tiles-qa:';

export function isDevQaMode(){
  return Boolean(import.meta.env?.DEV&&typeof location!=='undefined'&&new URLSearchParams(location.search).get('qaMode')==='1');
}

export function qaStorage(base=globalThis.sessionStorage){
  return{getItem:key=>base.getItem(`${PREFIX}${key}`),setItem:(key,value)=>base.setItem(`${PREFIX}${key}`,value),removeItem:key=>base.removeItem(`${PREFIX}${key}`)};
}

export function defaultSaveStorage(){return isDevQaMode()?qaStorage():globalThis.localStorage;}

export function applyDevQaScenario(save,scenario='boosters'){
  if(!isDevQaMode())return save;
  save.boosters={undo:99,hint:99,shuffle:99};save.gems=999;save.coins=9999;save.maxUnlockedLevel=Math.max(12,save.maxUnlockedLevel);save.lastLevel=Math.min(save.maxUnlockedLevel,save.lastLevel);
  if(scenario==='treasure'){save.completedLevels=Object.fromEntries(Array.from({length:5},(_,i)=>[i+1,{score:1000,stars:2,bestTime:60}]));save.queuedChestRewards=['levels:1-5'];save.chestProgress=0;}
  return save;
}
