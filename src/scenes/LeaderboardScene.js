import Phaser from 'phaser';
import { TEXT } from '../theme.js';
import { prepareBackdrop } from './MenuScene.js';
import { addGoldButton, addIconButton, makeInteractive } from '../ui/components.js';
import { Modal } from '../ui/Modal.js';
import { SaveManager } from '../systems/SaveManager.js';
import { LeaderboardManager } from '../systems/LeaderboardManager.js';

const MODES = [
  { id:'weekly', label:'WEEKLY' },
  { id:'allTime', label:'ALL-TIME' },
  { id:'friends', label:'FRIENDS' }
];

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
  drawTabs(){
    this.tabs=[];
    MODES.forEach((mode,index)=>{
      const x=103+index*167,active=this.mode===mode.id,root=this.add.container(x,145),g=this.add.graphics();
      g.fillStyle(0x150904,.6).fillRoundedRect(-73,-23,146,50,15)
        .fillGradientStyle(active?0xf2c654:0x82401f,active?0xc9811d:0x5b2413,active?0x9a5010:0x2d1008,active?0xb66712:0x43170b,1).fillRoundedRect(-73,-26,146,50,15)
        .lineStyle(3,active?0xffe891:0xb98037).strokeRoundedRect(-73,-26,146,50,15);
      const label=this.add.text(0,-1,mode.label,{...TEXT.hud,fontSize:'13px',color:active?'#3b1708':'#fff0c9'}).setOrigin(.5);
      root.add([g,label]).setSize(146,56).setData('mode',mode.id);makeInteractive(root,()=>{if(this.mode!==mode.id){this.mode=mode.id;this.drawTabsRefresh();this.renderBoard();}});this.tabs.push(root);
    });
  }
  drawTabsRefresh(){ this.tabs.forEach(tab=>tab.destroy(true));this.drawTabs(); }
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
  drawSeasonHeader(summary){
    const time=formatDuration(summary.secondsRemaining),panel=this.add.graphics();
    panel.fillStyle(0x081b16,.78).fillRoundedRect(44,184,452,55,17).lineStyle(2,0xc69032,.8).strokeRoundedRect(44,184,452,55,17);
    this.boardLayer.add([panel,this.add.text(68,211,this.mode==='allTime'?'ALL-TIME LEGENDS':`ENDS IN ${time}`,{...TEXT.hud,fontSize:'13px',color:'#d8ebe2'}).setOrigin(0,.5),this.add.text(472,211,`YOU  #${this.manager.player(this.mode).rank}`,{...TEXT.hud,fontSize:'14px',color:'#ffdc6b'}).setOrigin(1,.5)]);
  }
  drawPodium(row,x,y,place){
    const width=place===1?126:116,height=place===1?145:126,root=this.add.container(x,y),shadow=this.add.graphics().fillStyle(0x020100,.55).fillRoundedRect(-width/2+4,-height/2+8,width,height,22),card=this.add.graphics();
    card.fillGradientStyle(place===1?0xffe88a:0xb65d31,place===1?0xd99b27:0x74331b,0x351208,0x54200f,1).fillRoundedRect(-width/2,-height/2,width,height,22).lineStyle(4,place===1?0xfff0a1:0xd8a449).strokeRoundedRect(-width/2,-height/2,width,height,22).fillStyle(0xffffff,.13).fillRoundedRect(-width/2+12,-height/2+10,width-24,9,5);
    const medallion=this.add.circle(0,-height*.19,place===1?30:26,row.isPlayer?0x2c8a67:0x244f45).setStrokeStyle(4,place===1?0xffe574:0xd6a34d),initial=this.add.text(0,-height*.19,row.name[0],{...TEXT.title,fontSize:place===1?'29px':'24px',color:'#fff4cf',stroke:'#20342d',strokeThickness:3}).setOrigin(.5),rank=this.add.text(-width/2+11,-height/2+7,String(place),{...TEXT.title,fontSize:'21px',color:'#421607'}).setOrigin(.5),name=this.add.text(0,height*.2,row.isPlayer?'YOU':row.name.toUpperCase(),{...TEXT.hud,fontSize:'10px',color:'#fff3cf'}).setOrigin(.5),points=this.add.text(0,height*.36,row.points.toLocaleString(),{...TEXT.hud,fontSize:'15px',color:'#ffd960'}).setOrigin(.5);
    root.add([shadow,card,medallion,initial,rank,name,points]).setData('rank',row.rank).setData('player',row.isPlayer);this.boardLayer.add(root);
  }
  drawTable(rows,startY){
    rows.forEach((row,index)=>{
      const y=startY+index*50,g=this.add.graphics(),fill=row.isPlayer?0x286e58:index%2?0x102e25:0x14372c;
      g.fillStyle(0x020100,.35).fillRoundedRect(49,y-19,442,42,12).fillStyle(fill,.94).fillRoundedRect(47,y-22,442,42,12).lineStyle(2,row.isPlayer?0xffd45b:0x4f745f,.75).strokeRoundedRect(47,y-22,442,42,12);
      const rank=this.add.text(70,y-1,`#${row.rank}`,{...TEXT.hud,fontSize:'13px',color:row.rank<=3?'#ffe176':'#d8e9df'}).setOrigin(.5),avatar=this.add.circle(108,y-1,14,row.isPlayer?0x50b789:0x8a4c2b).setStrokeStyle(2,0xe6ba53),initial=this.add.text(108,y-1,row.name[0],{...TEXT.hud,fontSize:'11px',color:'#fff'}).setOrigin(.5),name=this.add.text(133,y-1,row.isPlayer?'YOU  •  GARDEN PLAYER':row.name,{...TEXT.hud,fontSize:'13px',color:'#fff4d2'}).setOrigin(0,.5),points=this.add.text(465,y-1,row.points.toLocaleString(),{...TEXT.hud,fontSize:'14px',color:'#ffd766'}).setOrigin(1,.5);
      this.boardLayer.add([g,rank,avatar,initial,name,points]);
    });
  }
  drawPinnedPlayer(player,y){
    const g=this.add.graphics();g.fillStyle(0x140702,.72).fillRoundedRect(37,y-31,466,68,19).fillGradientStyle(0xf4d76d,0xd89928,0x9f5514,0xc1741c,1).fillRoundedRect(40,y-35,460,66,19).lineStyle(3,0xffefa0).strokeRoundedRect(46,y-29,448,54,15).fillStyle(0x173d31,1).fillRoundedRect(51,y-24,438,44,11);
    this.boardLayer.add([g,this.add.text(72,y-2,`#${player.rank}`,{...TEXT.title,fontSize:'20px',color:'#ffe17a'}).setOrigin(.5),this.add.text(111,y-2,'YOUR GARDEN',{...TEXT.hud,fontSize:'14px',color:'#fff4d1'}).setOrigin(0,.5),this.add.text(467,y-2,`${player.points.toLocaleString()} PTS`,{...TEXT.hud,fontSize:'15px',color:'#ffdc67'}).setOrigin(1,.5)]);
  }
  showRewards(summary){
    this.modal.show({kind:'reward',title:'Season Rewards',subtitle:`Projected rank  #${summary.rank}`,body:`${summary.reward.label}\n+${summary.reward.coins.toLocaleString()} COINS\n\nBest score per level counts.\nHigher points place you higher.`,primary:'GOT IT'});
  }
}

function formatDuration(seconds){const days=Math.floor(seconds/86400),hours=Math.floor((seconds%86400)/3600),mins=Math.floor((seconds%3600)/60);return days?`${days}D ${hours}H`:`${hours}H ${mins}M`;}
