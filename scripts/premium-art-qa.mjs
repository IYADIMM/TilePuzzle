import { mkdir,readFile,writeFile } from 'node:fs/promises';
import path from 'node:path';
import { launchQaBrowser,startQaServer } from './qa-helpers.mjs';

const root=process.cwd(),out=path.join(root,'qa','premium-art'),port=4185;
await mkdir(out,{recursive:true});
const {command,url}=await startQaServer(root,port),browser=await launchQaBrowser(),errors=[];
const collections=[
  {level:1,id:'fruit',reference:'07_collection_fruit_garden.png'},
  {level:2,id:'cars',reference:'08_collection_dream_garage.png'},
  {level:3,id:'sports',reference:'09_collection_champions_club.png'},
  {level:4,id:'auto-parts',reference:'10_collection_master_garage.png'},
  {level:5,id:'wild-animals',reference:'11_collection_wild_safari.png'},
  {level:6,id:'pets',reference:'12_collection_cozy_companions.png'},
  {level:7,id:'desserts'},
  {level:8,id:'flowers'},
  {level:9,id:'ocean-life'},
  {level:10,id:'music'},
  {level:11,id:'travel'},
  {level:12,id:'space'}
];

async function captureCollection(item){
  const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  page.on('pageerror',error=>errors.push(`${item.id}: ${error.message}`));
  await page.addInitScript(()=>localStorage.setItem('jade-garden-tiles-save-v2',JSON.stringify({version:5,maxUnlockedLevel:30,lastLevel:1,coins:250,gems:0,xp:0,stars:0,completedLevels:{},claimedRewards:{},queuedChestRewards:[],achievements:{},unlockedThemes:['fruits'],boosters:{undo:3,hint:3,shuffle:3},tutorial:{completed:true,dismissed:false,completedAt:1},prefs:{audio:{musicEnabled:false,sfxEnabled:false,musicVolume:.18,sfxVolume:.42},haptics:false,reducedMotion:true}})));
  await page.goto(`${url}/?screen=game&level=${item.level}`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>{const board=jadeGame.scene.getScene('Game')?.board;return board?.tiles?.length>0&&board.tiles.every(tile=>tile.scaleX>.94&&tile.icon.visible);},{timeout:8000});
  await page.waitForTimeout(180);
  const runtime=await page.evaluate(()=>{const s=jadeGame.scene.getScene('Game'),typeIds=[...new Set(s.board.tiles.map(tile=>tile.typeId))];return{typeIds,premiumBodies:s.board.tiles.filter(tile=>tile.usesPremiumBody).length,premiumIcons:s.board.tiles.filter(tile=>tile.icon.texture.key===`icon:${tile.typeId}`).length,tileCount:s.board.tiles.length,trayTexture:s.tray.frame.texture?.key,canvas:[s.game.canvas.width,s.game.canvas.height]};});
  const liveFile=path.join(out,`${item.id}-runtime.png`);await page.screenshot({path:liveFile});await page.close();
  if(!item.reference)return{...item,liveFile,comparisonFile:null,runtime};
  const reference=await readFile(path.join(root,'docs','phase2','source-pack','References',item.reference)),live=await readFile(liveFile),data=buffer=>`data:image/png;base64,${buffer.toString('base64')}`;
  const compare=await browser.newPage({viewport:{width:1100,height:900},deviceScaleFactor:1});
  await compare.setContent(`<style>*{box-sizing:border-box}body{margin:0;padding:24px;background:#05281f;color:#fff1c9;font:700 18px Arial}h1{color:#ffd35f;margin:0 0 16px}.grid{display:grid;grid-template-columns:1fr 390px;gap:20px;height:805px}.card{background:#021712;border:3px solid #c7942d;border-radius:18px;padding:12px;display:flex;flex-direction:column}.live{border-color:#62d29a}.card h2{text-align:center;font-size:17px;margin:0 0 8px}.card img{width:100%;height:100%;min-height:0;object-fit:contain}</style><h1>${item.id.toUpperCase()} — DIRECTION VS LIVE PHASER</h1><div class="grid"><div class="card"><h2>SUPPLIED CONCEPT DIRECTION — NOT A SPRITE</h2><img src="${data(reference)}"></div><div class="card live"><h2>ACTUAL RUNTIME</h2><img src="${data(live)}"></div></div>`,{waitUntil:'load'});
  const comparisonFile=path.join(out,`${item.id}-direction-vs-runtime.png`);await compare.screenshot({path:comparisonFile,fullPage:true});await compare.close();
  return{...item,liveFile,comparisonFile,runtime};
}

const results=[];for(const item of collections)results.push(await captureCollection(item));
const passed=results.every(item=>item.runtime.premiumBodies===item.runtime.tileCount&&item.runtime.premiumIcons===item.runtime.tileCount&&item.runtime.typeIds.length===6&&item.runtime.trayTexture==='premium:tray-four-slot')&&errors.length===0;
const report={passed,technicalIntegration:'PASSED',visualAcceptance:'PENDING_USER_REVIEW',collections:results,errors,note:'This verifies runtime use, dimensions, and transparency pipeline. It does not grant visual approval.'};
await writeFile(path.join(out,'premium-art-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
await browser.close();command.kill();if(!passed)process.exitCode=1;
