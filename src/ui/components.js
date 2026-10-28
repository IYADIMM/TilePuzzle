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

export function addHomePrimaryButton(scene,x,y,width,label,onClick){
  const root=scene.add.container(x,y),h=78;
  const shadow=scene.add.graphics().fillStyle(0x020503,.62).fillRoundedRect(-width/2+3,-h/2+11,width,h,28);
  const plate=scene.add.graphics()
    .fillGradientStyle(0x43a43f,0x168236,0x045221,0x073b1d,1).fillRoundedRect(-width/2,-h/2,width,h,28)
    .lineStyle(5,0x5c2a09).strokeRoundedRect(-width/2,-h/2,width,h,28)
    .lineStyle(4,0xf5c552).strokeRoundedRect(-width/2+5,-h/2+5,width-10,h-10,23)
    .lineStyle(1.5,0xffffc0,.9).strokeRoundedRect(-width/2+11,-h/2+11,width-22,h-22,18)
    .fillStyle(0xffffff,.18).fillRoundedRect(-width/2+22,-h/2+13,width-44,11,6);
  const glyph=scene.add.graphics();drawGlyph(glyph,'play',0xffe4a0,-width*.36,0);
  const text=scene.add.text(18,1,label,{...TEXT.title,fontFamily:'Cormorant Garamond, Georgia, serif',fontSize:'29px',color:'#fff7d4',stroke:'#214019',strokeThickness:4,letterSpacing:.8}).setOrigin(.5);
  root.add([shadow,plate,glyph,text]).setSize(width,h+13);makeInteractive(root,onClick,{lockMs:700});return root;
}

export function addIvoryButton(scene,x,y,width,label,kind,onClick,{height=62,fontSize=18,chevron=true}={}){
  const root=scene.add.container(x,y),h=height;
  const shadow=scene.add.graphics().fillStyle(0x020503,.55).fillRoundedRect(-width/2+2,-h/2+8,width,h,20);
  const plate=scene.add.graphics()
    .fillGradientStyle(0xfffff3,0xfff3d6,0xe7c99b,0xd2ad76,1).fillRoundedRect(-width/2,-h/2,width,h,20)
    .lineStyle(4,0x6d2e0d).strokeRoundedRect(-width/2,-h/2,width,h,20)
    .lineStyle(3,0xe6a52e).strokeRoundedRect(-width/2+5,-h/2+5,width-10,h-10,15)
    .lineStyle(1,0xffffe1,.95).strokeRoundedRect(-width/2+10,-h/2+10,width-20,h-20,11)
    .fillStyle(0xffffff,.33).fillRoundedRect(-width/2+17,-h/2+11,width-34,8,4);
  const glyph=scene.add.graphics();drawHomeGlyph(glyph,kind,0x7c3511,-width/2+33,0);
  const text=scene.add.text(chevron?7:13,1,label,{...TEXT.hud,fontFamily:'Cormorant Garamond, Georgia, serif',fontSize:`${fontSize}px`,color:'#173f31',stroke:'#fff8e5',strokeThickness:1.5,letterSpacing:.3}).setOrigin(.5);
  root.add([shadow,plate,glyph,text]);
  if(chevron){const arrow=scene.add.graphics(),ax=width/2-28;arrow.lineStyle(4,0x173f31,1).beginPath().moveTo(ax-6,-10).lineTo(ax+5,0).lineTo(ax-6,10).strokePath();root.add(arrow);}
  root.setSize(width,h+10).setData('label',label);makeInteractive(root,onClick,{lockMs:520});return root;
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

export function makeInteractive(target,callback,{audio=true,lockMs=420}={}){target.setInteractive({useHandCursor:true});const restY=target.y;let locked=false;target.on('pointerover',()=>{if(!locked)tweenButton(target,1.025,restY,90);});target.on('pointerout',()=>{if(!locked)tweenButton(target,1,restY,90);});target.on('pointerdown',()=>{if(!locked)tweenButton(target,.985,restY+4,55);});target.on('pointerup',()=>{if(locked||!target.scene?.sys?.isActive())return;locked=true;target.disableInteractive();tweenButton(target,1,restY,110);if(audio)getAudioManager(target.scene)?.play('ui_click');callback?.();target.scene.time?.delayedCall(lockMs,()=>{locked=false;if(target.active&&target.scene?.sys?.isActive())target.setInteractive({useHandCursor:true});});});return target;}

export function drawGlyph(g,kind,color,x=0,y=0){g.lineStyle(5,color,1);g.fillStyle(color,1);if(kind==='pause'||kind==='Ⅱ'){g.fillRoundedRect(x-10,y-13,7,26,3).fillRoundedRect(x+4,y-13,7,26,3);}else if(kind==='back'||kind==='‹'){g.beginPath().moveTo(x+9,y-14).lineTo(x-7,y).lineTo(x+9,y+14).strokePath();}else if(kind==='hint'||kind==='?'){g.strokeCircle(x,y-5,11);g.lineBetween(x-6,y+7,x+6,y+7);g.lineBetween(x-4,y+13,x+4,y+13);}else if(kind==='shuffle'||kind==='⤨'){g.lineBetween(x-13,y-9,x-6,y-9);g.lineBetween(x-6,y-9,x+10,y+9);g.fillTriangle(x+10,y+9,x+3,y+5,x+8,y+1);g.lineBetween(x-13,y+10,x-7,y+10);g.lineBetween(x-7,y+10,x+9,y-8);g.fillTriangle(x+9,y-8,x+2,y-5,x+7,y);}else if(kind==='undo'||kind==='↶'){g.beginPath().arc(x+2,y+3,13,Math.PI*.15,Math.PI*1.4).strokePath();g.fillTriangle(x-14,y-8,x-3,y-14,x-4,y-2);}else if(kind==='settings'||kind==='⚙'){g.strokeCircle(x,y,10);g.strokeCircle(x,y,3);for(let i=0;i<8;i++){const a=i*Math.PI/4;g.lineBetween(x+Math.cos(a)*12,y+Math.sin(a)*12,x+Math.cos(a)*17,y+Math.sin(a)*17);}}else if(kind==='play'||kind==='▶'){g.fillTriangle(x-8,y-14,x+15,y,x-8,y+14);}else if(kind==='close'||kind==='×'){g.lineBetween(x-11,y-11,x+11,y+11);g.lineBetween(x+11,y-11,x-11,y+11);}else if(kind==='+' ){g.lineBetween(x-12,y,x+12,y);g.lineBetween(x,y-12,x,y+12);}else if(kind==='−'||kind==='-'){g.lineBetween(x-12,y,x+12,y);}else{g.fillCircle(x,y,7);}}
function drawHomeGlyph(g,kind,color,x,y){g.lineStyle(3,color,1);g.fillStyle(color,1);if(kind==='styles'){g.fillRoundedRect(x-14,y-13,23,28,5);g.lineStyle(2,0xe4a23a).strokeRoundedRect(x-14,y-13,23,28,5);g.fillRoundedRect(x-5,y-17,23,28,5);g.fillStyle(0xf0b84b).fillCircle(x+6,y-3,6);}else if(kind==='levels'){g.strokeRoundedRect(x-15,y-13,28,25,4);g.lineBetween(x-8,y-7,x+8,y-7);g.fillCircle(x-8,y+2,3).fillCircle(x+1,y+2,3).fillCircle(x+9,y+2,3);}else if(kind==='collection'){g.fillRoundedRect(x-15,y-7,30,20,4);g.fillRoundedRect(x-10,y-15,20,9,4);g.lineStyle(2,0xe4a23a).strokeRoundedRect(x-15,y-7,30,20,4);g.lineBetween(x,y-7,x,y+13);}else if(kind==='records'){g.strokeCircle(x,y-3,11);g.lineBetween(x-7,y+7,x-12,y+17);g.lineBetween(x+7,y+7,x+12,y+17);g.fillCircle(x,y-3,4);}else if(kind==='achievements'){g.fillCircle(x,y-4,13);g.fillStyle(0xf0b84b).fillCircle(x,y-4,7);g.fillStyle(color).fillTriangle(x-8,y+6,x-3,y+19,x+2,y+7).fillTriangle(x+8,y+6,x+3,y+19,x-2,y+7);}else{g.fillCircle(x,y,10);}}
function tweenScale(target,scale,duration){target.scene.tweens.killTweensOf(target);target.scene.tweens.add({targets:target,scale,duration,ease:'Quad.Out'});}
function tweenButton(target,scale,y,duration){target.scene.tweens.killTweensOf(target);target.scene.tweens.add({targets:target,scale,y,duration,ease:'Quad.Out'});}
