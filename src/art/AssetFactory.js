import { iconTextureKey } from '../data/themes.js';
import { PREMIUM_ICONS,PREMIUM_MATERIALS,PREMIUM_TEXTURES } from './PremiumAssetManifest.js';
import { CLASSIC_ASSETS } from './TileStyleRegistry.js';

export class AssetFactory {
  static preload(scene) {
    Object.entries(PREMIUM_ICONS).forEach(([iconId,url])=>scene.load.image(iconTextureKey(iconId),url));
    Object.values(PREMIUM_TEXTURES).forEach(asset=>scene.load.image(asset.key,asset.url));
    Object.values(PREMIUM_MATERIALS).forEach(asset=>scene.load.image(asset.key,asset.url));
    CLASSIC_ASSETS.forEach(asset=>scene.load.image(asset.key,asset.url));
    scene.load.image('bg:premium-felt','/assets/premium/premium-felt.webp');
  }

  static createRuntimeTextures(scene) {
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

function createParticle(scene, key, size, draw) {
  const texture = scene.textures.createCanvas(key, size, size);
  draw(texture.context);
  texture.refresh();
}
