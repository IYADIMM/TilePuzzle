import Phaser from 'phaser';
import { TEXT } from '../theme.js';
import { getThemeForLevel } from '../data/themes.js';
import { addGoldButton,addProgressBar } from '../ui/components.js';
import { prepareBackdrop } from './MenuScene.js';
import { bindSceneAudio } from '../audio/AudioManager.js';
import { LEVEL_COUNT } from '../data/levels.js';
import { PREMIUM_MATERIALS } from '../art/PremiumAssetManifest.js';
import { createTileSkinResolver } from '../art/TileStyleRegistry.js';
import { SaveManager } from '../systems/SaveManager.js';
import { AssetFactory } from '../art/AssetFactory.js';

export class RewardScene extends Phaser.Scene {
  constructor(){super('Reward');}
  init(data){this.dataIn=data;}
  preload(){if((this.dataIn?.tileStyle||SaveManager.load().prefs.tileStyle)==='classic')AssetFactory.preloadClassic(this);}
  create(){
    const d=this.dataIn,theme=d.theme||getThemeForLevel(d.level),style=d.tileStyle||SaveManager.load().prefs.tileStyle,skin=createTileSkinResolver(style,theme.iconIds);prepareBackdrop(this,null);const audio=bindSceneAudio(this,null);this.time.delayedCall(950,()=>{if(this.sys.isActive())audio?.play('star_earned');});
    const glow=this.add.circle(270,168,142,0xf7d66a,.1);this.tweens.add({targets:glow,scale:1.13,alpha:.24,duration:1100,yoyo:true,repeat:-1,ease:'Sine.InOut'});
    this.add.text(270,76,d.reward.stars===3?'PERFECT CLEAR':'LEVEL COMPLETE',{...TEXT.title,fontSize:'44px',color:'#ffe08a',stroke:'#4a1c08',strokeThickness:8}).setOrigin(.5);
    for(let i=0;i<3;i++){const star=this.add.text(218+i*52,129,i<d.reward.stars?'★':'☆',{...TEXT.title,fontSize:'42px',color:i<d.reward.stars?'#ffd45c':'#7e684d',stroke:'#6b2d0c',strokeThickness:5}).setOrigin(.5).setScale(.1);this.tweens.add({targets:star,scale:1,duration:390,delay:120+i*150,ease:'Back.Out'});}
    theme.iconIds.slice(0,3).forEach((id,i)=>{const x=184+i*86,tile=this.add.image(x,232,skin.bodyTextureKey(theme.materialId)||PREMIUM_MATERIALS[theme.materialId]?.key).setDisplaySize(68,87),icon=this.add.image(x,229,skin.textureKey(id)).setDisplaySize(52,52),tileScale={x:tile.scaleX,y:tile.scaleY},iconScale={x:icon.scaleX,y:icon.scaleY};tile.setScale(tileScale.x*.1,tileScale.y*.1);icon.setScale(iconScale.x*.1,iconScale.y*.1);this.tweens.add({targets:tile,scaleX:tileScale.x,scaleY:tileScale.y,duration:430,delay:520+i*100,ease:'Back.Out'});this.tweens.add({targets:icon,scaleX:iconScale.x,scaleY:iconScale.y,duration:430,delay:520+i*100,ease:'Back.Out'});});
    this.add.graphics().fillStyle(0x020e0b,.62).fillRoundedRect(58,313,432,329,32).fillGradientStyle(0x154f40,0x103d33,0x082820,0x0b3329,1).fillRoundedRect(62,305,416,326,29).lineStyle(8,0x3b1609).strokeRoundedRect(62,305,416,326,29).lineStyle(4,0xe0ad42).strokeRoundedRect(72,315,396,306,22).fillStyle(0xffffff,.1).fillRoundedRect(86,326,368,15,7);
    this.add.text(270,365,'LEVEL SCORE',{...TEXT.hud,fontSize:'15px',color:'#cfe8db',letterSpacing:2}).setOrigin(.5);
    this.scoreText=this.add.text(270,414,'0',{...TEXT.title,fontSize:'58px',color:'#ffe584',stroke:'#351306',strokeThickness:7}).setOrigin(.5);
    const counter={value:0};this.tweens.add({targets:counter,value:d.score,duration:1000,delay:500,ease:'Cubic.Out',onUpdate:()=>this.scoreText.setText(Math.round(counter.value).toLocaleString())});
    this.add.text(270,469,`Best combo  ×${d.combo}  •  ${d.totalMatches} pairs  •  ${d.seconds}s`,{...TEXT.hud,fontSize:'14px',color:'#d8e9df'}).setOrigin(.5);
    const resultCopy=d.reward.firstClear?`FIRST CLEAR  +${d.reward.coins} COINS`:d.reward.isNewBestScore?'BEST SCORE UPDATED':d.reward.newStars>0?`STAR RATING IMPROVED  +${d.reward.newStars}`:d.reward.isNewBestTime?'BEST TIME UPDATED':'REPLAY COMPLETE  •  BEST HOLDS';
    this.add.text(270,505,resultCopy,{...TEXT.hud,fontSize:'17px',color:'#ffd66e',stroke:'#3b1607',strokeThickness:3}).setOrigin(.5);
    const lb=d.reward.leaderboard;
    this.add.text(270,541,d.bonusId?'BONUS COLLECTION  •  PROGRESS SAVED':lb?.earned?`LOCAL LEAGUE  +${lb.earned} PTS`:'LOCAL LEAGUE  •  BEST RESULT HOLDS',{...TEXT.hud,fontSize:'15px',color:'#8fe0b7',stroke:'#071c17',strokeThickness:3}).setOrigin(.5);
    addProgressBar(this,270,579,314,Math.min(1,d.reward.stars/3),`${d.reward.stars} / 3 STARS`);
    if(d.reward.unlockedAchievements.length)this.add.text(270,614,`BADGE UNLOCKED  •  ${d.reward.unlockedAchievements[0].title.toUpperCase()}`,{...TEXT.hud,fontSize:'12px',color:'#ffe298'}).setOrigin(.5);
    addGoldButton(this,270,711,318,d.bonusId?'GARDEN COLLECTION':d.level<LEVEL_COUNT?'NEXT LEVEL':'LEVEL SELECT',()=>d.bonusId?this.scene.start('Collection'):d.level<LEVEL_COUNT?this.scene.start('Game',{level:d.level+1}):this.scene.start('LevelSelect'));
    addGoldButton(this,270,795,248,'MAIN MENU',()=>this.scene.start('Menu'));
    this.add.text(270,875,d.bonusId?`${theme.name} bonus complete`:`${theme.name} collection • Level ${d.level} complete`,{...TEXT.hud,fontSize:'13px',color:'#c8dfd4'}).setOrigin(.5);
  }
}
