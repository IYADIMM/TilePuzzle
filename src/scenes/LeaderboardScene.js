import Phaser from 'phaser';
import { TEXT } from '../theme.js';
import { prepareBackdrop } from './MenuScene.js';
import { addGoldButton, addIconButton } from '../ui/components.js';
import { Modal } from '../ui/Modal.js';
import { SaveManager } from '../systems/SaveManager.js';
import { LeaderboardManager } from '../systems/LeaderboardManager.js';

export class LeaderboardScene extends Phaser.Scene {
  constructor(){ super('Leaderboard'); }
  init(data){ this.mode=data.mode||'weekly'; }
  create(){
    prepareBackdrop(this);this.save=SaveManager.load();this.manager=new LeaderboardManager(this.save);this.modal=new Modal(this);
    addIconButton(this,52,53,'back',()=>this.scene.start('Menu'),'Back');
    this.add.text(270,55,'MY GARDEN RECORDS',{...TEXT.title,fontSize:'34px',color:'#fff0b0',stroke:'#401506',strokeThickness:7}).setOrigin(.5);
    this.add.text(270,99,'SAVED ON THIS DEVICE  •  NOT AN ONLINE RANK',{...TEXT.hud,fontSize:'12px',color:'#ffe17a',letterSpacing:1.2}).setOrigin(.5);
    this.renderBoard();
  }
  renderBoard(){
    this.boardLayer?.destroy(true);this.boardLayer=this.add.container(0,0).setData('records-mode','device-local');
    const summary=this.manager.summary(),records=Object.entries(this.save.completedLevels).map(([level,record])=>({level:Number(level),...record})).sort((a,b)=>(b.score||0)-(a.score||0));
    const hero=this.add.graphics().fillStyle(0x020d0a,.55).fillRoundedRect(42,144,456,176,28).fillGradientStyle(0x185844,0x124536,0x082820,0x0b3027,1).fillRoundedRect(46,138,448,174,28).lineStyle(3,0xe1aa43,.95).strokeRoundedRect(46,138,448,174,28).fillStyle(0xffffff,.08).fillRoundedRect(62,151,416,12,6);
    this.boardLayer.add([hero,this.add.text(270,184,'LOCAL LEAGUE POINTS',{...TEXT.hud,fontSize:'14px',color:'#d8ebe2',letterSpacing:1.5}).setOrigin(.5),this.add.text(270,229,summary.allTime.toLocaleString(),{...TEXT.title,fontSize:'52px',color:'#ffe17a',stroke:'#351306',strokeThickness:6}).setOrigin(.5),this.add.text(270,279,`${records.length} LEVEL${records.length===1?'':'S'} CLEARED  •  ${this.save.stars} STARS`,{...TEXT.hud,fontSize:'13px',color:'#bfe2d1'}).setOrigin(.5)]);
    this.boardLayer.add(this.add.text(54,350,'BEST LEVEL RESULTS',{...TEXT.hud,fontSize:'14px',color:'#ffe18a',letterSpacing:1.4}).setOrigin(0,.5));
    if(!records.length)this.boardLayer.add(this.add.text(270,492,'Clear a level to build your personal record.',{...TEXT.hud,fontSize:'16px',color:'#d2e5dc',wordWrap:{width:390},align:'center'}).setOrigin(.5));
    records.slice(0,8).forEach((record,index)=>{const y=400+index*58,g=this.add.graphics().fillStyle(index%2?0x0d3027:0x123a2f,.96).fillRoundedRect(46,y-24,448,48,14).lineStyle(2,0x557866,.72).strokeRoundedRect(46,y-24,448,48,14),stars='★'.repeat(record.stars||0)+'☆'.repeat(3-(record.stars||0));this.boardLayer.add([g,this.add.text(66,y,`LEVEL ${record.level}`,{...TEXT.hud,fontSize:'14px',color:'#fff0c8'}).setOrigin(0,.5),this.add.text(270,y,stars,{...TEXT.hud,fontSize:'16px',color:'#ffd760'}).setOrigin(.5),this.add.text(470,y,(record.score||0).toLocaleString(),{...TEXT.hud,fontSize:'15px',color:'#d7eee2'}).setOrigin(1,.5)]);});
    const info=addGoldButton(this,270,894,300,'HOW POINTS WORK',()=>this.modal.show({title:'Local Records',subtitle:'Private device progress',body:'Your best result for each level counts once.\n\nNo simulated players, live ranks, or online claims are shown.',primary:'GOT IT'}));info.setScale(.86);this.boardLayer.add(info);
  }
}
