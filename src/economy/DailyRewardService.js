import { DAILY_REWARDS } from './EconomyCatalog.js';
import { applyWalletTransaction } from './WalletLedger.js';
export function utcDay(now=Date.now()){return new Date(now).toISOString().slice(0,10);}
export function claimDailyReward(save,now=Date.now()){
  const daily=save.economy.daily,day=utcDay(now);if(daily.lastClaimDay===day)return{ok:false,reason:'already-claimed',nextClaimAt:Date.parse(`${day}T00:00:00Z`)+86400000};
  const previous=daily.lastClaimDay?Date.parse(`${daily.lastClaimDay}T00:00:00Z`):0,current=Date.parse(`${day}T00:00:00Z`),consecutive=previous&&current-previous===86400000;
  daily.streak=consecutive?(daily.streak%7)+1:1;daily.lastClaimDay=day;const reward=DAILY_REWARDS[daily.streak-1],id=`daily:${day}`;
  if(reward.coins)applyWalletTransaction(save,{id:`${id}:coins`,currency:'coins',amount:reward.coins,source:'daily-reward',metadata:{streak:daily.streak}});
  if(reward.gems)applyWalletTransaction(save,{id:`${id}:gems`,currency:'gems',amount:reward.gems,source:'daily-reward',metadata:{streak:daily.streak}});
  return{ok:true,day,streak:daily.streak,reward,nextClaimAt:current+86400000};
}
