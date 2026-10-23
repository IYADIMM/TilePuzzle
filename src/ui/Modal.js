import Phaser from 'phaser';
import { THEME,TEXT } from '../theme.js';
import { addGoldButton } from './components.js';
import { getAudioManager } from '../audio/AudioManager.js';

export class Modal {
  constructor(scene){this.scene=scene;this.root=null;}
  show({title,subtitle='',kind='reward',body='',primary='CONTINUE',onPrimary,secondary,onSecondary,tertiary,onTertiary,variant='default'}){
    this.close(true);const s=this.scene,root=s.add.container(0,0).setDepth(2200),shade=s.add.rectangle(270,480,900,1400,0x010605,.88).setInteractive().setAlpha(0),card=s.add.container(270,475).setScale(.72).setAlpha(0),danger=variant==='danger';
    const halo=s.add.graphics().fillStyle(danger?0xd9534f:0xf5c84d,.11).fillCircle(0,-162,130).lineStyle(3,danger?0xff8f7d:0xffe78b,.2).strokeCircle(0,-162,105);
    const shadow=s.add.graphics().fillStyle(0x000000,.58).fillRoundedRect(-225,-226,458,500,35);
    const outer=s.add.graphics().fillGradientStyle(0xc1763d,0x8c4524,0x3a1408,0x64250f,1).fillRoundedRect(-229,-246,458,500,35).lineStyle(10,0x260b04).strokeRoundedRect(-229,-246,458,500,35).lineStyle(5,0xe0a033).strokeRoundedRect(-218,-235,436,478,28).lineStyle(2,0xffe999,.92).strokeRoundedRect(-211,-228,422,464,23);
    for(let i=0;i<11;i++){
      const y=-206+i*40;
      outer.lineStyle(i%3?1:2,i%3?0xd68a49:0x3a1308,.22)
        .beginPath().moveTo(-194,y).lineTo(-112,y-6).lineTo(-28,y+4).lineTo(58,y-3).lineTo(142,y+5).lineTo(194,y-1).strokePath();
    }
    const inset=s.add.graphics().fillGradientStyle(danger?0x5b241b:0x6f3219,danger?0x3d1611:0x4a1c0e,0x210a05,0x361006,1).fillRoundedRect(-193,-196,386,325,25).lineStyle(3,0x1c0703).strokeRoundedRect(-193,-196,386,325,25).lineStyle(2,0xf0c165,.45).strokeRoundedRect(-184,-187,368,307,20).fillStyle(0xffffff,.07).fillRoundedRect(-170,-177,340,13,6);
    const ribbon=s.add.graphics().fillStyle(0x331006).fillTriangle(-185,-116,-216,-92,-182,-70).fillTriangle(185,-116,216,-92,182,-70).fillGradientStyle(0xf5ce62,0xe4a633,0xb96713,0x8e4310,1).fillRoundedRect(-184,-127,368,72,18).lineStyle(3,0x68300b).strokeRoundedRect(-184,-127,368,72,18).fillStyle(0xffffff,.2).fillRoundedRect(-160,-115,320,9,5);
    const glyph=s.add.graphics();drawModalGlyph(glyph,kind,danger?0xff8b77:0xffd657);const titleText=s.add.text(0,-91,title,{...TEXT.title,fontSize:'39px',color:danger?'#fff1dc':'#4c210d',stroke:danger?'#581911':'#fff0a5',strokeThickness:danger?6:3,align:'center'}).setOrigin(.5),subtitleText=s.add.text(0,-24,subtitle,{...TEXT.hud,fontSize:'18px',color:'#f3ce83',align:'center'}).setOrigin(.5),bodyText=s.add.text(0,50,body,{...TEXT.hud,fontSize:'17px',color:'#fff4d8',align:'center',lineSpacing:9,wordWrap:{width:330}}).setOrigin(.5);
    card.add([halo,shadow,outer,inset,ribbon,glyph,titleText,subtitleText,bodyText]);const primaryButton=addGoldButton(s,0,177,286,primary,()=>this.dismiss(onPrimary));card.add(primaryButton);
    if(secondary){const secondaryButton=s.add.text(tertiary?-82:0,231,secondary,{...TEXT.hud,fontSize:'15px',color:'#ffe4a3',stroke:'#2e0d04',strokeThickness:3}).setOrigin(.5).setInteractive(new Phaser.Geom.Rectangle(-68,-22,136,44),Phaser.Geom.Rectangle.Contains);secondaryButton.on('pointerup',()=>{getAudioManager(s)?.play('ui_click');this.dismiss(onSecondary);});card.add(secondaryButton);}
    if(tertiary){const tertiaryButton=s.add.text(92,231,tertiary,{...TEXT.hud,fontSize:'15px',color:'#ffbf9f',stroke:'#2e0d04',strokeThickness:3}).setOrigin(.5).setInteractive(new Phaser.Geom.Rectangle(-68,-22,136,44),Phaser.Geom.Rectangle.Contains);tertiaryButton.on('pointerup',()=>{getAudioManager(s)?.play('ui_click');this.dismiss(onTertiary);});card.add(tertiaryButton);}
    root.add([shade,card]);this.root=root;this.card=card;s.tweens.add({targets:shade,alpha:1,duration:140});s.tweens.add({targets:card,alpha:1,scale:1,duration:360,ease:'Back.Out'});s.tweens.add({targets:halo,scale:1.1,alpha:.5,duration:780,yoyo:true,repeat:-1,ease:'Sine.InOut'});return root;
  }
  dismiss(callback){if(!this.root)return;const doomed=this.root;this.root=null;this.scene.tweens.add({targets:this.card,scale:.82,alpha:0,duration:130,ease:'Back.In',onComplete:()=>{doomed.destroy(true);callback?.();}});}
  close(immediate=false){if(!this.root)return;const doomed=this.root;this.root=null;if(immediate)doomed.destroy(true);else this.scene.tweens.add({targets:doomed,alpha:0,duration:100,onComplete:()=>doomed.destroy(true)});}
}
function drawModalGlyph(g,kind,color){g.lineStyle(8,color,1);g.fillStyle(color,1);const y=-174;if(kind==='close'){g.lineBetween(-18,y-18,18,y+18);g.lineBetween(18,y-18,-18,y+18);}else if(kind==='pause'){g.fillRoundedRect(-16,y-20,11,40,4).fillRoundedRect(5,y-20,11,40,4);}else if(kind==='settings'){g.strokeCircle(0,y,17);g.strokeCircle(0,y,5);for(let i=0;i<8;i++){const a=i*Math.PI/4;g.lineBetween(Math.cos(a)*20,y+Math.sin(a)*20,Math.cos(a)*28,y+Math.sin(a)*28);}}else if(kind==='back'){g.beginPath().moveTo(14,y-20).lineTo(-10,y).lineTo(14,y+20).strokePath();}else{star(g,0,y,31,color);}}
function star(g,x,y,r,color){const pts=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.45:r;pts.push({x:x+Math.cos(a)*rr,y:y+Math.sin(a)*rr});}g.fillStyle(color,1).beginPath().moveTo(pts[0].x,pts[0].y);pts.slice(1).forEach(p=>g.lineTo(p.x,p.y));g.closePath().fillPath();}
