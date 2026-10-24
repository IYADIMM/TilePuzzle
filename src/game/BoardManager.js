import Phaser from 'phaser';
import { generateLevel } from '../logic/LevelGenerator.js';
import { computeAccessibility } from '../logic/LevelSolver.js';
import { projectBoard,tileScreenPosition } from '../ui/LayoutManager.js';
import { Tile } from './Tile.js';
import { getAudioManager } from '../audio/AudioManager.js';
import { planHint,planShuffle } from '../logic/BoardActions.js';
import { createTileSkinResolver } from '../art/TileStyleRegistry.js';

export class BoardManager {
  constructor(scene,config,bounds,onSelect,styleId='illustrated'){this.scene=scene;this.config=config;this.bounds=bounds;this.onSelect=onSelect;this.tiles=[];this.locked=false;this.revision=0;this.actionToken=0;const query=new URLSearchParams(location.search);this.debugEnabled=import.meta.env.DEV&&query.get('debugGrid')==='1';this.level=generateLevel(config);this.skinResolver=createTileSkinResolver(styleId,this.level.tiles.map(tile=>tile.typeId));this.projection=projectBoard(this.level.tiles,bounds);this.pointerDebug=null;}
  create(){
    this.scene.input.topOnly=true;this.level.tiles.forEach((data,index)=>{const p=tileScreenPosition(data,this.projection);Object.assign(data,{homeX:p.x,homeY:p.y,alive:true,blockedBy:[],blockReason:'selectable'});const tile=new Tile(this.scene,data,p.x,p.y,this.projection,this.config.materialId,this.skinResolver).setDepth(this.depthFor(data));tile.flipIn(Math.min(260,index*6));this.tiles.push(tile);});
    this.pointerHandler=pointer=>this.routePointer(pointer);this.scene.input.on('pointerdown',this.pointerHandler);this.scene.events.once('shutdown',()=>this.scene.input.off('pointerdown',this.pointerHandler));
    this.refreshBlocking();if(this.debugEnabled)this.createDebugOverlay();return this;
  }
  routePointer(pointer){
    const x=pointer.worldX,y=pointer.worldY;this.pointerDebug={x,y};
    const tile=this.activeTiles.filter(candidate=>Phaser.Geom.Rectangle.Contains(candidate.getTouchBounds(),x,y)).sort((a,b)=>b.depth-a.depth)[0];
    if(!tile){this.updateDebug(`MISS ${Math.round(x)},${Math.round(y)}`);if(this.debugEnabled)this.redrawDebug();return false;}
    return this.requestSelection(tile);
  }
  requestSelection(tile){
    this.refreshBlocking();const reason=this.rejectionReason(tile);
    if(reason){this.scene.events.emit('invalid-selection',{tile,reason});this.updateDebug(`REJECT ${tile?.tileData?.id||'unknown'}: ${reason}`);return false;}
    this.locked=true;tile.disableInteractive();tile.setSelected(true);getAudioManager(this.scene)?.play('tile_select');this.updateDebug(`ACCEPT ${tile.tileData.id}`);this.scene.events.emit('tile-selected',tile);this.onSelect(tile);return true;
  }
  rejectionReason(tile){if(!tile||!this.tiles.includes(tile))return'unknown-tile';if(this.locked)return'input-locked';if(tile.isCollected||tile.tileData.alive===false)return'already-removed';if(tile.isBlocked)return`${tile.tileData.blockReason}:${tile.tileData.blockedBy.join(',')}`;if(!tile.input?.enabled)return'hitbox-disabled';return'';}
  collect(tile){this.revision++;tile.isCollected=true;tile.tileData.alive=false;tile.disableInteractive();this.refreshBlocking();}
  restore(tile){this.revision++;tile.isCollected=false;tile.tileData.alive=true;tile.setVisible(true).setAlpha(1).setScale(1).setAngle(0).setPosition(tile.tileData.homeX,tile.tileData.homeY).setDepth(this.depthFor(tile.tileData));this.refreshBlocking();}
  setLocked(value){this.locked=Boolean(value);}
  applyStyle(styleId){this.actionToken++;this.skinResolver=createTileSkinResolver(styleId,this.tiles.map(tile=>tile.typeId));this.tiles.forEach(tile=>tile.applySkin(this.skinResolver));this.refreshBlocking();return this.skinResolver.styleId;}
  refreshBlocking(){
    const previouslyBlocked=new Map(this.tiles.map(tile=>[tile.tileData.id,tile.isBlocked])),active=this.activeTiles,aliveIds=new Set(active.map(tile=>tile.tileData.id)),access=computeAccessibility(this.level.tiles,aliveIds);
    active.forEach(tile=>{const details=access.get(tile.tileData.id);tile.tileData.blockedBy=details.blockerIds;tile.tileData.blockReason=details.reason;tile.tileData.access=details;tile.setBlocked(details.blocked,details.reason);if(previouslyBlocked.get(tile.tileData.id)&&!details.blocked){tile.revealGlint();this.scene.events.emit('tile-exposed',tile);}});
    if(this.debugEnabled)this.redrawDebug();
  }
  async hint(trayEntries=[]){
    const token=++this.actionToken,revision=this.revision,logical=this.activeTiles.map(tile=>({...tile.tileData,alive:true}));
    const activeIds=new Set(logical.map(tile=>tile.id)),known=this.level.solution.filter(id=>activeIds.has(id));
    const plan=await defer(()=>planHint(logical,trayEntries,24000,known));
    if(token!==this.actionToken||revision!==this.revision)return{ok:false,reason:'stale'};
    if(!plan.ok)return plan;
    const tile=this.tiles.find(candidate=>candidate.tileData.id===plan.tileId);
    this.refreshBlocking();if(!tile||tile.isCollected||tile.isBlocked||!tile.input?.enabled)return{ok:false,reason:'stale-or-blocked'};
    tile.pulseHint();return{...plan,ok:true};
  }
  async shuffle(trayEntries=[]){
    const token=++this.actionToken,revision=this.revision,active=this.activeTiles,old=active.map(tile=>tile.typeId),logical=active.map(tile=>({...tile.tileData,alive:true}));
    const candidates=Array.from({length:10},()=>Phaser.Utils.Array.Shuffle([...old]));
    const plan=await defer(()=>planShuffle(logical,trayEntries,candidates,24000));
    if(token!==this.actionToken||revision!==this.revision)return{ok:false,reason:'stale'};
    if(!plan.ok)return plan;
    this.locked=true;await this.animateShuffle(active,old,plan.assignment,token);
    if(token!==this.actionToken||revision!==this.revision){this.locked=false;return{ok:false,reason:'stale'};}
    active.forEach((tile,index)=>tile.setSymbol(plan.assignment[index]));this.revision++;this.refreshBlocking();this.locked=false;return{...plan,ok:true};
  }
  async animateShuffle(active,old,assignment,token){
    const used=new Set(),moves=old.map((typeId,index)=>{const destination=assignment.findIndex((candidate,j)=>candidate===typeId&&!used.has(j));used.add(destination);return{source:active[index],destination:active[destination]};});
    const reduced=Boolean(this.scene.reducedMotion),proxies=moves.map(({source})=>this.scene.add.image(source.x,source.y,source.icon.texture.key).setDisplaySize(source.icon.displayWidth,source.icon.displayHeight).setDepth(1700));
    active.forEach(tile=>{tile.icon.setAlpha(0);tile.iconShadow.setAlpha(0);});
    try{await Promise.all(proxies.map((proxy,index)=>new Promise(resolve=>this.scene.tweens.add({targets:proxy,x:moves[index].destination.x,y:moves[index].destination.y,alpha:reduced?0:1,duration:reduced?90:260,delay:reduced?0:(index%6)*12,ease:'Sine.InOut',onComplete:resolve,onStop:resolve}))));}
    finally{proxies.forEach(proxy=>proxy.destroy());active.filter(tile=>tile?.active).forEach(tile=>{tile.icon.setAlpha(1);tile.iconShadow.setAlpha(tile.isBlocked?.14:.24);});}
  }
  createDebugOverlay(){this.debugGraphics=this.scene.add.graphics().setDepth(1900);this.debugLabel=this.scene.add.text(24,154,'DEBUG',{fontFamily:'monospace',fontSize:'11px',color:'#9effcf',backgroundColor:'#041b16',padding:{x:6,y:4}}).setDepth(1901);this.debugTileLabels=this.tiles.map(tile=>this.scene.add.text(tile.x,tile.y,`${tile.tileData.id}\nL${tile.tileData.layer}`,{fontFamily:'monospace',fontSize:'8px',align:'center',color:'#ffffff',backgroundColor:'#00100bbb'}).setOrigin(.5).setDepth(1901));this.redrawDebug();}
  redrawDebug(){if(!this.debugGraphics)return;this.debugGraphics.clear().lineStyle(1,0x71f5c0,.72).strokeRect(this.bounds.left,this.bounds.top,this.bounds.right-this.bounds.left,this.bounds.bottom-this.bounds.top);this.tiles.forEach((tile,index)=>{const face=tile.getFaceBounds(),touch=tile.getTouchBounds(),blocked=tile.isBlocked;this.debugGraphics.lineStyle(1,0xffd85b,.72).strokeRect(touch.x,touch.y,touch.width,touch.height).lineStyle(2,blocked?0xff785f:0x71f5c0,.9).strokeRect(face.x,face.y,face.width,face.height);const access=tile.tileData.access;this.debugTileLabels[index]?.setPosition(tile.x,tile.y).setText(`${tile.tileData.id}\n${blocked?tile.tileData.blockReason:'SELECTABLE'}\nL:${access?.left?.length||0} R:${access?.right?.length||0} T:${access?.top?.length||0}`).setVisible(!tile.isCollected);});if(this.pointerDebug)this.debugGraphics.fillStyle(0xffff66,1).fillCircle(this.pointerDebug.x,this.pointerDebug.y,5);}
  updateDebug(message){this.debugLabel?.setText(message);}
  depthFor(data){return 50+data.layer*1000+data.row*10+data.col;}
  get activeTiles(){return this.tiles.filter(tile=>tile.active&&!tile.isCollected&&tile.tileData.alive!==false);}
  get selectableTiles(){return this.activeTiles.filter(tile=>!tile.isBlocked&&tile.input?.enabled);}
}

function defer(work){return new Promise(resolve=>setTimeout(()=>resolve(work()),0));}
