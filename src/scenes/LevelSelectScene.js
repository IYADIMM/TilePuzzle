import Phaser from 'phaser';
import { TEXT } from '../theme.js';
import { LEVEL_CONFIGS } from '../data/levels.js';
import { getTheme,iconTextureKey } from '../data/themes.js';
import { SaveManager } from '../systems/SaveManager.js';
import { addGoldButton,addIconButton } from '../ui/components.js';
import { prepareBackdrop as drawBackdrop } from './MenuScene.js';
import { levelPageFor,levelsForPage } from '../logic/LevelNavigation.js';

export class LevelSelectScene extends Phaser.Scene{
  constructor(){super('LevelSelect');}
  init(data){this.requestedPage=Number.isInteger(data?.page)?data.page:null;}
  create(){
    this.save=SaveManager.load();drawBackdrop(this);addIconButton(this,50,53,'‹',()=>this.scene.start('Menu'),'Back');
    this.page=this.requestedPage??levelPageFor(this.save.lastLevel,LEVEL_CONFIGS.length);const view=levelsForPage(LEVEL_CONFIGS,this.page);this.page=view.page;
    this.add.text(270,57,'LEVEL JOURNEY',{...TEXT.title,fontSize:'35px'}).setOrigin(.5);
    this.add.text(270,101,`CHAPTER ${this.page+1} OF ${view.pageCount}  •  CHOOSE YOUR GARDEN`,{...TEXT.hud,fontSize:'13px',color:'#d4e8de',letterSpacing:.7}).setOrigin(.5);
    view.levels.forEach((level,i)=>this.addCard(level,i));
    const previous=addGoldButton(this,157,856,190,'PREVIOUS',()=>this.scene.restart({page:this.page-1}));previous.setAlpha(this.page>0?1:.35);if(this.page===0)previous.disableInteractive();
    const next=addGoldButton(this,383,856,190,'NEXT',()=>this.scene.restart({page:this.page+1}));next.setAlpha(this.page<view.pageCount-1?1:.35);if(this.page>=view.pageCount-1)next.disableInteractive();
    this.add.text(270,918,`LEVELS ${view.start+1}–${view.start+view.levels.length}  •  REPLAY ANY UNLOCKED GARDEN`,{...TEXT.hud,fontSize:'12px',color:'#b8d0c4'}).setOrigin(.5);
  }
  addCard(level,i){
    const theme=getTheme(level.themeId),unlocked=level.level<=this.save.maxUnlockedLevel,y=167+i*108,card=this.add.container(270,y),bg=this.add.graphics().fillStyle(0x020d0a,.58).fillRoundedRect(-224,-44,448,88,22).fillStyle(unlocked?0x10483a:0x102c25,.96).fillRoundedRect(-224,-47,448,88,22).lineStyle(3,unlocked?0xe1aa43:0x668078,.9).strokeRoundedRect(-224,-47,448,88,22).fillStyle(0xffffff,.09).fillRoundedRect(-212,-37,424,12,6),icon=this.add.image(-170,-2,iconTextureKey(theme.iconIds[0])).setDisplaySize(62,62).setAlpha(unlocked?1:.5),title=this.add.text(-118,-14,unlocked?`LEVEL ${level.level}  •  ${theme.name}`:`LEVEL ${level.level}  •  LOCKED`,{...TEXT.hud,fontSize:'16px',color:unlocked?'#fff1c6':'#a9bdb4'}).setOrigin(0,.5),stats=this.save.completedLevels[level.level],sub=this.add.text(-118,18,stats?`${'★'.repeat(stats.stars)}${'☆'.repeat(3-stats.stars)}  ${stats.score.toLocaleString()} pts  •  ${stats.bestTime}s`:unlocked?`${level.tileCount} tiles  •  ${level.layers} layers`:'Clear the previous level to open',{...TEXT.hud,fontSize:'12px',color:unlocked?'#c8ded3':'#91a69c'}).setOrigin(0,.5);
    card.add([bg,icon,title,sub]).setSize(448,88).setData('level',level.level).setData('unlocked',unlocked);if(unlocked)card.setInteractive({useHandCursor:true}).on('pointerup',()=>this.scene.start('Game',{level:level.level}));
  }
}
