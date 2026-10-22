import Phaser from 'phaser';
import { THEMES,iconTextureKey } from '../data/themes.js';
import { tileTextureKey } from '../art/TileMaterialFactory.js';
import { applyDesignCamera } from '../ui/LayoutManager.js';
import { TEXT } from '../theme.js';

export class IconSheetScene extends Phaser.Scene {
  constructor(){super('IconSheet');}
  create(){
    applyDesignCamera(this);
    const g=this.add.graphics().fillGradientStyle(0x17614d,0x0d4b3c,0x062e27,0x021a16,1).fillRect(0,0,540,960);
    g.lineStyle(3,0xd5a13c,.75).strokeRoundedRect(14,12,512,936,20);
    this.add.text(270,28,'72 ICONS • LIVE PHASER CONTACT SHEET',{...TEXT.title,fontSize:'20px',color:'#ffe09a'}).setOrigin(.5);
    THEMES.forEach((theme,row)=>{
      const y=78+row*72;
      this.add.text(22,y-27,theme.name.toUpperCase(),{...TEXT.hud,fontSize:'8px',color:'#e8c672'}).setOrigin(0,.5);
      theme.iconIds.forEach((id,col)=>{
        const x=74+col*78;
        this.add.image(x,y,tileTextureKey(theme.materialId)).setDisplaySize(56,70);
        this.add.image(x,y-3,iconTextureKey(id)).setDisplaySize(43,43);
        this.add.text(x,y+30,id.replaceAll('-',' '),{...TEXT.hud,fontSize:'6px',color:'#f8efd8'}).setOrigin(.5);
      });
    });
  }
}
