import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import { mkdir,writeFile } from 'node:fs/promises';
import path from 'node:path';

const root=process.cwd(),out=path.join(root,'qa','final-acceptance');await mkdir(out,{recursive:true});
const server=process.platform==='win32'?spawn('C:\\Windows\\System32\\cmd.exe',['/d','/s','/c','npm run dev -- --port 4183'],{cwd:root,stdio:'ignore'}):spawn('npm',['run','dev','--','--port','4183'],{cwd:root,stdio:'ignore'});
await new Promise(resolve=>setTimeout(resolve,2400));
const browser=await chromium.launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.goto('http://127.0.0.1:4183/?screen=game&level=1',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>jadeGame.scene.getScene('Game')?.board?.tiles?.length===36);await page.evaluate(()=>{jadeGame.scene.getScene('Game').tweens.timeScale=12;});
const ids=await page.evaluate(()=>jadeGame.scene.getScene('Game').board.level.solution);let accepted=0;
for(const id of ids){const ok=await page.evaluate(tileId=>{const scene=jadeGame.scene.getScene('Game'),tile=scene.board.tiles.find(item=>item.tileData.id===tileId);return scene.board.requestSelection(tile);},id);if(ok)accepted++;else break;await page.waitForFunction(()=>{const scene=jadeGame.scene.getScene('Game');return !scene.scene.isActive()||!scene.tray.isBusy;},{timeout:2400});}
await page.waitForFunction(()=>jadeGame.scene.isActive('Reward'),{timeout:5000});await page.waitForTimeout(1100);
const state=await page.evaluate(()=>({activeScenes:jadeGame.scene.getScenes(true).map(scene=>scene.scene.key),rewardTitle:jadeGame.scene.getScene('Reward').children.list.find(child=>child.text==='PERFECT CLEAR')?.text,gameActive:jadeGame.scene.isActive('Game')}));
const screenshot=path.join(out,'11-genuine-level-completion-reward.png');await page.screenshot({path:screenshot});const report={passed:accepted===ids.length&&state.activeScenes.includes('Reward')&&!state.gameActive&&errors.length===0,accepted,total:ids.length,state,errors,screenshot};await writeFile(path.join(out,'victory-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser.close();server.kill();if(!report.passed)process.exitCode=1;
