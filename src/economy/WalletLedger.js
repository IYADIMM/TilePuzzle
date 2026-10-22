export function applyWalletTransaction(save,{id,currency,amount,source,metadata={}}){
  if(!id||!['coins','gems'].includes(currency)||!Number.isInteger(amount)||amount===0||!source)return{ok:false,reason:'invalid-transaction'};
  save.economy.ledger ||= [];
  const existing=save.economy.ledger.find(entry=>entry.id===id);if(existing)return{ok:true,duplicate:true,balance:save[currency],entry:existing};
  const next=(Number(save[currency])||0)+amount;if(next<0)return{ok:false,reason:'insufficient-funds',balance:save[currency]};
  const entry=Object.freeze({id,currency,amount,source,metadata,at:Date.now()});save[currency]=next;save.economy.ledger.push(entry);return{ok:true,duplicate:false,balance:next,entry};
}
