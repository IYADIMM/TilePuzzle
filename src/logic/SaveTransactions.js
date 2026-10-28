import { abandonActiveAttempt } from '../systems/SaveManager.js';

export function claimTreasureReward(save,milestone,persist){
  if(!milestone||save.queuedChestRewards?.[0]!==milestone)return{ok:false,reason:'not-ready'};
  const rewardId=`chest:${milestone}`;
  if(save.claimedRewards?.[rewardId])return{ok:false,reason:'already-claimed'};
  return mutateAndPersist(save,()=>{
    save.claimedRewards??={};save.claimedRewards[rewardId]=true;
    save.queuedChestRewards.shift();save.coins+=150;save.boosters.hint++;
  },persist);
}

export function commitAbandonAttempt(save,reason,persist){
  return mutateAndPersist(save,()=>abandonActiveAttempt(save,reason),persist);
}

export function mutateAndPersist(save,mutator,persist){
  const before=clone(save);
  try{
    mutator(save);
    const result=persist(save);
    if(!result?.ok){restore(save,before);return{ok:false,reason:'save-failed',error:result?.error||'Save failed'};}
    return{ok:true};
  }catch(error){restore(save,before);return{ok:false,reason:'save-failed',error:String(error?.message||error)};}
}

function restore(target,snapshot){for(const key of Object.keys(target))delete target[key];Object.assign(target,clone(snapshot));}
function clone(value){return JSON.parse(JSON.stringify(value));}
