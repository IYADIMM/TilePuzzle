import Phaser from 'phaser';
import { THEMES,iconTextureKey,getMaterial } from '../data/themes.js';
import { TEXT } from '../theme.js';
import { SaveManager } from '../systems/SaveManager.js';
import { ACHIEVEMENTS } from '../systems/ProgressionManager.js';
import { addIconButton,addGoldButton } from '../ui/components.js';
import { prepareBackdrop as drawBackdrop } from './MenuScene.js';
import { LEVEL_CONFIGS } from '../data/levels.js';
import { GARDEN_TREASURES_ID,GARDEN_TREASURE_ICON_IDS } from '../data/gardenTreasures.js';

export class CollectionScene extends Phaser.Scene {
  constructor(){super('Collection');}
  create(){
    this.save=SaveManager.load();drawBackdrop(this);addIconButton(this,48,48,'‹',()=>this.scene.start('Menu'));
    this.add.text(270,50,'COLLECTIONS',{...TEXT.title,fontSize:'34px'}).setOrigin(.5);
    const discovered=this.save.unlockedThemes.length;this.add.text(270,88,`${discovered} OF 12 COLLECTIONS  •  72 ORIGINAL TREASURES`,{...TEXT.hud,fontSize:'12px',color:'#bed7cb'}).setOrigin(.5);
    THEMES.forEach((theme,i)=>this.card(theme,i));
    this.gardenTreasuresCard();
  }
  card(theme,i){
    const unlocked=this.save.unlockedThemes.includes(theme.id),col=i%3,row=Math.floor(i/3),x=103+col*167,y=165+row*170,material=getMaterial(theme.materialId),c=this.add.container(x,y);
    const bg=this.add.graphics().fillStyle(Phaser.Display.Color.HexStringToColor(material.dark).color,.88).fillRoundedRect(-74,-67,148,134,19).lineStyle(3,unlocked?0xe7b74f:0x45564f,.9).strokeRoundedRect(-74,-67,148,134,19).fillStyle(0xffffff,.08).fillRoundedRect(-65,-57,130,11,5);
    const icons=theme.iconIds.slice(0,2).map((id,j)=>this.add.image(-28+j*56,-5,iconTextureKey(id)).setDisplaySize(49,49).setAlpha(unlocked?1:.18));
    const title=this.add.text(0,-43,unlocked?theme.name:'LOCKED',{...TEXT.hud,fontSize:'12px',color:unlocked?'#fff0c6':'#71857d',align:'center',wordWrap:{width:132}}).setOrigin(.5);
    const firstLevel=LEVEL_CONFIGS.find(level=>level.themeId===theme.id)?.level||1,completed=LEVEL_CONFIGS.filter(level=>level.themeId===theme.id&&this.save.completedLevels[level.level]).length,total=LEVEL_CONFIGS.filter(level=>level.themeId===theme.id).length;
    const sub=this.add.text(0,46,unlocked?`${material.name}  •  ${completed}/${total} cleared`:`Unlock at level ${firstLevel}`,{...TEXT.hud,fontSize:'9px',color:'#bad0c5',align:'center',wordWrap:{width:130}}).setOrigin(.5);c.add([bg,...icons,title,sub]);
  }
  gardenTreasuresCard(){
    const state=this.save.bonusContent.gardenTreasures,y=830,c=this.add.container(270,y),bg=this.add.graphics().fillStyle(0x020d0a,.65).fillRoundedRect(-220,-62,440,124,24).fillGradientStyle(0x275d42,0x174631,0x0c2c24,0x123d2e,1).fillRoundedRect(-220,-66,440,124,24).lineStyle(4,0xe4ae44).strokeRoundedRect(-220,-66,440,124,24).fillStyle(0xffffff,.1).fillRoundedRect(-205,-55,410,11,5);
    const icons=GARDEN_TREASURE_ICON_IDS.slice(0,3).map((id,index)=>this.add.image(-164+index*55,-10,iconTextureKey(id)).setDisplaySize(48,48));
    const title=this.add.text(12,-31,'GARDEN TREASURES',{...TEXT.hud,fontSize:'17px',color:'#fff0bd',letterSpacing:.7}).setOrigin(0,.5),sub=this.add.text(12,-4,state.completed?`${'★'.repeat(state.stars)}${'☆'.repeat(3-state.stars)}  •  Best ${state.bestScore.toLocaleString()}`:'BONUS STAGE  •  24 TILES',{...TEXT.hud,fontSize:'11px',color:'#c6ddd0'}).setOrigin(0,.5),action=this.add.text(104,33,state.completed?'PLAY AGAIN':'PLAY BONUS',{...TEXT.hud,fontSize:'14px',color:'#ffd76b'}).setOrigin(.5);
    c.add([bg,...icons,title,sub,action]).setSize(440,124).setInteractive({useHandCursor:true}).on('pointerup',()=>this.scene.start('Game',{bonusId:GARDEN_TREASURES_ID}));
  }
}
