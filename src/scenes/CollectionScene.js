import Phaser from 'phaser';
import { THEMES,iconTextureKey,getMaterial } from '../data/themes.js';
import { TEXT } from '../theme.js';
import { SaveManager } from '../systems/SaveManager.js';
import { ACHIEVEMENTS } from '../systems/ProgressionManager.js';
import { addIconButton,addGoldButton } from '../ui/components.js';
import { prepareBackdrop as drawBackdrop } from './MenuScene.js';
import { LEVEL_CONFIGS } from '../data/levels.js';

export class CollectionScene extends Phaser.Scene {
  constructor(){super('Collection');}
  create(){
    this.save=SaveManager.load();drawBackdrop(this);addIconButton(this,48,48,'‹',()=>this.scene.start('Menu'));
    this.add.text(270,50,'COLLECTIONS',{...TEXT.title,fontSize:'34px'}).setOrigin(.5);
    const discovered=this.save.unlockedThemes.length;this.add.text(270,88,`${discovered} OF 12 GARDENS DISCOVERED  •  72 ORIGINAL TREASURES`,{...TEXT.hud,fontSize:'12px',color:'#bed7cb'}).setOrigin(.5);
    THEMES.forEach((theme,i)=>this.card(theme,i));
    const earned=ACHIEVEMENTS.filter(a=>this.save.achievements[a.id]).length;
    addGoldButton(this,170,887,278,`PLAY LEVEL ${this.save.lastLevel}`,()=>this.scene.start('Game',{level:this.save.lastLevel}));addGoldButton(this,401,887,154,`BADGES ${earned}/${ACHIEVEMENTS.length}`,()=>this.scene.start('Achievements'));
  }
  card(theme,i){
    const unlocked=this.save.unlockedThemes.includes(theme.id),col=i%3,row=Math.floor(i/3),x=103+col*167,y=165+row*170,material=getMaterial(theme.materialId),c=this.add.container(x,y);
    const bg=this.add.graphics().fillStyle(Phaser.Display.Color.HexStringToColor(material.dark).color,.88).fillRoundedRect(-74,-67,148,134,19).lineStyle(3,unlocked?0xe7b74f:0x45564f,.9).strokeRoundedRect(-74,-67,148,134,19).fillStyle(0xffffff,.08).fillRoundedRect(-65,-57,130,11,5);
    const icons=theme.iconIds.slice(0,2).map((id,j)=>this.add.image(-28+j*56,-5,iconTextureKey(id)).setDisplaySize(49,49).setAlpha(unlocked?1:.18));
    const title=this.add.text(0,-43,unlocked?theme.name:'LOCKED',{...TEXT.hud,fontSize:'12px',color:unlocked?'#fff0c6':'#71857d',align:'center',wordWrap:{width:132}}).setOrigin(.5);
    const firstLevel=LEVEL_CONFIGS.find(level=>level.themeId===theme.id)?.level||1,completed=LEVEL_CONFIGS.filter(level=>level.themeId===theme.id&&this.save.completedLevels[level.level]).length,total=LEVEL_CONFIGS.filter(level=>level.themeId===theme.id).length;
    const sub=this.add.text(0,46,unlocked?`${material.name}  •  ${completed}/${total} cleared`:`Unlock at level ${firstLevel}`,{...TEXT.hud,fontSize:'9px',color:'#bad0c5',align:'center',wordWrap:{width:130}}).setOrigin(.5);c.add([bg,...icons,title,sub]);
  }
}
