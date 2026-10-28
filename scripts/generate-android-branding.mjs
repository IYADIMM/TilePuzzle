import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const res = path.join(root, 'android', 'app', 'src', 'main', 'res');
const store = path.join(root, 'docs', 'android-release', 'store-assets');
const foregroundMaster = path.join(root, 'public', 'assets', 'brand', 'ivory-mahjong-emblem-1536.png');
const density = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
const adaptive = { mdpi: 108, hdpi: 162, xhdpi: 216, xxhdpi: 324, xxxhdpi: 432 };

await mkdir(store, { recursive: true });

for (const [name, size] of Object.entries(density)) {
  const target = path.join(res, `mipmap-${name}`);
  await mkdir(target, { recursive: true });
  const buffer = await sharp(foregroundMaster).resize(Math.round(size*.82),Math.round(size*.82),{fit:'contain'}).extend({top:Math.floor(size*.09),bottom:size-Math.round(size*.82)-Math.floor(size*.09),left:Math.floor(size*.09),right:size-Math.round(size*.82)-Math.floor(size*.09),background:'#07352c'}).flatten({background:'#07352c'}).png({ compressionLevel: 9 }).toBuffer();
  await Promise.all([
    writeFile(path.join(target, 'ic_launcher.png'), buffer),
    writeFile(path.join(target, 'ic_launcher_round.png'), buffer)
  ]);
}

for (const [name, size] of Object.entries(adaptive)) {
  const target = path.join(res, `mipmap-${name}`);
  const artSize = Math.round(size * 0.72);
  const pad = Math.floor((size - artSize) / 2);
  const foreground = await sharp(foregroundMaster)
    .resize(artSize, artSize, { fit: 'contain' })
    .extend({ top: pad, bottom: size - artSize - pad, left: pad, right: size - artSize - pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(path.join(target, 'ic_launcher_foreground.png'), foreground);
}

const splashLogo = await sharp(foregroundMaster)
  .resize(320, 320, { fit: 'contain' })
  .extend({ top: 96, bottom: 96, left: 96, right: 96, background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ compressionLevel: 9 })
  .toBuffer();
await mkdir(path.join(res, 'drawable-nodpi'), { recursive: true });
await writeFile(path.join(res, 'drawable-nodpi', 'splash_logo.png'), splashLogo);

await sharp(foregroundMaster).resize(420,420,{fit:'contain'}).extend({top:46,bottom:46,left:46,right:46,background:'#07352c'}).flatten({background:'#07352c'}).png({ compressionLevel: 9, palette: true, quality: 95 }).toFile(path.join(store, 'google-play-icon-512.png'));

const featureText = Buffer.from(`<svg width="1024" height="500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="g" cx="32%" cy="30%" r="82%"><stop stop-color="#176d54"/><stop offset=".55" stop-color="#073d32"/><stop offset="1" stop-color="#021b17"/></radialGradient>
    <filter id="s"><feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#000" flood-opacity=".55"/></filter>
  </defs>
  <rect width="1024" height="500" fill="url(#g)"/>
  <path d="M0 430 C180 350 320 520 520 418 C700 330 835 420 1024 342 V500 H0Z" fill="#031f19" opacity=".82"/>
  <g filter="url(#s)" font-family="Arial, sans-serif" text-anchor="middle">
    <text x="360" y="216" font-size="64" font-weight="800" fill="#fff2c6" stroke="#4b1d08" stroke-width="4">IVORY</text>
    <text x="360" y="282" font-size="48" font-weight="800" letter-spacing="9" fill="#eab94d" stroke="#4b1d08" stroke-width="3">MAHJONG</text>
    <text x="360" y="334" font-size="22" font-weight="600" letter-spacing="3" fill="#d8eee5">MATCH TWO • UNWIND • PROGRESS</text>
  </g>
</svg>`);
const featureIcon = await sharp(foregroundMaster).resize(392, 392, { fit: 'contain' }).png().toBuffer();
await sharp(featureText)
  .composite([{ input: featureIcon, left: 628, top: 52 }])
  .png({ compressionLevel: 9 })
  .toFile(path.join(store, 'feature-graphic-1024x500-DRAFT.png'));

console.log('Generated branded Android launcher, adaptive, monochrome, splash, and draft Play assets.');
