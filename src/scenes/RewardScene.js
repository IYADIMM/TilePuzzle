import Phaser from 'phaser';
import { TEXT } from '../theme.js';
import { getThemeForLevel,iconTextureKey } from '../data/themes.js';
import { tileTextureKey } from '../art/TileMaterialFactory.js';
import { addGoldButton,addProgressBar } from '../ui/components.js';
import { prepareBackdrop } from './MenuScene.js';

export class RewardScene extends Phaser.Scene {
  constructor(){super('Reward');}
  init(data){this.dataIn=data;}
  create(){
    const d=this.dataIn,theme=getThemeForLevel(d.level);prepareBackdrop(this);
    const glow=this.add.circle(270,168,142,0xf7d66a,.1);this.tweens.add({targets:glow,scale:1.13,alpha:.24,duration:1100,yoyo:true,repeat:-1,ease:'Sine.InOut'});
    this.add.text(270,76,d.reward.stars===3?'PERFECT CLEAR':'GARDEN CLEARED',{...TEXT.title,fontSize:'44px',color:'#ffe08a',stroke:'#4a1c08',strokeThickness:8}).setOrigin(.5);
    for(let i=0;i<3;i++){const star=this.add.text(218+i*52,129,i<d.reward.stars?'★':'☆',{...TEXT.title,fontSize:'42px',color:i<d.reward.stars?'#ffd45c':'#7e684d',stroke:'#6b2d0c',strokeThickness:5}).setOrigin(.5).setScale(.1);this.tweens.add({targets:star,scale:1,duration:390,delay:120+i*150,ease:'Back.Out'});}
    theme.iconIds.slice(0,3).forEach((id,i)=>{const x=184+i*86,tile=this.add.image(x,232,tileTextureKey(theme.materialId)).setDisplaySize(68,87),icon=this.add.image(x,229,iconTextureKey(id)).setDisplaySize(52,52),tileScale={x:tile.scaleX,y:tile.scaleY},iconScale={x:icon.scaleX,y:icon.scaleY};tile.setScale(tileScale.x*.1,tileScale.y*.1);icon.setScale(iconScale.x*.1,iconScale.y*.1);this.tweens.add({targets:tile,scaleX:tileScale.x,scaleY:tileScale.y,duration:430,delay:520+i*100,ease:'Back.Out'});this.tweens.add({targets:icon,scaleX:iconScale.x,scaleY:iconScale.y,duration:430,delay:520+i*100,ease:'Back.Out'});});
    this.add.graphics().fillStyle(0x160703,.5).fillRoundedRect(58,313,432,329,32).fillGradientStyle(0xfffcf0,0xfff8e3,0xeadfca,0xf5ead5,1).fillRoundedRect(62,305,416,326,29).lineStyle(8,0x4b1b09).strokeRoundedRect(62,305,416,326,29).lineStyle(4,0xdba43a).strokeRoundedRect(72,315,396,306,22).fillStyle(0xffffff,.5).fillRoundedRect(86,326,368,15,7);
    this.add.text(270,365,'LEVEL SCORE',{...TEXT.hud,fontSize:'14px',color:'#7e552b',letterSpacing:2}).setOrigin(.5);
    this.scoreText=this.add.text(270,410,'0',{...TEXT.title,fontSize:'45px',color:'#55240d'}).setOrigin(.5);
    const counter={value:0};this.tweens.add({targets:counter,value:d.score,duration:1000,delay:500,ease:'Cubic.Out',onUpdate:()=>this.scoreText.setText(Math.round(counter.value).toLocaleString())});
    this.add.text(270,467,`Best combo  ×${d.combo}     •     Time  ${d.seconds}s`,{...TEXT.hud,fontSize:'16px',color:'#3f6657'}).setOrigin(.5);
    this.add.text(270,505,d.reward.firstClear?`FIRST CLEAR  +${d.reward.coins} COINS`:'BEST SCORE UPDATED',{...TEXT.hud,fontSize:'17px',color:'#a06118',stroke:'#fff2c5',strokeThickness:2}).setOrigin(.5);
    const lb=d.reward.leaderboard;
    this.add.text(270,541,lb.earned?`LEAGUE  +${lb.earned} PTS  •  RANK #${lb.rankAfter}`:'LEAGUE  •  BEST RESULT HOLDS',{...TEXT.hud,fontSize:'15px',color:'#2d765c',stroke:'#fff8dd',strokeThickness:2}).setOrigin(.5);
    addProgressBar(this,270,579,314,Math.min(1,d.reward.stars/3),`${d.reward.stars} / 3 STARS`);
    if(d.reward.unlockedAchievements.length)this.add.text(270,614,`BADGE UNLOCKED  •  ${d.reward.unlockedAchievements[0].title.toUpperCase()}`,{...TEXT.hud,fontSize:'12px',color:'#7a4b16'}).setOrigin(.5);
    addGoldButton(this,270,711,318,d.level<30?'NEXT LEVEL':'LEVEL SELECT',()=>d.level<30?this.scene.start('Game',{level:d.level+1}):this.scene.start('LevelSelect'));
    addGoldButton(this,270,795,248,'BACK TO GARDEN',()=>this.scene.start('Menu'));
    this.add.text(270,875,`${theme.name} collection • Level ${d.level} complete`,{...TEXT.hud,fontSize:'13px',color:'#c8dfd4'}).setOrigin(.5);
  }
}
