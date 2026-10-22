import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import { mkdir,writeFile } from 'node:fs/promises';
import path from 'node:path';

const root=process.cwd(),out=path.join(root,'qa','leaderboard');await mkdir(out,{recursive:true});
const server=process.platform==='win32'?spawn('C:\\Windows\\System32\\cmd.exe',['/d','/s','/c','npm run dev -- --port 4183'],{cwd:root,stdio:'ignore'}):spawn('npm',['run','dev','--','--port','4183'],{cwd:root,stdio:'ignore'});
await new Promise(r=>setTimeout(r,2400));
const browser=await chromium.launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true,args:['--no-sandbox']});
const errors=[],screens=[];
try{
  const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4183/?screen=leaderboard',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.jadeGame?.scene?.isActive('Leaderboard')&&window.jadeGame?.scene?.getScene('Leaderboard')?.boardLayer,{timeout:8000});
  const initial=await page.evaluate(()=>{const s=jadeGame.scene.getScene('Leaderboard');return{mode:s.mode,rows:s.boardLayer.getData('rows'),rank:s.boardLayer.getData('player-rank'),tabs:s.tabs.length};});
  const firstShot=path.join(out,'weekly-390x844.png');await page.screenshot({path:firstShot});screens.push(firstShot);
  await page.evaluate(()=>jadeGame.scene.getScene('Leaderboard').tabs.find(t=>t.getData('mode')==='friends').emit('pointerup'));
  await page.waitForTimeout(180);const friends=await page.evaluate(()=>{const s=jadeGame.scene.getScene('Leaderboard');return{mode:s.mode,rows:s.boardLayer.getData('rows'),rank:s.boardLayer.getData('player-rank')};});
  const friendShot=path.join(out,'friends-390x844.png');await page.screenshot({path:friendShot});screens.push(friendShot);
  await page.evaluate(()=>jadeGame.scene.start('Game',{level:1}));await page.waitForFunction(()=>jadeGame.scene.getScene('Game')?.board?.tiles?.length>0,{timeout:8000});
  const completion=await page.evaluate(()=>{const s=jadeGame.scene.getScene('Game');s.board.tiles.forEach(tile=>{tile.isCollected=true;tile.tileData.alive=false;tile.setVisible(false);});return s.win();});
  await page.waitForFunction(()=>jadeGame.scene.isActive('Reward'),{timeout:4000});const reward=await page.evaluate(()=>jadeGame.scene.getScene('Reward').dataIn.reward.leaderboard);
  await page.evaluate(()=>jadeGame.scene.getScene('Reward').scene.start('Leaderboard'));await page.waitForFunction(()=>jadeGame.scene.isActive('Leaderboard')&&jadeGame.scene.getScene('Leaderboard')?.boardLayer,{timeout:5000});
  const ranked=await page.evaluate(()=>{const s=jadeGame.scene.getScene('Leaderboard');return{rank:s.boardLayer.getData('player-rank'),rows:s.boardLayer.getData('rows')};});
  const rankedShot=path.join(out,'weekly-after-clear-390x844.png');await page.screenshot({path:rankedShot});screens.push(rankedShot);
  await page.setViewportSize({width:430,height:932});await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.jadeGame?.scene?.isActive('Leaderboard')&&window.jadeGame?.scene?.getScene('Leaderboard')?.boardLayer,{timeout:8000});const largeShot=path.join(out,'weekly-430x932.png');await page.screenshot({path:largeShot});screens.push(largeShot);
  const report={initial:{mode:initial.mode,rank:initial.rank,rowCount:initial.rows.length,tabs:initial.tabs,sorted:initial.rows.every((r,i)=>i===0||initial.rows[i-1].points>=r.points),playerPresent:initial.rows.some(r=>r.isPlayer)},friends:{mode:friends.mode,rank:friends.rank,rowCount:friends.rows.length,playerPresent:friends.rows.some(r=>r.isPlayer)},completion,reward:{earned:reward.earned,rankBefore:reward.rankBefore,rankAfter:reward.rankAfter},ranked:{rank:ranked.rank,points:ranked.rows.find(r=>r.isPlayer)?.points},errors,screens,passed:initial.mode==='weekly'&&initial.tabs===3&&initial.rows.length>=10&&initial.rows.every((r,i)=>i===0||initial.rows[i-1].points>=r.points)&&initial.rows.some(r=>r.isPlayer)&&friends.mode==='friends'&&friends.rows.length<initial.rows.length&&friends.rows.some(r=>r.isPlayer)&&completion===true&&reward.earned>0&&reward.rankAfter<reward.rankBefore&&ranked.rank===reward.rankAfter&&ranked.rows.find(r=>r.isPlayer)?.points>0&&errors.length===0};
  await writeFile(path.join(root,'qa','leaderboard-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(!report.passed)process.exitCode=1;
} finally {await browser.close();server.kill();}
