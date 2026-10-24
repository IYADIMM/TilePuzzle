export function applyWalletTransaction(save,{id,currency,amount,source,metadata={}}){
  if(!id||!['coins','gems'].includes(currency)||!Number.isInteger(amount)||amount===0||!source)return{ok:false,reason:'invalid-transaction'};
  save.economy.ledger ||= [];
  const existing=save.economy.ledger.find(entry=>entry.id===id);if(existing){const same=existing.currency===currency&&existing.amount===amount&&existing.source===source&&stable(existing.metadata)===stable(metadata);return same?{ok:true,duplicate:true,balance:save[currency],entry:existing}:{ok:false,reason:'transaction-id-conflict',entry:existing};}
  const next=(Number(save[currency])||0)+amount;if(next<0)return{ok:false,reason:'insufficient-funds',balance:save[currency]};
  const entry=Object.freeze({id,currency,amount,source,metadata,at:Date.now()});save[currency]=next;save.economy.ledger.push(entry);return{ok:true,duplicate:false,balance:next,entry};
}

function stable(value){if(value===null||typeof value!=='object')return JSON.stringify(value);if(Array.isArray(value))return`[${value.map(stable).join(',')}]`;return`{${Object.keys(value).sort().map(key=>`${JSON.stringify(key)}:${stable(value[key])}`).join(',')}}`;}
