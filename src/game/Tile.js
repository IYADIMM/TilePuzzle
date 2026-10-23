import Phaser from 'phaser';
import { tileTextureKey } from '../art/TileMaterialFactory.js';
import { normalizeTypeId } from '../logic/SlotState.js';
import { PREMIUM_MATERIALS,PREMIUM_TEXTURES,PREMIUM_TILE_MATERIALS } from '../art/PremiumAssetManifest.js';
import { renderedTouchSize } from './TileGeometry.js';

export class Tile extends Phaser.GameObjects.Container {
  constructor(scene,data,x,y,geometry,materialId,skinResolver){
    super(scene,x,y);const typeId=normalizeTypeId(data.typeId);if(!typeId)throw new Error(`Tile ${data.id||'unknown'} requires a stable typeId`);this.tileData=data;this.typeId=typeId;this.symbolId=typeId;this.tileData.typeId=typeId;this.tileData.symbolId=typeId;this.materialId=materialId;this.skinResolver=skinResolver;this.geometry=geometry;this.isBlocked=false;this.isCollected=false;this.createVisuals();scene.add.existing(this);
  }

  createVisuals(){
    const {tileW:w,tileH:h}=this.geometry;
    const lift=Math.max(0,this.tileData.layer||0),shadowAlpha=Math.min(.62,.34+lift*.055);
    this.ambientShadow=this.scene.add.ellipse(6+lift*1.2,h*.47+lift*.8,w*1.24,h*.25,0x010403,.18+lift*.025);
    this.contactShadow=this.scene.add.ellipse(3+lift*.8,h*.425+lift*.6,w*1.04,h*.15,0x010302,shadowAlpha);
    this.premiumBodyKey=this.skinResolver?.bodyTextureKey(this.materialId)||PREMIUM_MATERIALS[this.materialId]?.key||PREMIUM_TEXTURES.tileBody.key;
    this.usesPremiumBody=PREMIUM_TILE_MATERIALS.has(this.materialId)&&this.scene.textures.exists(this.premiumBodyKey);
    this.body=this.scene.add.image(0,4,this.usesPremiumBody?this.premiumBodyKey:tileTextureKey(this.materialId)).setDisplaySize(w*1.18,h*1.2);
    this.pendingGlow=this.scene.add.graphics().fillStyle(0xffd85b,.16).fillRoundedRect(-w*.51,-h*.49,w*1.02,h*.96,Math.min(w,h)*.16).lineStyle(6,0xffd85b,1).strokeRoundedRect(-w*.51,-h*.49,w*1.02,h*.96,Math.min(w,h)*.16).setAlpha(0);
    const iconSize=Math.min(w*.86,h*.82);
    const symbolKey=this.skinResolver.textureKey(this.symbolId);
    this.iconShadow=this.scene.add.image(2,h*.015,symbolKey).setDisplaySize(iconSize,iconSize).setTint(0x1c251f).setAlpha(.24);
    this.icon=this.scene.add.image(0,-h*.035,symbolKey).setDisplaySize(iconSize,iconSize);
    this.specular=this.scene.add.graphics().fillStyle(0xffffff,.68).fillEllipse(-w*.22,-h*.33,w*.31,h*.1).fillStyle(0xffffff,.2).fillEllipse(w*.31,h*.17,w*.1,h*.2);
    this.blockOverlay=this.scene.add.graphics().fillStyle(0x08251e,.24).fillRoundedRect(-w*.5,-h*.5,w,h,h*.13).lineStyle(1.5,0x06130f,.46).strokeRoundedRect(-w*.5,-h*.5,w,h,h*.13).setVisible(false);
    this.add([this.ambientShadow,this.contactShadow,this.body,this.pendingGlow,this.iconShadow,this.icon,this.specular,this.blockOverlay]);
    this.setSize(w,h);this.enableFaceInput();
    this.on('pointerdown',()=>{if(!this.isBlocked&&!this.isCollected)this.scene.tweens.add({targets:this,scaleX:.965,scaleY:.965,duration:55,ease:'Quad.Out'});});
    this.on('pointerout',()=>{if(!this.isCollected)this.scene.tweens.add({targets:this,scaleX:1,scaleY:1,duration:75,ease:'Quad.Out'});});
  }

  getTouchSize(){return renderedTouchSize(this.geometry.tileW,this.geometry.tileH);}
  enableFaceInput(){const{width,height}=this.getTouchSize();this.setInteractive(new Phaser.Geom.Rectangle(-width*.5,-height*.5,width,height),Phaser.Geom.Rectangle.Contains);if(this.input)this.input.cursor='pointer';return this;}
  setBlocked(blocked,reason='selectable'){this.isBlocked=Boolean(blocked);this.blockReason=reason;this.blockOverlay.setVisible(this.isBlocked);this.body.setTint(this.isBlocked?0xd9ddd8:0xffffff);this.icon.setTint(this.isBlocked?0xa4b2aa:0xffffff);this.iconShadow.setAlpha(this.isBlocked ? .14 : .24);this.specular.setAlpha(this.isBlocked ? .48 : 1);if(this.isBlocked||this.isCollected)this.disableInteractive();else this.enableFaceInput();return this;}
  setPendingMatch(pending){this.scene.tweens.killTweensOf(this.pendingGlow);if(!pending){this.pendingGlow.setAlpha(0);this.body.setTint(this.isBlocked?0xb9c2be:0xffffff);return;}this.body.setTint(0xffe7a3);this.pendingGlow.setAlpha(.62);this.scene.tweens.add({targets:this.pendingGlow,alpha:1,duration:620,yoyo:true,repeat:-1,ease:'Sine.InOut'});}
  setSelected(selected){if(selected)this.scene.tweens.add({targets:this,scaleX:1.08,scaleY:1.08,duration:75,ease:'Quad.Out'});return this;}
  setSymbol(typeId){const normalized=normalizeTypeId(typeId);if(!normalized)throw new Error(`Tile ${this.tileData.id} requires a stable typeId`);this.typeId=normalized;this.symbolId=normalized;this.tileData.typeId=normalized;this.tileData.symbolId=normalized;const key=this.skinResolver.textureKey(normalized);this.icon.setTexture(key);this.iconShadow.setTexture(key);}
  applySkin(skinResolver){this.skinResolver=skinResolver;this.premiumBodyKey=skinResolver.bodyTextureKey(this.materialId);this.usesPremiumBody=this.scene.textures.exists(this.premiumBodyKey);this.body.setTexture(this.usesPremiumBody?this.premiumBodyKey:tileTextureKey(this.materialId));this.setSymbol(this.typeId);return this;}
  pulseHint(){this.scene.tweens.killTweensOf(this);this.scene.tweens.add({targets:this,scaleX:1.12,scaleY:1.12,duration:175,yoyo:true,repeat:2,ease:'Sine.InOut'});}
  revealGlint(){this.specular.setX(-this.geometry.tileW*.18).setAlpha(1);this.scene.tweens.add({targets:this.specular,x:this.geometry.tileW*.35,alpha:.2,duration:330,ease:'Cubic.Out',onComplete:()=>this.specular.setX(0)});}
  flipIn(delay=0){this.body.setTexture(this.usesPremiumBody?this.premiumBodyKey:tileTextureKey(this.materialId,true));this.icon.setVisible(false);this.iconShadow.setVisible(false);this.setScale(.84,1).setAlpha(0);this.scene.tweens.add({targets:this,scaleX:.04,alpha:1,duration:110,delay,ease:'Sine.In',onComplete:()=>{this.body.setTexture(this.usesPremiumBody?this.premiumBodyKey:tileTextureKey(this.materialId));this.icon.setVisible(true);this.iconShadow.setVisible(true);this.scene.tweens.add({targets:this,scaleX:1,scaleY:1,duration:160,ease:'Back.Out'});}});}
  getFaceBounds(){const {tileW:w,tileH:h}=this.geometry;return new Phaser.Geom.Rectangle(this.x-w*.5,this.y-h*.5,w,h);}
  getTouchBounds(){const{width,height}=this.getTouchSize();return new Phaser.Geom.Rectangle(this.x-width*.5,this.y-height*.5,width,height);}
}
