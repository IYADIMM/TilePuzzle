import Phaser from 'phaser';
import { THEME,TEXT } from '../theme.js';
import { getLevelConfig } from '../data/levels.js';
import { getTheme } from '../data/themes.js';
import { BoardManager } from '../game/BoardManager.js';
import { SlotManager } from '../game/SlotManager.js';
import { Modal } from '../ui/Modal.js';
import { addIconButton,addPill,addToolButton } from '../ui/components.js';
import { createLayout,applyDesignCamera } from '../ui/LayoutManager.js';
import { SaveManager } from '../systems/SaveManager.js';
import { completeLevel } from '../systems/ProgressionManager.js';
import { canCompleteLevel } from '../logic/VictoryState.js';

export class GameScene extends Phaser.Scene {
  constructor(){super('Game');}
  init(data){this.levelNumber=Math.max(1,Math.min(30,Number(data.level)||1));}
  create(){
    applyDesignCamera(this);this.save=SaveManager.load();this.level=getLevelConfig(this.levelNumber);this.theme=getTheme(this.level.themeId);this.layout=createLayout(540,960);
    this.score=0;this.combo=0;this.displayScore=0;this.boostersUsed=0;this.startedAt=performance.now();this.history=[];this.gameEnded=false;this.victoryEmitted=false;this.modal=new Modal(this);this.reducedMotion=Boolean(this.save.prefs.reducedMotion||matchMedia?.('(prefers-reduced-motion: reduce)').matches);
    this.drawBackground();this.createHud();this.board=new BoardManager(this,this.level,this.layout.board,tile=>this.selectTile(tile)).create();
    this.tray=new SlotManager(this,this.layout,{onAtomicClear:(tiles,result)=>this.smashMatch(tiles,result),onFull:result=>this.lose(result),onSettled:()=>this.afterSettled()});
    this.createBoosters();this.onInvalid=payload=>this.invalidFeedback(payload);this.events.on('invalid-selection',this.onInvalid);this.events.once('shutdown',()=>this.cleanup());
  }

  drawBackground(){
    const g=this.add.graphics();g.fillGradientStyle(0x1b654f,0x10513f,0x07382f,0x031e1a,1).fillRect(-300,-400,1140,1760);
    g.fillStyle(0x000000,.13).fillEllipse(270,418,500,585);
    for(let i=0;i<190;i++)g.fillStyle(i%4?0xffffff:0x021511,Phaser.Math.FloatBetween(.008,.03)).fillCircle(Phaser.Math.Between(18,522),Phaser.Math.Between(-100,1080),Phaser.Math.Between(1,3));
    g.fillStyle(0x240b04).fillRect(0,-400,20,1760).fillRect(520,-400,20,1760);g.fillGradientStyle(0xbe6b35,0x7c371b,0x391407,0x64270f,1).fillRect(5,-400,11,1760).fillRect(524,-400,11,1760);g.fillStyle(0xffffff,.13).fillRect(7,-400,3,1760).fillRect(527,-400,3,1760);g.fillStyle(THEME.gold,.8).fillRect(16,-400,2,1760).fillRect(522,-400,2,1760);
    drawLeaves(g,18,134,1);drawLeaves(g,522,134,-1);drawLeaves(g,18,785,1);drawLeaves(g,522,785,-1);
  }

  createHud(){
    addPill(this,116,53,166,`LEVEL ${this.levelNumber}`);this.scorePill=addPill(this,310,53,192,'SCORE  0');addIconButton(this,486,53,'pause',()=>this.pauseGame(),'Pause');
    this.add.text(270,103,this.theme.name.toUpperCase(),{...TEXT.hud,fontSize:'16px',color:'#f7cf57',letterSpacing:2.4,stroke:'#2c1008',strokeThickness:3}).setOrigin(.5);
    this.remainingText=this.add.text(270,132,`${this.level.tileCount} TILES LEFT`,{...TEXT.hud,fontSize:'12px',color:'#e5f1e8',letterSpacing:1.3,stroke:'#093027',strokeThickness:3}).setOrigin(.5);
  }

  createBoosters(){
    const configs=[['hint',104,'HINT'],['shuffle',270,'SHUFFLE'],['undo',436,'UNDO']];this.boosterButtons={};this.badges={};
    configs.forEach(([key,x,label])=>{const button=addToolButton(this,x,867,142,label,key,()=>this[key](),this.save.boosters[key]);this.boosterButtons[key]=button;this.badges[key]=button.getData('badgeText');});
  }

  snapshot(){return{score:this.score,combo:this.combo,tray:this.tray.entries.map(entry=>({...entry})),tiles:this.board.tiles.map(tile=>({id:tile.tileData.id,collected:tile.isCollected,alive:tile.tileData.alive,typeId:tile.typeId,x:tile.x,y:tile.y,visible:tile.visible,alpha:tile.alpha,scaleX:tile.scaleX,scaleY:tile.scaleY,depth:tile.depth}))};}
  selectTile(tile){
    if(this.gameEnded||this.tray.isBusy){this.board.setLocked(this.gameEnded);return;}
    const snapshot=this.snapshot();this.history.push(snapshot);this.board.collect(tile);const result=this.tray.commit(tile);
    if(!result.accepted){this.history.pop();this.board.restore(tile);this.board.setLocked(false);}this.updateRemaining();
  }
  afterSettled(){if(this.gameEnded)return;this.board.setLocked(false);this.updateRemaining();if(canCompleteLevel({remainingBoard:this.board.activeTiles.length,trayCount:this.tray.entries.length,busy:this.tray.isBusy,alreadyEmitted:this.victoryEmitted}))this.win();}
  smashMatch(){
    this.combo++;const levelFactor=1+Math.floor((this.levelNumber-1)/6)*.12,gain=Math.round(300*this.combo*levelFactor);this.score+=gain;this.animateScore(this.score);haptic(this.save,[14,18,16]);const x=this.layout.tray.x,y=this.layout.tray.y;this.emitSmashFx(x,y);this.floatCelebration(x,y-65,this.combo>=5?'PERFECT!':this.combo>=3?`COMBO ${this.combo}  +${gain}`:this.combo===2?`GREAT!  +${gain}`:`TRIPLE  +${gain}`);
  }
  animateScore(target){const from=this.displayScore,counter={value:from};this.tweens.add({targets:counter,value:target,duration:this.reducedMotion?80:430,ease:'Cubic.Out',onUpdate:()=>{this.displayScore=Math.round(counter.value);this.scorePill.list.at(-1)?.setText(`SCORE  ${this.displayScore.toLocaleString()}`);}});}
  emitSmashFx(x,y){const quantity=this.reducedMotion?5:13,flecks=this.add.particles(x,y,'fx:shard',{speed:{min:38,max:115},lifespan:{min:420,max:720},quantity,scale:{start:.32,end:0},gravityY:70,tint:[0xfffdf2,0xeee8dc,0xffe8a0],emitting:false}).setDepth(1001),sparks=this.add.particles(x,y,'fx:spark',{speed:{min:28,max:92},lifespan:560,quantity:9,scale:{start:.42,end:0},blendMode:'ADD',tint:[0xffd45c,0xfff4ad],emitting:false}).setDepth(1002),ring=this.add.circle(x,y,25,0xffd45c,.08).setStrokeStyle(6,0xffe57e,.95).setDepth(1000);flecks.explode(quantity);sparks.explode(this.reducedMotion?4:9);this.tweens.add({targets:ring,scale:3.4,alpha:0,duration:this.reducedMotion?220:560,ease:'Cubic.Out',onComplete:()=>ring.destroy()});this.time.delayedCall(780,()=>{flecks.destroy();sparks.destroy();});}
  floatCelebration(x,y,copy){const label=this.add.text(x,y,copy,{...TEXT.title,fontSize:'34px',color:'#ffe16d',stroke:'#3b1005',strokeThickness:8}).setOrigin(.5).setDepth(1200).setScale(.4);this.tweens.add({targets:label,y:y-(this.reducedMotion?28:68),scale:1.08,alpha:0,duration:this.reducedMotion?380:780,ease:'Back.Out',onComplete:()=>label.destroy()});}
  invalidFeedback({tile,reason}){if(tile&&!this.reducedMotion)this.tweens.add({targets:tile,x:tile.x+3,duration:34,yoyo:true,repeat:2});this.board.updateDebug(`REJECT ${tile?.tileData?.id||''}: ${reason}`);haptic(this.save,8);}
  updateRemaining(){this.remainingText.setText(`${this.board.activeTiles.length} TILES LEFT`);}
  useBooster(key,action){if(this.gameEnded||this.board.locked||this.tray.isBusy)return;if(this.save.boosters[key]<=0){this.floatCelebration(270,812,'EMPTY');return;}if(!action())return;this.boostersUsed++;this.save.boosters[key]--;this.badges[key].setText(String(this.save.boosters[key]));SaveManager.save(this.save);haptic(this.save,12);}
  undo(){this.useBooster('undo',()=>{const snap=this.history.pop();if(!snap){this.floatCelebration(270,812,'NOTHING TO UNDO');return false;}const byId=new Map(this.board.tiles.map(tile=>[tile.tileData.id,tile]));this.board.tiles.forEach(tile=>{const state=snap.tiles.find(item=>item.id===tile.tileData.id);this.tweens.killTweensOf(tile);tile.isCollected=state.collected;tile.tileData.alive=state.alive;tile.setSymbol(state.typeId);tile.setData('trayDetached',false).setPosition(state.x,state.y).setVisible(state.visible).setAlpha(state.alpha).setScale(state.scaleX,state.scaleY).setAngle(0).setDepth(state.depth);});this.score=snap.score;this.combo=snap.combo;this.displayScore=snap.score;this.scorePill.list.at(-1)?.setText(`SCORE  ${this.score.toLocaleString()}`);this.tray.restore(snap.tray,byId);this.board.refreshBlocking();this.updateRemaining();return true;});}
  hint(){this.useBooster('hint',()=>this.board.hint(this.tray.entries));}
  shuffle(){this.useBooster('shuffle',()=>{const ok=this.board.shuffle(this.tray.entries);if(ok&&!this.reducedMotion)this.cameras.main.shake(90,.002);else if(!ok)this.floatCelebration(270,812,'TRY LATER');return ok;});}
  lose(){if(this.gameEnded)return;this.gameEnded=true;this.board.setLocked(true);this.time.delayedCall(this.reducedMotion?0:150,()=>this.modal.show({variant:'danger',title:'Tray Full',subtitle:'Four unmatched tiles',kind:'close',body:`Score  ${this.score.toLocaleString()}\nBuild a trio before the fourth unique tile arrives.`,primary:'TRY AGAIN',onPrimary:()=>this.scene.restart({level:this.levelNumber}),secondary:'LEVEL SELECT',onSecondary:()=>this.scene.start('LevelSelect')}));}
  win(){if(this.gameEnded||!canCompleteLevel({remainingBoard:this.board.activeTiles.length,trayCount:this.tray.entries.length,busy:this.tray.isBusy,alreadyEmitted:this.victoryEmitted}))return false;this.victoryEmitted=true;this.gameEnded=true;this.board.setLocked(true);const seconds=Math.max(1,Math.round((performance.now()-this.startedAt)/1000)),reward=completeLevel(this.save,{level:this.levelNumber,score:this.score,combo:this.combo,boostersUsed:this.boostersUsed,seconds});SaveManager.save(this.save);if(!this.reducedMotion)this.cameras.main.flash(260,255,235,156);this.time.delayedCall(this.reducedMotion?0:320,()=>this.scene.start('Reward',{level:this.levelNumber,score:this.score,combo:this.combo,seconds,reward}));return true;}
  confirmHome(){this.modal.show({title:'Leave Level?',kind:'back',body:'Current board progress will be lost.',primary:'KEEP PLAYING',secondary:'LEAVE',onSecondary:()=>this.scene.start('Menu')});}
  pauseGame(){this.board.setLocked(true);this.modal.show({title:'Paused',kind:'pause',body:`Audio is disabled\nHaptics  ${this.save.prefs.haptics?'ON':'OFF'}\nThe garden will wait.`,primary:'RESUME',onPrimary:()=>this.board.setLocked(false),secondary:'RESTART',onSecondary:()=>this.scene.restart({level:this.levelNumber})});}
  cleanup(){this.events.off('invalid-selection',this.onInvalid);this.tray?.dispose();this.tweens.killAll();}
}

function haptic(save,pattern){if(save.prefs.haptics&&navigator.vibrate)navigator.vibrate(pattern);}
function drawLeaves(g,x,y,dir){g.fillStyle(0x164f25,.8);for(let i=0;i<3;i++){g.fillEllipse(x+dir*(14+i*11),y+i*18,24,12);g.lineStyle(1,0x70a84b,.45).strokeEllipse(x+dir*(14+i*11),y+i*18,24,12);}}
