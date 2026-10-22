import Phaser from 'phaser';
import { TEXT } from '../theme.js';
import { prepareBackdrop } from './MenuScene.js';
import { addGoldButton,addIconButton,addPill,makeInteractive } from '../ui/components.js';
import { Modal } from '../ui/Modal.js';
import { SaveManager } from '../systems/SaveManager.js';
import { DAILY_REWARDS,ECONOMY_CATALOG } from '../economy/EconomyCatalog.js';
import { claimDailyReward } from '../economy/DailyRewardService.js';
import { equipItem,purchaseCatalogItem } from '../economy/InventoryService.js';

export class ShopScene extends Phaser.Scene{
  constructor(){super('Shop');}
  create(){
    prepareBackdrop(this);this.save=SaveManager.load();this.modal=new Modal(this);
    addIconButton(this,52,53,'back',()=>this.scene.start('Menu'),'Back');this.add.text(270,54,'GARDEN SHOP',{...TEXT.title,fontSize:'37px',color:'#fff0b0'}).setOrigin(.5);addPill(this,391,111,132,String(this.save.coins),'◆');addPill(this,154,111,132,String(this.save.gems),'◇');
    this.add.text(270,148,'INTERNAL TEST CATALOG  •  NO REAL MONEY',{...TEXT.hud,fontSize:'12px',color:'#ffe17a',letterSpacing:1}).setOrigin(.5);
    const day=(this.save.economy.daily.streak%7)+1,reward=DAILY_REWARDS[day-1];addGoldButton(this,270,205,390,`DAILY DAY ${day}  •  ${reward.coins} COINS${reward.gems?` + ${reward.gems} GEMS`:''}`,()=>this.claimDaily());
    this.add.text(270,260,'DIRECT PURCHASES  •  NO RANDOM LOOT',{...TEXT.hud,fontSize:'12px',color:'#f6ce62',letterSpacing:1.2}).setOrigin(.5);
    ECONOMY_CATALOG.forEach((item,index)=>this.addItem(item,index));
    this.add.text(270,866,'TEST INVENTORY ONLY',{...TEXT.title,fontSize:'23px',color:'#ffe07a',stroke:'#351307',strokeThickness:5}).setOrigin(.5);
    this.add.text(270,910,'No billing, ads, store entitlement, or online service is connected.',{...TEXT.hud,fontSize:'11px',color:'#cce0d7',wordWrap:{width:430},align:'center'}).setOrigin(.5);
  }
  addItem(item,index){
    const y=315+index*79,root=this.add.container(270,y),g=this.add.graphics(),owned=this.save.economy.inventory.owned.includes(item.id),equipped=this.save.economy.inventory.equipped[item.kind]===item.id;
    g.fillStyle(0x020100,.4).fillRoundedRect(-222,-31,448,67,17).fillStyle(0x103a2f,.97).fillRoundedRect(-224,-35,448,66,17).lineStyle(2,equipped?0x73e2aa:0xd69c37,.9).strokeRoundedRect(-224,-35,448,66,17);
    const glyph=this.add.circle(-184,-2,22,item.kind==='booster'?0xb96b27:0x2c7a61).setStrokeStyle(3,0xe8b64d),initial=this.add.text(-184,-2,item.kind[0].toUpperCase(),{...TEXT.title,fontSize:'19px',color:'#fff1c7',stroke:'#2a1006',strokeThickness:2}).setOrigin(.5),name=this.add.text(-148,-11,item.name,{...TEXT.hud,fontSize:'14px',color:'#fff1cf'}).setOrigin(0,.5),kind=this.add.text(-148,13,item.kind.toUpperCase(),{...TEXT.hud,fontSize:'10px',color:'#9fc5b4'}).setOrigin(0,.5),action=this.add.text(193,-1,equipped?'EQUIPPED':owned?'EQUIP':`${item.price} ${item.currency==='gems'?'GEMS':'COINS'}`,{...TEXT.hud,fontSize:'12px',color:equipped?'#8df0b8':'#ffd66b'}).setOrigin(1,.5);
    root.add([g,glyph,initial,name,kind,action]).setSize(448,70).setData('item-id',item.id);makeInteractive(root,()=>this.useItem(item,owned));
  }
  useItem(item,owned){
    const result=owned&&item.kind!=='booster'?equipItem(this.save,item.id):purchaseCatalogItem(this.save,item.id,`shop:${item.id}:${Date.now()}`);
    if(result.ok){SaveManager.save(this.save);this.scene.restart();return;}
    this.modal.show({variant:'danger',kind:'close',title:'Not Available',body:result.reason==='insufficient-funds'?'Earn more currency before buying this item.':result.reason,primary:'CONTINUE'});
  }
  claimDaily(){const result=claimDailyReward(this.save);if(result.ok)SaveManager.save(this.save);this.modal.show({kind:result.ok?'reward':'close',title:result.ok?'Daily Gift':'Already Claimed',subtitle:result.ok?`Streak day ${result.streak}`:'Come back after 00:00 UTC',body:result.ok?`+${result.reward.coins} coins${result.reward.gems?`\n+${result.reward.gems} gems`:''}`:'One verified claim is allowed per UTC day.',primary:'CONTINUE',onPrimary:()=>this.scene.restart()});}
}
