import { catalogItem } from './EconomyCatalog.js';
import { applyWalletTransaction } from './WalletLedger.js';
export function purchaseCatalogItem(save,itemId,transactionId){
  const item=catalogItem(itemId);if(!item)return{ok:false,reason:'unknown-item'};const inventory=save.economy.inventory;inventory.owned||=[];
  if(item.kind!=='booster'&&inventory.owned.includes(item.id))return{ok:false,reason:'already-owned'};
  const payment=applyWalletTransaction(save,{id:transactionId,currency:item.currency,amount:-item.price,source:'catalog-purchase',metadata:{itemId:item.id,catalogVersion:1}});if(!payment.ok||payment.duplicate)return payment.duplicate?{ok:true,duplicate:true,item}:payment;
  if(item.kind==='booster')save.boosters[item.booster]=(save.boosters[item.booster]||0)+item.quantity;else inventory.owned.push(item.id);
  return{ok:true,item,balance:save[item.currency]};
}
export function equipItem(save,itemId){const item=catalogItem(itemId);if(!item||item.kind==='booster'||!save.economy.inventory.owned.includes(itemId))return{ok:false,reason:'not-owned'};save.economy.inventory.equipped[item.kind]=itemId;return{ok:true,item};}
