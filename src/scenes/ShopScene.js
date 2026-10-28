import Phaser from 'phaser';
import { TEXT } from '../theme.js';
import { prepareBackdrop } from './MenuScene.js';
import { addGoldButton,addIconButton,addPill,drawGlyph,makeInteractive } from '../ui/components.js';
import { Modal } from '../ui/Modal.js';
import { SaveManager } from '../systems/SaveManager.js';
import { DAILY_REWARDS,ECONOMY_CATALOG } from '../economy/EconomyCatalog.js';
import { claimDailyReward } from '../economy/DailyRewardService.js';
import { equipItem,purchaseCatalogItem } from '../economy/InventoryService.js';
import { PREMIUM_TEXTURES } from '../art/PremiumAssetManifest.js';
import { operationId } from '../logic/AttemptCheckpoint.js';

export class ShopScene extends Phaser.Scene{
  constructor(){super('Shop');}
  create(){
    prepareBackdrop(this);this.save=SaveManager.load();this.modal=new Modal(this);
    addIconButton(this,52,53,'back',()=>this.scene.start('Menu'),'Back');this.add.text(270,54,'STYLE SHOP',{...TEXT.title,fontSize:'37px',color:'#fff0b0'}).setOrigin(.5);addPill(this,391,111,132,String(this.save.coins),'◆');addPill(this,154,111,132,String(this.save.gems),'◇');
    this.add.text(270,148,'INTERNAL TEST CATALOG  •  NO REAL MONEY',{...TEXT.hud,fontSize:'12px',color:'#ffe17a',letterSpacing:1}).setOrigin(.5);
    const day=(this.save.economy.daily.streak%7)+1,reward=DAILY_REWARDS[day-1];addGoldButton(this,270,205,390,`DAILY DAY ${day}  •  ${reward.coins} COINS${reward.gems?` + ${reward.gems} GEMS`:''}`,()=>this.claimDaily());
    this.add.text(270,260,'FUNCTIONAL BOOSTERS  •  NO RANDOM LOOT',{...TEXT.hud,fontSize:'12px',color:'#f6ce62',letterSpacing:1.2}).setOrigin(.5);
    ECONOMY_CATALOG.filter(item=>item.kind==='booster').forEach((item,index)=>this.addItem(item,index));
    this.add.text(270,866,'TEST INVENTORY ONLY',{...TEXT.title,fontSize:'23px',color:'#ffe07a',stroke:'#351307',strokeThickness:5}).setOrigin(.5);
    this.add.text(270,910,'No billing, ads, store entitlement, or online service is connected.',{...TEXT.hud,fontSize:'11px',color:'#cce0d7',wordWrap:{width:430},align:'center'}).setOrigin(.5);
  }
  addItem(item,index){
    const y=315+index*79,root=this.add.container(270,y),g=this.add.graphics(),owned=this.save.economy.inventory.owned.includes(item.id),equipped=this.save.economy.inventory.equipped[item.kind]===item.id;
    g.fillStyle(0x020100,.4).fillRoundedRect(-222,-31,448,67,17).fillStyle(0x103a2f,.97).fillRoundedRect(-224,-35,448,66,17).lineStyle(2,equipped?0x73e2aa:0xd69c37,.9).strokeRoundedRect(-224,-35,448,66,17);
    const preview=this.createItemPreview(item,-184,-2),name=this.add.text(-148,-11,item.name,{...TEXT.hud,fontSize:'14px',color:'#fff1cf'}).setOrigin(0,.5),kind=this.add.text(-148,13,this.itemStatus(item,owned,equipped),{...TEXT.hud,fontSize:'10px',color:equipped?'#8df0b8':'#9fc5b4'}).setOrigin(0,.5),action=this.add.text(193,-1,equipped?'EQUIPPED':owned?'EQUIP':`${item.price} ${item.currency==='gems'?'GEMS':'COINS'}`,{...TEXT.hud,fontSize:'12px',color:equipped?'#8df0b8':'#ffd66b'}).setOrigin(1,.5);
    root.add([g,preview,name,kind,action]).setSize(448,70).setData('item-id',item.id).setData('preview-kind',item.booster||item.kind);makeInteractive(root,()=>this.useItem(item,owned));
  }
  itemStatus(item,owned,equipped){if(item.kind==='booster')return `BOOSTER  •  OWNED ${this.save.boosters[item.booster]||0}`;if(equipped)return `${item.kind.toUpperCase()}  •  EQUIPPED`;return `${item.kind.toUpperCase()}  •  ${owned?'OWNED':'AVAILABLE'}`;}
  createItemPreview(item,x,y){
    const root=this.add.container(x,y),halo=this.add.circle(0,0,24,item.kind==='booster'?0x783619:0x164f40,.95).setStrokeStyle(2,0xe8b64d);root.add(halo);
    if(item.id==='tile-jade'&&this.textures.exists(PREMIUM_TEXTURES.tileBody.key)){
      const tile=this.add.image(0,1,PREMIUM_TEXTURES.tileBody.key).setDisplaySize(38,46),leaf=this.add.graphics();leaf.fillStyle(0x76c944).fillEllipse(-3,-2,11,19).fillStyle(0x2f8d3f).fillEllipse(5,2,10,17).lineStyle(2,0xe8d66b).lineBetween(-7,8,8,-7);root.add([tile,leaf]);
    }else if(item.id==='tray-lotus'&&this.textures.exists(PREMIUM_TEXTURES.tray.key)){
      const tray=this.add.image(0,3,PREMIUM_TEXTURES.tray.key).setDisplaySize(48,19),lotus=this.add.graphics();lotus.fillStyle(0xf08bae).fillEllipse(-6,-7,9,14).fillEllipse(6,-7,9,14).fillStyle(0xffc6d8).fillEllipse(0,-10,9,16).fillStyle(0xf2c64e).fillCircle(0,-5,3);root.add([tray,lotus]);
    }else if(item.id==='celebration-petals'){
      const petals=this.add.graphics();for(let i=0;i<6;i++){const a=i*Math.PI/3,px=Math.cos(a)*11,py=Math.sin(a)*11;petals.fillStyle(i%2?0xf6b2cc:0xf2d16b).fillEllipse(px,py,9,15);}petals.fillStyle(0xffe27b).fillCircle(0,0,5);root.add(petals);
    }else{
      const glyph=this.add.graphics(),kind=item.booster||item.kind;drawGlyph(glyph,kind,0xffdc67);root.add(glyph);
    }
    return root;
  }
  useItem(item,owned){
    const before=JSON.parse(JSON.stringify(this.save)),result=owned&&item.kind!=='booster'?equipItem(this.save,item.id):purchaseCatalogItem(this.save,item.id,operationId(`shop:${item.id}`));
    if(result.ok){const saved=SaveManager.save(this.save);if(saved.ok){this.scene.restart();return;}this.save=before;this.modal.show({variant:'danger',kind:'close',title:'Save Unavailable',body:'The purchase was rolled back because progress could not be stored.',primary:'CONTINUE'});return;}
    this.modal.show({variant:'danger',kind:'close',title:'Not Available',body:result.reason==='insufficient-funds'?'Earn more currency before buying this item.':result.reason,primary:'CONTINUE'});
  }
  claimDaily(){const before=JSON.parse(JSON.stringify(this.save)),result=claimDailyReward(this.save);if(result.ok&&!SaveManager.save(this.save).ok){this.save=before;this.modal.show({variant:'danger',kind:'close',title:'Save Unavailable',body:'The daily reward was rolled back because progress could not be stored.',primary:'CONTINUE'});return;}const clockRollback=result.reason==='clock-rollback';this.modal.show({kind:result.ok?'reward':'close',title:result.ok?'Daily Gift':clockRollback?'Clock Check':'Already Claimed',subtitle:result.ok?`Streak day ${result.streak}`:clockRollback?'Device date moved backward':'Come back after 00:00 UTC',body:result.ok?`+${result.reward.coins} coins${result.reward.gems?`\n+${result.reward.gems} gems`:''}`:clockRollback?'Offline rewards cannot verify an earlier date. Restore the correct date and try again.':'One verified claim is allowed per UTC day.',primary:'CONTINUE',onPrimary:()=>this.scene.restart()});}
}
