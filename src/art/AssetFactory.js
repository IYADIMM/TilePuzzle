import { allIconIds, createIconSvg, svgDataUri } from './SvgIconLibrary.js';
import { ensureAllMaterialTextures } from './TileMaterialFactory.js';
import { iconTextureKey } from '../data/themes.js';
import { PREMIUM_ICONS,PREMIUM_MATERIALS,PREMIUM_TEXTURES } from './PremiumAssetManifest.js';
import { CLASSIC_ASSETS } from './TileStyleRegistry.js';

export class AssetFactory {
  static preload(scene) {
    allIconIds().forEach(iconId => {
      if(PREMIUM_ICONS[iconId])scene.load.image(iconTextureKey(iconId),PREMIUM_ICONS[iconId]);
      else scene.load.svg(iconTextureKey(iconId), svgDataUri(createIconSvg(iconId)), { width: 256, height: 256 });
    });
    Object.values(PREMIUM_TEXTURES).forEach(asset=>scene.load.image(asset.key,asset.url));
    Object.values(PREMIUM_MATERIALS).forEach(asset=>scene.load.image(asset.key,asset.url));
    CLASSIC_ASSETS.forEach(asset=>scene.load.image(asset.key,asset.url));
  }

  static createRuntimeTextures(scene) {
    ensureAllMaterialTextures(scene);
    if (!scene.textures.exists('bg:premium-felt')) createFeltTexture(scene);
    if (!scene.textures.exists('fx:petal')) createParticle(scene, 'fx:petal', 18, ctx => {
      ctx.fillStyle = '#fff7d6'; ctx.beginPath(); ctx.ellipse(9, 9, 5, 8, .65, 0, Math.PI * 2); ctx.fill();
    });
    if (!scene.textures.exists('fx:spark')) createParticle(scene, 'fx:spark', 20, ctx => {
      const g = ctx.createRadialGradient(10, 10, 0, 10, 10, 10); g.addColorStop(0, '#fff'); g.addColorStop(.25, '#fff0a0'); g.addColorStop(1, 'rgba(244,180,36,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 20, 20);
    });
    if (!scene.textures.exists('fx:shard')) createParticle(scene, 'fx:shard', 20, ctx => {
      ctx.fillStyle = '#f5f1e7'; ctx.strokeStyle = '#b9b5ad'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(3, 3); ctx.lineTo(17, 7); ctx.lineTo(11, 18); ctx.closePath(); ctx.fill(); ctx.stroke();
    });
  }
}

function createFeltTexture(scene){
  const width=540,height=960,texture=scene.textures.createCanvas('bg:premium-felt',width,height),ctx=texture.context;
  const radial=ctx.createRadialGradient(width*.5,height*.42,20,width*.5,height*.48,width*.72);
  radial.addColorStop(0,'#155746');radial.addColorStop(.48,'#0d4438');radial.addColorStop(.82,'#082f28');radial.addColorStop(1,'#031b18');ctx.fillStyle=radial;ctx.fillRect(0,0,width,height);
  const pixels=ctx.getImageData(0,0,width,height),data=pixels.data;let seed=0x4a414445;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const noise=((seed>>>24)-128)*.055,index=(y*width+x)*4;data[index]=Math.max(0,Math.min(255,data[index]+noise));data[index+1]=Math.max(0,Math.min(255,data[index+1]+noise));data[index+2]=Math.max(0,Math.min(255,data[index+2]+noise*.7));}
  ctx.putImageData(pixels,0,0);ctx.globalAlpha=.055;ctx.strokeStyle='#d5efe2';ctx.lineWidth=.35;
  for(let i=0;i<430;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const x=seed%width;seed=(Math.imul(seed,1664525)+1013904223)>>>0;const y=seed%height;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+3+(seed%6),y+1);ctx.stroke();}
  texture.refresh();
}

function createParticle(scene, key, size, draw) {
  const texture = scene.textures.createCanvas(key, size, size);
  draw(texture.context);
  texture.refresh();
}
