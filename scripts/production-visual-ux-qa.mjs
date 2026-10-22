import { mkdir,writeFile } from 'node:fs/promises';
import path from 'node:path';
import { launchQaBrowser,legalPointerPlaythrough,startQaServer } from './qa-helpers.mjs';

const root=process.cwd(),out=path.join(root,'qa','production-visual-ux'),port=53123;
await mkdir(out,{recursive:true});
const {command,url}=await startQaServer(root,port),browser=await launchQaBrowser(),captures=[],errors=[];
const themes=[['fruit',1],['cars',2],['sports',3],['auto-parts',4],['wild-animals',5],['pets',6]];
const baseSave={version:5,maxUnlockedLevel:30,lastLevel:1,coins:825,gems:12,xp:180,stars:21,bestCombo:4,chestProgress:3,completedLevels:{1:{score:2400,stars:3,bestTime:44},2:{score:1800,stars:2,bestTime:58}},claimedRewards:{},queuedChestRewards:[],achievements:{},unlockedThemes:['fruits','cars','sports','auto-parts','wild-animals','pets'],boosters:{undo:3,hint:3,shuffle:3},tutorial:{completed:true,dismissed:false,completedAt:1},prefs:{audio:{musicEnabled:false,sfxEnabled:false,musicVolume:.18,sfxVolume:.42},haptics:false,reducedMotion:false},economy:{daily:{streak:0,lastClaimUtc:null},inventory:{owned:[],equipped:{}},ledger:[],revives:{}}};

async function pageFor(route,{viewport={width:390,height:844},save=baseSave}={}){
  const page=await browser.newPage({viewport,deviceScaleFactor:1,isMobile:true,hasTouch:true});
  page.on('pageerror',error=>errors.push(`${route}: ${error.message}`));
  page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('favicon'))errors.push(`${route}: ${message.text()}`);});
  if(save)await page.addInitScript(value=>localStorage.setItem('jade-garden-tiles-save-v2',JSON.stringify(value)),save);else await page.addInitScript(()=>localStorage.removeItem('jade-garden-tiles-save-v2'));
  await page.goto(`${url}/${route}`,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.jadeGame?.isBooted);await page.waitForTimeout(620);return page;
}
async function shot(page,name,meta={}){const file=path.join(out,`${name}.png`);await page.screenshot({path:file});captures.push({name,file,...meta});return file;}
async function waitGameSettled(page){await page.waitForFunction(()=>{const board=jadeGame.scene.getScene('Game')?.board;return board?.tiles?.length>0&&board.tiles.every(tile=>tile.scaleX>.94&&tile.alpha>.94&&tile.icon.visible);},{timeout:8000});await page.waitForTimeout(180);}

try{
  for(const [id,level] of themes){const page=await pageFor(`?screen=game&level=${level}`);await waitGameSettled(page);const facts=await page.evaluate(()=>{const scene=jadeGame.scene.getScene('Game'),xs=scene.board.tiles.map(tile=>tile.x),ys=scene.board.tiles.map(tile=>tile.y),p=scene.board.projection;return{theme:scene.theme.id,tileCount:scene.board.tiles.length,premiumIcons:scene.board.tiles.filter(tile=>tile.icon.texture.key===`icon:${tile.typeId}`).length,premiumBodies:scene.board.tiles.filter(tile=>tile.usesPremiumBody).length,tile:[Math.round(p.tileW),Math.round(p.tileH)],span:[Math.round(Math.max(...xs)-Math.min(...xs)),Math.round(Math.max(...ys)-Math.min(...ys))],selectable:scene.board.selectableTiles.length};});await shot(page,`gameplay-${id}-390x844`,facts);await page.close();}

  for(const viewport of [{width:360,height:640},{width:430,height:932},{width:768,height:1024}]){const page=await pageFor('?screen=game&level=1',{viewport});await waitGameSettled(page);await shot(page,`responsive-fruit-${viewport.width}x${viewport.height}`,{viewport});await page.close();}

  const tutorialPage=await pageFor('?screen=game&level=1',{save:null});await waitGameSettled(tutorialPage);await tutorialPage.waitForFunction(()=>jadeGame.scene.getScene('Game')?.tutorial?.enabled&&jadeGame.scene.getScene('Game').tutorial.pointer?.visible);await shot(tutorialPage,'tutorial-free-edge-390x844');await tutorialPage.close();

  for(const [route,name,ready] of [['','home-390x844',()=>jadeGame.scene.isActive('Menu')],['?screen=levels','level-journey-390x844',()=>jadeGame.scene.isActive('LevelSelect')],['?screen=shop','test-shop-390x844',()=>jadeGame.scene.isActive('Shop')],['?screen=leaderboard','local-records-390x844',()=>jadeGame.scene.isActive('Leaderboard')]]){const page=await pageFor(route);await page.waitForFunction(ready);await shot(page,name);await page.close();}

  const audioPage=await pageFor('');await audioPage.evaluate(()=>jadeGame.scene.getScene('Menu').scene.launch('AudioSettings',{hostKey:'Menu'}));await audioPage.waitForFunction(()=>jadeGame.scene.isActive('AudioSettings'));await audioPage.waitForTimeout(220);await shot(audioPage,'audio-settings-390x844');await audioPage.close();

  const debugPage=await pageFor('?screen=game&level=1&debugGrid=1');await waitGameSettled(debugPage);await debugPage.waitForFunction(()=>jadeGame.scene.getScene('Game')?.board?.debugGraphics);const debugFacts=await debugPage.evaluate(()=>{const board=jadeGame.scene.getScene('Game').board;return{enabled:board.debugEnabled,labels:board.debugTileLabels.length,reasons:[...new Set(board.activeTiles.map(tile=>tile.tileData.blockReason))]};});await shot(debugPage,'debug-blocker-logic-390x844',debugFacts);await debugPage.close();

  const playPage=await pageFor('?screen=game&level=1');await waitGameSettled(playPage);const performance=await playPage.evaluate(async()=>{const scene=jadeGame.scene.getScene('Game'),start=performance.now();let frames=0,last=start,maxFrame=0,totalFrame=0;await new Promise(resolve=>{const tick=now=>{const delta=now-last;last=now;if(frames){maxFrame=Math.max(maxFrame,delta);totalFrame+=delta;}frames++;if(now-start>=1000)resolve();else requestAnimationFrame(tick);};requestAnimationFrame(tick);});return{fps:Math.round(frames*1000/(performance.now()-start)),averageFrameMs:Number((totalFrame/Math.max(1,frames-1)).toFixed(2)),maxFrameMs:Number(maxFrame.toFixed(2)),textureCount:scene.textures.getTextureKeys().length,canvas:[scene.game.canvas.width,scene.game.canvas.height]};});
  const pointerRun=await legalPointerPlaythrough(playPage,{timeScale:24});await playPage.waitForFunction(()=>jadeGame.scene.isActive('Reward'),{timeout:10000});await playPage.waitForTimeout(1450);const rewardFacts=await playPage.evaluate(()=>({activeScenes:jadeGame.scene.getScenes(true).map(scene=>scene.scene.key),saved:JSON.parse(localStorage.getItem('jade-garden-tiles-save-v2')).completedLevels['1']}));await shot(playPage,'genuine-pointer-level-complete-390x844',rewardFacts);await playPage.close();

  const report={generatedAt:new Date().toISOString(),passed:errors.length===0&&themes.every(([id])=>{const capture=captures.find(item=>item.name===`gameplay-${id}-390x844`);return capture&&capture.premiumIcons===capture.tileCount&&capture.premiumBodies===capture.tileCount;})&&pointerRun.events.length===36&&rewardFacts.activeScenes.includes('Reward')&&debugFacts.enabled,visualAcceptance:'PENDING_USER_REVIEW',commercialReadiness:'INTERNAL_ALPHA',performance,pointerInteraction:{count:pointerRun.events.length,first:pointerRun.events.slice(0,3),last:pointerRun.events.slice(-3)},debugFacts,rewardFacts,captures,errors,limitations:['Six remaining collections still use procedural icon fallbacks.','Material-specific raster tile bodies are not yet produced for all 12 materials.','Visual approval belongs to the user and is not inferred from automated checks.']};
  await writeFile(path.join(out,'browser-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({passed:report.passed,performance,pointerEvents:pointerRun.events.length,captures:captures.length,errors},null,2));if(!report.passed)process.exitCode=1;
}finally{await browser.close();command.kill();}
