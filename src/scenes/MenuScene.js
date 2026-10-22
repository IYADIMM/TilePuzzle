import Phaser from 'phaser';
import { THEME,TEXT } from '../theme.js';
import { iconTextureKey } from '../data/themes.js';
import { addGoldButton,addPill,addProgressBar,addIconButton } from '../ui/components.js';
import { Modal } from '../ui/Modal.js';
import { SaveManager } from '../systems/SaveManager.js';
import { applyDesignCamera } from '../ui/LayoutManager.js';
import { bindSceneAudio,getAudioManager } from '../audio/AudioManager.js';

export class MenuScene extends Phaser.Scene {
  constructor(){super('Menu');}
  init(){applyDesignCamera(this);}
  create(){
    this.save=SaveManager.load();this.modal=new Modal(this);drawBackdrop(this);
    addIconButton(this,53,53,'settings',()=>this.showSettings(),'Settings');addPill(this,437,53,150,String(this.save.coins),'◆');
    const glow=this.add.ellipse(270,182,430,190,0x72bd64,.08);this.tweens.add({targets:glow,alpha:.17,scale:1.08,duration:1200,yoyo:true,repeat:-1,ease:'Sine.InOut'});
    this.add.text(270,138,'JADE GARDEN',{...TEXT.title,fontSize:'52px',color:'#fff4d1',stroke:'#421708',strokeThickness:9,shadow:{offsetY:7,color:'#071711',blur:8,fill:true}}).setOrigin(.5);
    this.add.text(270,193,'T I L E S',{...TEXT.hud,fontSize:'25px',color:'#f5c84e',letterSpacing:11,stroke:'#421708',strokeThickness:4}).setOrigin(.5);
    this.add.text(270,226,'A PREMIUM MATCH GARDEN',{...TEXT.hud,fontSize:'11px',color:'#d4e4dc',letterSpacing:3}).setOrigin(.5);
    this.drawHeroTiles();
    addGoldButton(this,270,559,326,`PLAY  •  LEVEL ${this.save.lastLevel}`,()=>this.scene.start('Game',{level:this.save.lastLevel}),'');
    addGoldButton(this,170,638,182,'LEVELS',()=>this.scene.start('LevelSelect'));addGoldButton(this,370,638,182,'COLLECTION',()=>this.scene.start('Collection'));
    addGoldButton(this,164,717,190,'LEADERBOARD',()=>this.scene.start('Leaderboard'));addGoldButton(this,382,717,170,'SHOP',()=>this.scene.start('Shop'));
    const pending=this.save.queuedChestRewards?.length||0;this.add.text(270,773,pending?`TREASURE READY  •  ${pending} QUEUED`:'TREASURE TRAIL',{...TEXT.hud,fontSize:'15px',color:'#f6cc55',letterSpacing:2,stroke:'#2f1007',strokeThickness:3}).setOrigin(.5);
    addProgressBar(this,240,810,300,pending?1:this.save.chestProgress/5,pending?'CLAIM READY':`${this.save.chestProgress} / 5`);addIconButton(this,435,810,'play',()=>this.showChest(),'Treasure');
    this.add.text(270,878,'MATCH THREE  •  CLIMB THE GARDEN LEAGUE',{...TEXT.hud,fontSize:'11px',color:'#bdd2c8',letterSpacing:1.3}).setOrigin(.5);
  }
  drawHeroTiles(){
    const ids=['cherries','blossom','orange'];
    ids.forEach((id,index)=>{const x=166+index*104,y=387+(index===1?-24:10),tile=this.add.container(x,y).setAngle((index-1)*6),shadow=this.add.ellipse(6,61,116,27,0x000000,.35),body=this.add.image(0,0,'tile:mahogany:front').setDisplaySize(114,134),iconShadow=this.add.image(3,3,iconTextureKey(id)).setDisplaySize(85,85).setTint(0x26332d).setAlpha(.2),icon=this.add.image(0,-4,iconTextureKey(id)).setDisplaySize(85,85);tile.add([shadow,body,iconShadow,icon]);this.tweens.add({targets:tile,y:y-8,duration:1450+index*150,yoyo:true,repeat:-1,ease:'Sine.InOut'});});
  }
  showChest(){const milestone=this.save.queuedChestRewards?.[0],ready=Boolean(milestone);this.modal.show({kind:ready?'reward':'close',title:ready?'Treasure Ready':'Keep Playing',subtitle:ready?milestone.replace('levels:','Levels '):`${5-this.save.chestProgress} more levels`,body:ready?'+150 coins\n+1 Hint booster':'Clear unique levels to fill the treasure trail.',primary:ready?'CLAIM REWARD':'CONTINUE',onPrimary:()=>{if(!ready)return;const key=`chest:${milestone}`;if(this.save.claimedRewards[key])return;this.save.claimedRewards[key]=true;this.save.queuedChestRewards.shift();this.save.coins+=150;this.save.boosters.hint++;SaveManager.save(this.save);getAudioManager(this)?.play('chest_open');this.scene.restart();}});}
  showSettings(){this.scene.launch('AudioSettings',{hostKey:'Menu'});}
}

export function drawBackdrop(scene,music='menu'){
  if(music)bindSceneAudio(scene,music);
  const g=scene.add.graphics();g.fillGradientStyle(0x21634e,0x10513f,0x07362d,0x031e1a,1).fillRect(-300,-400,1140,1760);
  for(let i=0;i<170;i++)g.fillStyle(i%3?0xffffff:0x021511,Phaser.Math.FloatBetween(.008,.028)).fillCircle(Phaser.Math.Between(12,528),Phaser.Math.Between(-100,1080),Phaser.Math.Between(1,3));
  g.fillStyle(THEME.woodDark).fillRect(0,-400,19,1760).fillRect(521,-400,19,1760);g.fillGradientStyle(0xbe6a35,0x7f381c,0x3a1508,0x682910,1).fillRect(5,-400,10,1760).fillRect(525,-400,10,1760);g.fillStyle(0xffffff,.13).fillRect(7,-400,3,1760).fillRect(527,-400,3,1760);g.fillStyle(THEME.gold,.72).fillRect(15,-400,2,1760).fillRect(523,-400,2,1760);
  for(const [x,y,s] of [[28,115,1],[512,118,-1],[34,820,1],[506,824,-1]]){g.fillStyle(0x1c632e,.75);for(let i=0;i<4;i++)g.fillEllipse(x+s*i*12,y+i*14,30,14);}
}
export function prepareBackdrop(scene,music='menu'){applyDesignCamera(scene);drawBackdrop(scene,music);}
