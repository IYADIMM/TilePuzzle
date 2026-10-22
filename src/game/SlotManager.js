import Phaser from 'phaser';
import { createTrayState, reduceTray, TRAY_CAPACITY } from '../logic/SlotState.js';
import { quadraticBezierPoint } from '../logic/MotionMath.js';
import { PREMIUM_TEXTURES } from '../art/PremiumAssetManifest.js';
export { TRAY_CAPACITY };

export class SlotManager {
  constructor(scene, layout, callbacks = {}) {
    this.scene = scene;
    this.layout = layout;
    this.callbacks = callbacks;
    this.state = createTrayState();
    this.visuals = new Map();
    this.busy = false;
    this.transactionId = 0;
    this.destroyed = false;
    this.draw();
    scene.events.once('shutdown', () => this.dispose());
  }

  draw() {
    const { x, y, width, slotGap } = this.layout.tray;
    if(this.scene.textures.exists(PREMIUM_TEXTURES.tray.key)){
      this.frame=this.scene.add.image(x,y-8,PREMIUM_TEXTURES.tray.key).setDisplaySize(width+28,128).setDepth(400);
      return;
    }
    this.frame = this.scene.add.graphics().setDepth(400);
    this.frame.fillStyle(0x020402,.62).fillRoundedRect(x-width/2+5,y-50,width,111,29)
      .fillGradientStyle(0x9b4c25,0x672815,0x2d0e06,0x4c190b,1).fillRoundedRect(x-width/2,y-61,width,106,29)
      .lineStyle(8,0x250b04).strokeRoundedRect(x-width/2,y-61,width,106,29)
      .lineStyle(5,0xd9901c).strokeRoundedRect(x-width/2+8,y-53,width-16,90,23)
      .lineStyle(2,0xffffbd,.95).strokeRoundedRect(x-width/2+14,y-47,width-28,78,18)
      .fillStyle(0xffffff,.14).fillRoundedRect(x-width/2+24,y-42,width-48,9,5);
    for (let index=0; index<TRAY_CAPACITY; index++) {
      const sx=this.slotX(index), sw=slotGap*.78;
      this.frame.fillGradientStyle(0x211008,0x140806,0x080302,0x160906,1).fillRoundedRect(sx-sw/2,y-38,sw,69,13)
        .lineStyle(2,0xe6a63a,.34).strokeRoundedRect(sx-sw/2,y-38,sw,69,13)
        .fillStyle(0xffffff,.025).fillRoundedRect(sx-sw/2+7,y-31,sw-14,8,4);
    }
  }

  commit(tile) {
    if (this.destroyed || this.busy) return { accepted:false, reason:'busy', state:this.state };
    const result=reduceTray(this.state,{type:'INSERT',tile:{visualId:tile.tileData.id,typeId:tile.typeId}});
    if (!result.accepted) return result;

    // The complete authoritative result is committed before any tween, callback, or loss evaluation.
    this.state=result.state;
    this.visuals.set(tile.tileData.id,tile);
    const clearedTiles=result.cleared.map(entry=>this.visuals.get(entry.visualId)).filter(Boolean);
    const effectProxies=clearedTiles.map(clearedTile=>({tile:clearedTile,proxy:this.createEffectProxy(clearedTile)}));
    result.cleared.forEach(entry=>this.visuals.delete(entry.visualId));
    // Cleared GameObjects stop being active tray visuals in the same commit.
    // Independent particles provide the smash; no matched tile remains visible
    // while a timer or tween catches up with authoritative state.
    clearedTiles.forEach(clearedTile=>{
      this.scene.tweens.killTweensOf(clearedTile);
      clearedTile.setPendingMatch(false);
      clearedTile.setData('trayDetached',true).setVisible(false).setAlpha(0).disableInteractive();
    });
    const transaction=++this.transactionId;
    this.busy=true;

    this.updatePendingHighlights();
    this.animateCommittedState(tile,clearedTiles,effectProxies,transaction,result).then(()=>{
      if(this.destroyed||transaction!==this.transactionId)return;
      this.busy=false;
      this.callbacks.onSettled?.(result);
    });
    if(result.didClear)this.callbacks.onAtomicClear?.(clearedTiles,result);
    else if(result.full)this.callbacks.onFull?.(result);
    return {...result,clearedTiles,transaction};
  }

  async animateCommittedState(newTile,cleared,effectProxies,transaction,result) {
    const newTileCleared=cleared.includes(newTile);
    if(!newTileCleared){
      newTile.setDepth(430).setSelected(false);
      const destination=this.state.entries.findIndex(entry=>entry.visualId===newTile.tileData.id);
      await curveTween(this.scene,newTile,this.slotX(destination),this.layout.tray.y,390,()=>!this.destroyed&&transaction===this.transactionId);
      if(this.destroyed||transaction!==this.transactionId)return;
    }else{
      const arriving=effectProxies.find(item=>item.tile===newTile),resting=effectProxies.filter(item=>item!==arriving);
      if(arriving)await curveTween(this.scene,arriving.proxy,this.slotX(Math.min(TRAY_CAPACITY-1,result.insertAt)),this.layout.tray.y,390,()=>!this.destroyed&&transaction===this.transactionId,{endScale:.86,fade:false});
      if(this.destroyed||transaction!==this.transactionId)return;
      await Promise.all(effectProxies.map(({proxy})=>tween(this.scene,proxy,{alpha:0,scaleX:proxy.scaleX*1.08,scaleY:proxy.scaleY*1.08},resting.length?250:180,'Sine.InOut')));
      effectProxies.forEach(({proxy})=>proxy.destroy(true));
      if(this.destroyed||transaction!==this.transactionId)return;
    }
    await Promise.all(this.state.entries.map((entry,index)=>{
      const tile=this.visuals.get(entry.visualId);
      return tile?tween(this.scene,tile,{x:this.slotX(index),y:this.layout.tray.y,scaleX:.86,scaleY:.86,angle:0,alpha:1},260,'Sine.InOut'):Promise.resolve();
    }));
  }

  createEffectProxy(tile){
    const body=this.scene.add.image(0,4,tile.body.texture.key).setDisplaySize(tile.body.displayWidth,tile.body.displayHeight),icon=this.scene.add.image(0,-tile.geometry.tileH*.035,tile.icon.texture.key).setDisplaySize(tile.icon.displayWidth,tile.icon.displayHeight),proxy=this.scene.add.container(tile.x,tile.y,[body,icon]).setDepth(980).setScale(tile.scaleX,tile.scaleY);return proxy;
  }

  updatePendingHighlights(){const counts=this.state.entries.reduce((out,entry)=>(out[entry.typeId]=(out[entry.typeId]||0)+1,out),{});for(const [visualId,tile] of this.visuals)tile.setPendingMatch(counts[this.state.entries.find(entry=>entry.visualId===visualId)?.typeId]===2);}

  restore(entries,tileById) {
    this.transactionId++;
    this.busy=false;
    this.state=createTrayState(entries);
    this.visuals.clear();
    entries.forEach((entry,index)=>{
      const tile=tileById.get(entry.visualId);
      if(!tile)return;
      this.visuals.set(entry.visualId,tile);
      tile.isCollected=true;
      tile.setData('trayDetached',false);
      tile.setVisible(true).setAlpha(1).setScale(.86).setAngle(0).setPosition(this.slotX(index),this.layout.tray.y).setDepth(430+index).disableInteractive();
    });
    this.updatePendingHighlights();
  }

  dispose(){this.destroyed=true;this.transactionId++;this.busy=false;this.callbacks={};}
  slotX(index){return this.layout.tray.x-1.5*this.layout.tray.slotGap+index*this.layout.tray.slotGap;}
  get entries(){return this.state.entries;}
  get slots(){return this.state.entries.map(entry=>this.visuals.get(entry.visualId)).filter(Boolean);}
  get types(){return this.state.entries.map(entry=>entry.typeId);}
  get isBusy(){return this.busy;}
}

function tween(scene,target,props,duration,ease){return new Promise(resolve=>{if(!target?.active||!scene?.sys?.isActive()){resolve();return;}scene.tweens.killTweensOf(target);scene.tweens.add({targets:target,...props,duration,ease,onComplete:resolve,onStop:resolve});});}
function curveTween(scene,target,endX,endY,duration,isCurrent,{endScale=.86,fade=false}={}){return new Promise(resolve=>{if(!target?.active||!scene?.sys?.isActive()){resolve();return;}const startX=target.x,startY=target.y,startScaleX=target.scaleX,startScaleY=target.scaleY,controlX=(startX+endX)/2,controlY=Math.min(startY,endY)-Math.min(120,62+Math.abs(endY-startY)*.12),driver={t:0};const motion=scene.tweens.add({targets:driver,t:1,duration,ease:'Sine.InOut',onUpdate:()=>{if(!isCurrent()){motion.stop();return;}const point=quadraticBezierPoint(startX,startY,controlX,controlY,endX,endY,driver.t);target.setPosition(point.x,point.y);target.setScale(Phaser.Math.Linear(startScaleX,endScale,driver.t),Phaser.Math.Linear(startScaleY,endScale,driver.t));if(fade&&driver.t>.58)target.setAlpha(1-(driver.t-.58)/.42);},onComplete:resolve,onStop:resolve});});}
