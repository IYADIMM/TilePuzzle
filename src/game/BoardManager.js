import Phaser from 'phaser';
import { generateLevel } from '../logic/LevelGenerator.js';
import { solveLevel,computeAccessibility } from '../logic/LevelSolver.js';
import { projectBoard,tileScreenPosition } from '../ui/LayoutManager.js';
import { Tile } from './Tile.js';
import { getAudioManager } from '../audio/AudioManager.js';

export class BoardManager {
  constructor(scene,config,bounds,onSelect){this.scene=scene;this.config=config;this.bounds=bounds;this.onSelect=onSelect;this.tiles=[];this.locked=false;const query=new URLSearchParams(location.search);this.debugEnabled=import.meta.env.DEV&&query.get('debugGrid')==='1';this.level=generateLevel(config);this.projection=projectBoard(this.level.tiles,bounds);this.pointerDebug=null;}
  create(){
    this.scene.input.topOnly=true;this.inputCatcher=this.scene.add.rectangle((this.bounds.left+this.bounds.right)/2,(this.bounds.top+this.bounds.bottom)/2,this.bounds.right-this.bounds.left,this.bounds.bottom-this.bounds.top,0xffffff,.001).setDepth(1).setInteractive();this.inputCatcher.on('pointerup',pointer=>{this.pointerDebug={x:pointer.worldX,y:pointer.worldY};const tile=this.activeTiles.filter(candidate=>candidate.isBlocked&&Phaser.Geom.Rectangle.Contains(candidate.getFaceBounds(),pointer.worldX,pointer.worldY)).sort((a,b)=>b.depth-a.depth)[0];if(tile)this.requestSelection(tile);});this.level.tiles.forEach((data,index)=>{const p=tileScreenPosition(data,this.projection);Object.assign(data,{homeX:p.x,homeY:p.y,alive:true,blockedBy:[],blockReason:'selectable'});const tile=new Tile(this.scene,data,p.x,p.y,this.projection,this.config.materialId).setDepth(this.depthFor(data));tile.on('pointerup',pointer=>{this.pointerDebug={x:pointer.worldX,y:pointer.worldY};this.requestSelection(tile);});tile.flipIn(Math.min(260,index*6));this.tiles.push(tile);});
    this.refreshBlocking();if(this.debugEnabled)this.createDebugOverlay();return this;
  }
  requestSelection(tile){
    this.refreshBlocking();const reason=this.rejectionReason(tile);
    if(reason){this.scene.events.emit('invalid-selection',{tile,reason});this.updateDebug(`REJECT ${tile?.tileData?.id||'unknown'}: ${reason}`);return false;}
    this.locked=true;tile.disableInteractive();tile.setSelected(true);getAudioManager(this.scene)?.play('tile_select');this.updateDebug(`ACCEPT ${tile.tileData.id}`);this.scene.events.emit('tile-selected',tile);this.onSelect(tile);return true;
  }
  rejectionReason(tile){if(!tile||!this.tiles.includes(tile))return'unknown-tile';if(this.locked)return'input-locked';if(tile.isCollected||tile.tileData.alive===false)return'already-removed';if(tile.isBlocked)return`${tile.tileData.blockReason}:${tile.tileData.blockedBy.join(',')}`;if(!tile.input?.enabled)return'hitbox-disabled';return'';}
  collect(tile){tile.isCollected=true;tile.tileData.alive=false;tile.disableInteractive();this.refreshBlocking();}
  restore(tile){tile.isCollected=false;tile.tileData.alive=true;tile.setVisible(true).setAlpha(1).setScale(1).setAngle(0).setPosition(tile.tileData.homeX,tile.tileData.homeY).setDepth(this.depthFor(tile.tileData));this.refreshBlocking();}
  setLocked(value){this.locked=Boolean(value);}
  refreshBlocking(){
    const previouslyBlocked=new Map(this.tiles.map(tile=>[tile.tileData.id,tile.isBlocked])),active=this.activeTiles,aliveIds=new Set(active.map(tile=>tile.tileData.id)),access=computeAccessibility(this.level.tiles,aliveIds);
    active.forEach(tile=>{const details=access.get(tile.tileData.id);tile.tileData.blockedBy=details.blockerIds;tile.tileData.blockReason=details.reason;tile.tileData.access=details;tile.setBlocked(details.blocked,details.reason);if(previouslyBlocked.get(tile.tileData.id)&&!details.blocked){tile.revealGlint();this.scene.events.emit('tile-exposed',tile);}});
    if(this.debugEnabled)this.redrawDebug();
  }
  hint(trayEntries=[]){const logical=this.activeTiles.map(tile=>({...tile.tileData,alive:true})),solved=solveLevel(logical,trayEntries,[],24000),picks=solved.sequence.slice(0,3).map(id=>this.tiles.find(tile=>tile.tileData.id===id)).filter(Boolean);(picks.length?picks:this.selectableTiles.slice(0,3)).forEach((tile,index)=>this.scene.time.delayedCall(index*70,()=>tile.pulseHint()));return Boolean(picks.length||this.selectableTiles.length);}
  shuffle(trayEntries=[]){const active=this.activeTiles,old=active.map(tile=>tile.typeId),shuffled=Phaser.Utils.Array.Shuffle([...old]);active.forEach((tile,index)=>tile.setSymbol(shuffled[index]));const logical=active.map(tile=>({...tile.tileData,alive:true})),solvable=solveLevel(logical,trayEntries,[],24000).solved;if(!solvable)active.forEach((tile,index)=>tile.setSymbol(old[index]));this.refreshBlocking();return solvable;}
  createDebugOverlay(){this.debugGraphics=this.scene.add.graphics().setDepth(1900);this.debugLabel=this.scene.add.text(24,154,'DEBUG',{fontFamily:'monospace',fontSize:'11px',color:'#9effcf',backgroundColor:'#041b16',padding:{x:6,y:4}}).setDepth(1901);this.debugTileLabels=this.tiles.map(tile=>this.scene.add.text(tile.x,tile.y,`${tile.tileData.id}\nL${tile.tileData.layer}`,{fontFamily:'monospace',fontSize:'8px',align:'center',color:'#ffffff',backgroundColor:'#00100bbb'}).setOrigin(.5).setDepth(1901));this.redrawDebug();}
  redrawDebug(){if(!this.debugGraphics)return;this.debugGraphics.clear().lineStyle(1,0x71f5c0,.72).strokeRect(this.bounds.left,this.bounds.top,this.bounds.right-this.bounds.left,this.bounds.bottom-this.bounds.top);this.tiles.forEach((tile,index)=>{const b=tile.getFaceBounds(),blocked=tile.isBlocked;this.debugGraphics.lineStyle(2,blocked?0xff785f:0x71f5c0,.9).strokeRect(b.x,b.y,b.width,b.height);const access=tile.tileData.access;this.debugTileLabels[index]?.setPosition(tile.x,tile.y).setText(`${tile.tileData.id}\n${blocked?tile.tileData.blockReason:'SELECTABLE'}\nL:${access?.left?.length||0} R:${access?.right?.length||0} T:${access?.top?.length||0}`).setVisible(!tile.isCollected);});if(this.pointerDebug)this.debugGraphics.fillStyle(0xffff66,1).fillCircle(this.pointerDebug.x,this.pointerDebug.y,5);}
  updateDebug(message){this.debugLabel?.setText(message);}
  depthFor(data){return 50+data.layer*1000+data.row*10+data.col;}
  get activeTiles(){return this.tiles.filter(tile=>tile.active&&!tile.isCollected&&tile.tileData.alive!==false);}
  get selectableTiles(){return this.activeTiles.filter(tile=>!tile.isBlocked&&tile.input?.enabled);}
}
