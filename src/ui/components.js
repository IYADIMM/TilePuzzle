import Phaser from 'phaser';
import { THEME, TEXT } from '../theme.js';
import { PREMIUM_TEXTURES } from '../art/PremiumAssetManifest.js';
import { getAudioManager } from '../audio/AudioManager.js';

export function addPill(scene,x,y,width,label,icon='',onClick){
  const root=scene.add.container(x,y),h=58;
  const shadow=scene.add.graphics().fillStyle(0x050302,.55).fillRoundedRect(-width/2+3,-h/2+8,width,h,19);
  const frame=scene.add.graphics()
    .fillGradientStyle(0x9c4b27,0x6d2d16,0x321109,0x54200f,1).fillRoundedRect(-width/2,-h/2,width,h,19)
    .lineStyle(5,0x281006).strokeRoundedRect(-width/2,-h/2,width,h,19)
    .lineStyle(3,0xf1b83e).strokeRoundedRect(-width/2+5,-h/2+5,width-10,h-10,15)
    .lineStyle(1.5,0xffed9a,.9).strokeRoundedRect(-width/2+10,-h/2+10,width-20,h-20,11)
    .fillStyle(0xffffff,.16).fillRoundedRect(-width/2+15,-h/2+11,width-30,9,5);
  const text=scene.add.text(0,1,`${icon}${icon?'  ':''}${label}`,{...TEXT.hud,fontSize:'20px',color:'#fff2ca',stroke:'#3b170a',strokeThickness:3}).setOrigin(.5);
  root.add([shadow,frame,text]).setSize(width,h+10);if(onClick)makeInteractive(root,onClick);return root;
}

export function addGoldButton(scene,x,y,width,label,onClick,icon=''){
  const root=scene.add.container(x,y),h=68;
  const shadow=scene.add.graphics().fillStyle(0x170802,.72).fillRoundedRect(-width/2+3,-h/2+10,width,h,21);
  if(scene.textures.exists(PREMIUM_TEXTURES.button.key)){
    const plate=scene.add.image(0,1,PREMIUM_TEXTURES.button.key).setDisplaySize(width+20,h+25),text=scene.add.text(0,1,`${icon}${icon?'  ':''}${label}`,{...TEXT.title,fontSize:'23px',color:'#fff1c9',stroke:'#301006',strokeThickness:4}).setOrigin(.5);root.add([shadow,plate,text]).setSize(width,h+12);makeInteractive(root,onClick);return root;
  }
  const outer=scene.add.graphics().fillGradientStyle(0xffec8b,0xe7a935,0x9c5512,0x6b330a,1).fillRoundedRect(-width/2,-h/2,width,h,21).lineStyle(4,0x572807).strokeRoundedRect(-width/2,-h/2,width,h,21).lineStyle(2,0xfff0a1).strokeRoundedRect(-width/2+6,-h/2+6,width-12,h-12,16);
  const inset=scene.add.graphics().fillGradientStyle(0x8f4824,0x6d2e17,0x351207,0x4c1a0b,1).fillRoundedRect(-width/2+10,-h/2+10,width-20,h-20,13).fillStyle(0xffffff,.12).fillRoundedRect(-width/2+19,-h/2+14,width-38,8,4);
  const text=scene.add.text(0,1,`${icon}${icon?'  ':''}${label}`,{...TEXT.title,fontSize:'23px',color:'#fff1c9',stroke:'#301006',strokeThickness:4}).setOrigin(.5);
  root.add([shadow,outer,inset,text]).setSize(width,h+12);makeInteractive(root,onClick);return root;
}

export function addIconButton(scene,x,y,kind,onClick,label=''){
  const root=scene.add.container(x,y),g=scene.add.graphics();
  g.fillStyle(0x030201,.5).fillCircle(3,6,34).fillGradientStyle(0xa45129,0x703019,0x321108,0x4f1c0c,1).fillCircle(0,0,31).lineStyle(4,0x2b0e05).strokeCircle(0,0,31).lineStyle(3,0xf0b43c).strokeCircle(0,0,27).lineStyle(1,0xffed9c,.85).strokeCircle(0,0,22).fillStyle(0xffffff,.14).fillEllipse(-7,-13,25,8);
  drawGlyph(g,kind,0xffffff);root.add(g).setSize(68,68).setData('label',label);makeInteractive(root,onClick);return root;
}

export function addToolButton(scene,x,y,width,label,kind,onClick,count=0){
  const root=scene.add.container(x,y),h=68,shadow=scene.add.graphics().fillStyle(0x090402,.65).fillRoundedRect(-width/2+2,-h/2+8,width,h,19),plate=scene.add.graphics().fillGradientStyle(0x8f4723,0x642817,0x2f1008,0x48190c,1).fillRoundedRect(-width/2,-h/2,width,h,19).lineStyle(4,0x2a0e05).strokeRoundedRect(-width/2,-h/2,width,h,19).lineStyle(3,0xe8ad38).strokeRoundedRect(-width/2+5,-h/2+5,width-10,h-10,15).lineStyle(1,0xffeb91,.82).strokeRoundedRect(-width/2+9,-h/2+9,width-18,h-18,12).fillStyle(0xffffff,.12).fillRoundedRect(-width/2+14,-h/2+12,width-28,8,4),glyph=scene.add.graphics();
  drawGlyph(glyph,kind,0xffd75a,-width*.24,0);const text=scene.add.text(width*.1,1,label,{...TEXT.hud,fontSize:'16px',color:'#fff2c9',stroke:'#2a0c04',strokeThickness:3}).setOrigin(.5);
  root.add([shadow,plate,glyph,text]).setSize(width,h+10);makeInteractive(root,onClick,{audio:false});
  const badge=scene.add.container(width/2-8,-h/2+3,[scene.add.circle(0,0,15,0xc94337).setStrokeStyle(3,0x6a160f),scene.add.text(0,0,String(count),{...TEXT.hud,fontSize:'13px',color:'#fff'}).setOrigin(.5)]).setDepth(10);root.add(badge);root.setData('badgeText',badge.list[1]);return root;
}

export function addProgressBar(scene,x,y,width,value,label){const root=scene.add.container(x,y),clamped=Phaser.Math.Clamp(value,0,1),fillWidth=Math.max(12,(width-12)*clamped),track=scene.add.graphics().fillStyle(0x07100c,.78).fillRoundedRect(-width/2,-14,width,28,14).lineStyle(3,0x391208).strokeRoundedRect(-width/2,-14,width,28,14).lineStyle(1,0xe4ac3b,.8).strokeRoundedRect(-width/2+4,-10,width-8,20,10),fill=scene.add.graphics().fillGradientStyle(0xfff092,0xffca42,0xd88718,0xa7520d,1).fillRoundedRect(-width/2+6,-8,fillWidth,16,8).fillStyle(0xffffff,.32).fillRoundedRect(-width/2+10,-5,Math.max(4,fillWidth-8),5,3),text=scene.add.text(0,0,label,{...TEXT.hud,fontSize:'12px',color:'#fff4cf',stroke:'#40200c',strokeThickness:3}).setOrigin(.5);root.add([track,fill,text]);return root;}

export function makeInteractive(target,callback,{audio=true}={}){target.setInteractive({useHandCursor:true});target.on('pointerover',()=>tweenScale(target,1.025,90));target.on('pointerout',()=>tweenScale(target,1,90));target.on('pointerdown',()=>tweenScale(target,.965,55));target.on('pointerup',()=>{tweenScale(target,1,95);if(audio)getAudioManager(target.scene)?.play('ui_click');callback?.();});return target;}

export function drawGlyph(g,kind,color,x=0,y=0){g.lineStyle(5,color,1);g.fillStyle(color,1);if(kind==='pause'||kind==='Ⅱ'){g.fillRoundedRect(x-10,y-13,7,26,3).fillRoundedRect(x+4,y-13,7,26,3);}else if(kind==='back'||kind==='‹'){g.beginPath().moveTo(x+9,y-14).lineTo(x-7,y).lineTo(x+9,y+14).strokePath();}else if(kind==='hint'||kind==='?'){g.strokeCircle(x,y-5,11);g.lineBetween(x-6,y+7,x+6,y+7);g.lineBetween(x-4,y+13,x+4,y+13);}else if(kind==='shuffle'||kind==='⤨'){g.lineBetween(x-13,y-9,x-6,y-9);g.lineBetween(x-6,y-9,x+10,y+9);g.fillTriangle(x+10,y+9,x+3,y+5,x+8,y+1);g.lineBetween(x-13,y+10,x-7,y+10);g.lineBetween(x-7,y+10,x+9,y-8);g.fillTriangle(x+9,y-8,x+2,y-5,x+7,y);}else if(kind==='undo'||kind==='↶'){g.beginPath().arc(x+2,y+3,13,Math.PI*.15,Math.PI*1.4).strokePath();g.fillTriangle(x-14,y-8,x-3,y-14,x-4,y-2);}else if(kind==='settings'||kind==='⚙'){g.strokeCircle(x,y,10);g.strokeCircle(x,y,3);for(let i=0;i<8;i++){const a=i*Math.PI/4;g.lineBetween(x+Math.cos(a)*12,y+Math.sin(a)*12,x+Math.cos(a)*17,y+Math.sin(a)*17);}}else if(kind==='play'||kind==='▶'){g.fillTriangle(x-8,y-14,x+15,y,x-8,y+14);}else if(kind==='close'||kind==='×'){g.lineBetween(x-11,y-11,x+11,y+11);g.lineBetween(x+11,y-11,x-11,y+11);}else if(kind==='+' ){g.lineBetween(x-12,y,x+12,y);g.lineBetween(x,y-12,x,y+12);}else if(kind==='−'||kind==='-'){g.lineBetween(x-12,y,x+12,y);}else{g.fillCircle(x,y,7);}}
function tweenScale(target,scale,duration){target.scene.tweens.killTweensOf(target);target.scene.tweens.add({targets:target,scale,duration,ease:'Quad.Out'});}
