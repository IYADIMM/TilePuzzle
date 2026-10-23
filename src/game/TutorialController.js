import Phaser from 'phaser';
import { TEXT } from '../theme.js';
import { SaveManager } from '../systems/SaveManager.js';

export class TutorialController{
  constructor(scene){this.scene=scene;this.save=scene.save;this.enabled=scene.levelNumber===1&&!this.save.tutorial.completed&&!this.save.tutorial.dismissed;this.step='edge';this.listeners=[];if(this.enabled)this.create();}
  create(){
    const s=this.scene;this.layer=s.add.container(0,0).setDepth(1650);this.panel=s.add.graphics();this.title=s.add.text(72,164,'',{...TEXT.hud,fontSize:'13px',color:'#ffe278',letterSpacing:1.2}).setOrigin(0,.5);this.copy=s.add.text(72,187,'',{...TEXT.hud,fontSize:'14px',color:'#f5fff9',wordWrap:{width:370},lineSpacing:3}).setOrigin(0,0);this.pointer=s.add.graphics().fillStyle(0xffdd67,1).fillCircle(0,0,9).lineStyle(4,0xffffff,.85).strokeCircle(0,0,14);this.skip=s.add.text(468,166,'SKIP',{...TEXT.hud,fontSize:'12px',color:'#d8e8df'}).setOrigin(.5).setInteractive({useHandCursor:true}).on('pointerup',()=>this.finish(true));this.layer.add([this.panel,this.title,this.copy,this.pointer,this.skip]);
    this.bind('tile-selected',()=>{if(this.step==='edge')this.showBlocked();});this.bind('invalid-selection',()=>{if(this.step==='blocked')this.showUnlock();});this.bind('tile-exposed',tile=>{if(this.step==='unlock')this.showPair(tile);});this.bind('tutorial-match',()=>this.showDanger());this.bind('shutdown',()=>this.destroy(),true);s.time.delayedCall(420,()=>this.showEdge());
  }
  bind(event,handler,once=false){this.scene.events[once?'once':'on'](event,handler);this.listeners.push([event,handler]);}
  showEdge(){if(!this.enabled)return;const target=this.scene.board.selectableTiles[0];this.show('1  •  FREE EDGE','Choose a bright tile with no tile above it and at least one open side.',target);}
  showBlocked(){const target=this.scene.board.activeTiles.find(tile=>tile.isBlocked);this.step='blocked';this.show('2  •  BLOCKED TILES','Try the dimmed tile. A tile above it—or neighbors on both sides—keeps it locked.',target);}
  showUnlock(){this.step='unlock';this.show('3  •  OPEN A SIDE','Remove a neighboring free tile. Newly exposed pieces brighten immediately.',this.scene.board.selectableTiles[0]);}
  showPair(tile){this.step='pair';this.show('4  •  MATCH TWO','Collect two identical symbols. The pair clears instantly.',tile||this.scene.board.selectableTiles[0]);}
  showDanger(){this.step='danger';this.show('5  •  FOUR-SLOT TRAY','Four different tiles fill the tray. Plan matches before the fourth unmatched tile lands.',{x:this.scene.layout.tray.x,y:this.scene.layout.tray.y});this.scene.time.delayedCall(this.scene.reducedMotion?700:1800,()=>this.finish(false));}
  show(title,copy,target){if(!this.enabled)return;this.panel.clear().fillStyle(0x031b16,.94).fillRoundedRect(52,146,436,78,18).lineStyle(2,0xe7b64b,.92).strokeRoundedRect(52,146,436,78,18).fillStyle(0xffffff,.06).fillRoundedRect(64,153,410,8,4);this.title.setText(title);this.copy.setText(copy);this.movePointer(target);}
  movePointer(target){this.scene.tweens.killTweensOf(this.pointer);if(!target){this.pointer.setVisible(false);return;}this.pointer.setVisible(true).setPosition(target.x,target.y);if(!this.scene.reducedMotion)this.scene.tweens.add({targets:this.pointer,y:target.y-12,alpha:.55,duration:520,yoyo:true,repeat:-1,ease:'Sine.InOut'});}
  finish(dismissed){if(!this.enabled)return;this.enabled=false;this.save.tutorial={completed:!dismissed,dismissed:Boolean(dismissed),completedAt:!dismissed?Date.now():null};SaveManager.save(this.save);this.destroy();}
  destroy(){this.scene?.tweens?.killTweensOf(this.pointer);this.listeners.forEach(([event,handler])=>this.scene?.events?.off(event,handler));this.listeners=[];this.layer?.destroy(true);}
}
