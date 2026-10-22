import { applyWalletTransaction } from './WalletLedger.js';
export const REVIVE_GEM_COST=5;
export function commitGemRevive(save,{attemptId,level,restored}){if(!restored)return{ok:false,reason:'rollback-failed'};return applyWalletTransaction(save,{id:`revive:${attemptId}`,currency:'gems',amount:-REVIVE_GEM_COST,source:'revive',metadata:{level}});}
export function commitAdRevive(save,{attemptId,level,restored,proof}){if(!restored)return{ok:false,reason:'rollback-failed'};if(!proof?.verified||proof.id!==attemptId)return{ok:false,reason:'unverified-ad'};save.economy.revives[attemptId]={level,method:'mock-ad',at:Date.now()};return{ok:true};}
