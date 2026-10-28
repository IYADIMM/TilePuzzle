import Phaser from 'phaser';
import { THEME,TEXT } from '../theme.js';
import { iconTextureKey } from '../data/themes.js';
import { addPill,addProgressBar,addIconButton,addHomePrimaryButton,addIvoryButton } from '../ui/components.js';
import { Modal } from '../ui/Modal.js';
import { SaveManager } from '../systems/SaveManager.js';
import { applyDesignCamera } from '../ui/LayoutManager.js';
import { bindSceneAudio,getAudioManager } from '../audio/AudioManager.js';
import { createTileSkinResolver } from '../art/TileStyleRegistry.js';
import { claimTreasureReward } from '../logic/SaveTransactions.js';
import { GARDEN_TREASURES_ID } from '../data/gardenTreasures.js';

export class MenuScene extends Phaser.Scene {
  constructor(){super('Menu');}
  init(){applyDesignCamera(this);}
  create(){
    this.save=SaveManager.load();this.modal=new Modal(this);drawBackdrop(this);
    addIconButton(this,49,51,'settings',()=>this.showSettings(),'Settings');addPill(this,435,51,158,String(this.save.coins),'●',()=>this.scene.start('Shop'));
    const reduced=Boolean(this.save.prefs.reducedMotion),glow=this.add.ellipse(270,184,436,178,0xd4b456,.055);if(!reduced)this.tweens.add({targets:glow,alpha:.13,scale:1.05,duration:1600,yoyo:true,repeat:-1,ease:'Sine.InOut'});
    this.add.image(270,106,iconTextureKey('garden-lotus')).setDisplaySize(52,52);
    this.add.text(270,169,'IVORY MAHJONG',{...TEXT.title,fontFamily:'Cormorant Garamond, Georgia, serif',fontSize:'46px',color:'#fff0c6',stroke:'#6c310d',strokeThickness:5,shadow:{offsetY:6,color:'#071711',blur:7,fill:true},letterSpacing:.6}).setOrigin(.5);
    this.add.text(270,207,'A PREMIUM TILE MATCHING PUZZLE',{...TEXT.hud,fontSize:'10px',color:'#f1e6c7',letterSpacing:2.1}).setOrigin(.5);
    this.drawHeroTiles();
    const bonusResume=Boolean(this.save.activeBonusAttempt),playLevel=this.save.activeAttempt?.level||this.save.lastLevel,playLabel=bonusResume?'RESUME  •  GARDEN':`${this.save.activeAttempt?'RESUME':'PLAY'}  •  LEVEL ${playLevel}`;
    addHomePrimaryButton(this,270,493,446,playLabel,()=>bonusResume?this.scene.start('Game',{bonusId:GARDEN_TREASURES_ID}):this.scene.start('Game',{level:playLevel}));
    addIvoryButton(this,270,578,446,'TILE STYLES','styles',()=>this.scene.launch('TileStyleGallery',{hostKey:'Menu'}),{height:64,fontSize:21});
    addIvoryButton(this,151,657,210,'LEVELS','levels',()=>this.scene.start('LevelSelect'),{fontSize:18});addIvoryButton(this,389,657,210,'COLLECTION','collection',()=>this.scene.start('Collection'),{fontSize:17});
    addIvoryButton(this,151,727,210,'MY RECORDS','records',()=>this.scene.start('Leaderboard'),{fontSize:16});addIvoryButton(this,389,727,210,'ACHIEVEMENTS','achievements',()=>this.scene.start('Achievements'),{fontSize:15});
    const pending=this.save.queuedChestRewards?.length||0;this.add.text(270,790,pending?`TREASURE READY  •  ${pending} QUEUED`:'TREASURE TRAIL',{...TEXT.hud,fontFamily:'Cormorant Garamond, Georgia, serif',fontSize:'18px',color:'#f6cc55',letterSpacing:2,stroke:'#2f1007',strokeThickness:3}).setOrigin(.5);
    addProgressBar(this,238,829,310,pending?1:this.save.chestProgress/5,pending?'CLAIM READY':`${this.save.chestProgress} / 5`);addIconButton(this,435,829,'play',()=>this.showChest(),'Treasure');
    this.add.text(270,905,'MATCH TWO  •  RELAX  •  GROW YOUR COLLECTION',{...TEXT.hud,fontSize:'10px',color:'#e6ddc4',letterSpacing:1.4}).setOrigin(.5);
  }
  drawHeroTiles(){
    const ids=['cherries','blossom','orange'],resolver=createTileSkinResolver(this.save.prefs.tileStyle,ids);
    ids.forEach((id,index)=>{const x=158+index*112,y=347+(index===1?-22:7),tile=this.add.container(x,y).setAngle((index-1)*6),shadow=this.add.ellipse(6,65,122,27,0x000000,.38),body=this.add.image(0,0,resolver.bodyTextureKey('mahogany')).setDisplaySize(122,153),iconShadow=this.add.image(3,3,resolver.textureKey(id)).setDisplaySize(91,91).setTint(0x26332d).setAlpha(.18),icon=this.add.image(0,-5,resolver.textureKey(id)).setDisplaySize(91,91);tile.add([shadow,body,iconShadow,icon]);if(!this.save.prefs.reducedMotion)this.tweens.add({targets:tile,y:y-6,duration:1750+index*160,yoyo:true,repeat:-1,ease:'Sine.InOut'});});
  }
  showChest(){const milestone=this.save.queuedChestRewards?.[0],ready=Boolean(milestone);this.modal.show({kind:ready?'reward':'close',title:ready?'Treasure Ready':'Keep Playing',subtitle:ready?milestone.replace('levels:','Levels '):`${5-this.save.chestProgress} more levels`,body:ready?'+150 coins\n+1 Hint booster':'Clear unique levels to fill the treasure trail.',primary:ready?'CLAIM REWARD':'CONTINUE',onPrimary:()=>{if(!ready||this.claimPending)return;this.claimPending=true;const result=claimTreasureReward(this.save,milestone,data=>SaveManager.save(data));this.claimPending=false;if(!result.ok){this.modal.show({variant:'danger',kind:'close',title:'Reward Not Saved',body:'Your treasure is still ready. Check browser storage and try again.',primary:'TRY AGAIN',onPrimary:()=>this.showChest()});return;}getAudioManager(this)?.play('chest_open');this.scene.restart();}});}
  showSettings(){this.scene.launch('AudioSettings',{hostKey:'Menu'});}
  applyTileStyle(){this.scene.restart();}
}

export function drawBackdrop(scene,music='menu'){
  if(music)bindSceneAudio(scene,music);
  scene.add.image(270,480,'bg:premium-felt').setDisplaySize(540,1760);
  const g=scene.add.graphics();
  g.fillStyle(THEME.woodDark).fillRect(0,-400,19,1760).fillRect(521,-400,19,1760);g.fillGradientStyle(0xbe6a35,0x7f381c,0x3a1508,0x682910,1).fillRect(5,-400,10,1760).fillRect(525,-400,10,1760);g.fillStyle(0xffffff,.13).fillRect(7,-400,3,1760).fillRect(527,-400,3,1760);g.fillStyle(THEME.gold,.72).fillRect(15,-400,2,1760).fillRect(523,-400,2,1760);
  for(const [x,y,s] of [[28,115,1],[512,118,-1],[34,820,1],[506,824,-1]]){g.fillStyle(0x1c632e,.75);for(let i=0;i<4;i++)g.fillEllipse(x+s*i*12,y+i*14,30,14);}
}
export function prepareBackdrop(scene,music='menu'){applyDesignCamera(scene);drawBackdrop(scene,music);}
