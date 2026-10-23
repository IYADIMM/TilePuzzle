import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {launchQaBrowser,legalTilePoint,startQaServer,worldPoint} from './qa-helpers.mjs';

const root=process.cwd(),out=path.join(root,'qa','production-correction');
await mkdir(out,{recursive:true});
const {command,url}=await startQaServer(root,4192),browser=await launchQaBrowser();
const errors=[];
const newPage=async()=>{const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});await page.addInitScript(()=>{if(!localStorage.getItem('jade-garden-tiles-save-v5'))localStorage.setItem('jade-garden-tiles-save-v5',JSON.stringify({version:5,maxUnlockedLevel:10,lastLevel:1,coins:250,gems:20,boosters:{undo:3,hint:3,shuffle:3},tutorial:{completed:true,dismissed:false,completedAt:1},prefs:{audio:{musicEnabled:false,sfxEnabled:false,musicVolume:.18,sfxVolume:.42},haptics:false,reducedMotion:true},rules:{matchSize:2,generationVersion:2}}));});return page;};

try{
  const resumePage=await newPage();
  await resumePage.goto(`${url}/?screen=game&level=1`,{waitUntil:'domcontentloaded'});
  await resumePage.waitForFunction(()=>jadeGame.scene.getScene('Game')?.board?.tiles?.length===36);
  await resumePage.evaluate(()=>jadeGame.scene.getScene('Game').tweens.timeScale=10);
  await resumePage.waitForFunction(()=>jadeGame.scene.getScene('Game').board.tiles.every(tile=>tile.scaleX>.94&&tile.scaleY>.94&&tile.alpha>.94&&tile.icon.visible),{timeout:8000});
  const first=await resumePage.evaluate(()=>jadeGame.scene.getScene('Game').board.level.solution[0]);
  const firstPoint=await legalTilePoint(resumePage,first);await resumePage.mouse.click(firstPoint.x,firstPoint.y);
  await resumePage.waitForFunction(()=>{const s=jadeGame.scene.getScene('Game');return!s.tray.isBusy&&s.tray.entries.length===1;});
  const beforeReload=await resumePage.evaluate(()=>{const s=jadeGame.scene.getScene('Game'),save=JSON.parse(localStorage.getItem('jade-garden-tiles-save-v5'));return{active:s.board.activeTiles.length,tray:s.tray.entries.map(e=>e.typeId),selected:s.selectedTileCount,undo:save.boosters.undo,checkpoint:save.activeAttempt?.status};});
  await resumePage.reload({waitUntil:'domcontentloaded'});await resumePage.waitForFunction(()=>jadeGame.scene.getScene('Game')?.board?.tiles?.length===36);await resumePage.waitForTimeout(250);
  const afterReload=await resumePage.evaluate(()=>{const s=jadeGame.scene.getScene('Game'),save=JSON.parse(localStorage.getItem('jade-garden-tiles-save-v5'));return{active:s.board.activeTiles.length,tray:s.tray.entries.map(e=>e.typeId),selected:s.selectedTileCount,undo:save.boosters.undo};});
  await resumePage.screenshot({path:path.join(out,'01-resumed-checkpoint-390x844.png')});await resumePage.close();

  const revivePage=await newPage();await revivePage.goto(`${url}/?screen=game&level=2`,{waitUntil:'domcontentloaded'});await revivePage.waitForFunction(()=>jadeGame.scene.getScene('Game')?.board?.tiles?.length===36);await revivePage.evaluate(()=>jadeGame.scene.getScene('Game').tweens.timeScale=10);await revivePage.waitForFunction(()=>jadeGame.scene.getScene('Game').board.tiles.every(tile=>tile.scaleX>.94&&tile.scaleY>.94&&tile.alpha>.94&&tile.icon.visible),{timeout:8000});
  const taps=[];
  for(let index=0;index<4;index++){
    await revivePage.waitForFunction(()=>{const s=jadeGame.scene.getScene('Game');return!s.tray.isBusy&&!s.board.locked;});
    const id=await revivePage.evaluate(()=>{const s=jadeGame.scene.getScene('Game'),held=new Set(s.tray.types);return s.board.selectableTiles.find(tile=>!held.has(tile.typeId))?.tileData.id||null;});
    if(!id)throw new Error(`No distinct selectable tile for loss step ${index+1}`);
    const point=await legalTilePoint(revivePage,id);await revivePage.mouse.click(point.x,point.y);taps.push(id);
    await revivePage.waitForFunction(expected=>jadeGame.scene.getScene('Game').tray.entries.length===expected||jadeGame.scene.getScene('Game').gameEnded,index+1);
  }
  await revivePage.waitForFunction(()=>jadeGame.scene.getScene('Game').gameEnded&&jadeGame.scene.getScene('Game').tray.entries.length===4);
  await revivePage.screenshot({path:path.join(out,'02-genuine-four-unmatched-loss-390x844.png')});
  const beforeRevive=await revivePage.evaluate(()=>{const s=jadeGame.scene.getScene('Game');return{active:s.board.activeTiles.length,tray:s.tray.entries.length,score:s.score,totalMatches:s.totalMatches,gems:s.save.gems};});
  const reviveButton=await worldPoint(revivePage,'Game',270,652);await revivePage.mouse.click(reviveButton.x,reviveButton.y);
  await revivePage.waitForFunction(()=>{const s=jadeGame.scene.getScene('Game');return!s.gameEnded&&s.tray.entries.length===0&&s.reviveUsed;},{timeout:5000});
  const afterRevive=await revivePage.evaluate(()=>{const s=jadeGame.scene.getScene('Game'),save=JSON.parse(localStorage.getItem('jade-garden-tiles-save-v5'));return{active:s.board.activeTiles.length,tray:s.tray.entries.length,visuals:s.tray.slots.length,score:s.score,totalMatches:s.totalMatches,gems:s.save.gems,checkpoint:save.activeAttempt?.status,reviveUsed:s.reviveUsed};});
  await revivePage.screenshot({path:path.join(out,'03-revive-empty-tray-restored-board-390x844.png')});
  const performance=await revivePage.evaluate(async()=>{const frames=[];let last=performance.now();await new Promise(resolve=>{let count=0;const tick=now=>{frames.push(now-last);last=now;if(++count>=90)resolve();else requestAnimationFrame(tick);};requestAnimationFrame(tick);});const sorted=frames.slice(5).sort((a,b)=>a-b);return{sampleFrames:sorted.length,averageMs:sorted.reduce((a,b)=>a+b,0)/sorted.length,p95Ms:sorted[Math.floor(sorted.length*.95)],maxMs:Math.max(...sorted)};});
  await revivePage.close();

  const checkpointPassed=beforeReload.active===afterReload.active&&JSON.stringify(beforeReload.tray)===JSON.stringify(afterReload.tray)&&beforeReload.selected===afterReload.selected&&beforeReload.undo===afterReload.undo&&beforeReload.checkpoint==='active';
  const report={generatedAt:new Date().toISOString(),rules:{matchSize:2,trayCapacity:4},checkpoint:{beforeReload,afterReload,passed:checkpointPassed},revive:{taps,beforeRevive,afterRevive,passed:beforeRevive.tray===4&&afterRevive.tray===0&&afterRevive.visuals===0&&afterRevive.active===beforeRevive.active+4&&afterRevive.score===beforeRevive.score&&afterRevive.totalMatches===beforeRevive.totalMatches&&afterRevive.gems===beforeRevive.gems-5},performance,errors};
  report.passed=report.checkpoint.passed&&report.revive.passed&&errors.length===0;
  await writeFile(path.join(out,'browser-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(!report.passed)process.exitCode=1;
}finally{await browser.close();command.kill();}
