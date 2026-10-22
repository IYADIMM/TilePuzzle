import { mkdir,writeFile } from 'node:fs/promises';
import path from 'node:path';
import { launchQaBrowser,legalTilePoint,startQaServer } from './qa-helpers.mjs';

const root=process.cwd(),out=path.join(root,'qa','final-acceptance');
await mkdir(out,{recursive:true});
const{command,url}=await startQaServer(root,4184),browser=await launchQaBrowser();
try{
  const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  await page.goto(`${url}/?screen=game&level=1`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>jadeGame.scene.getScene('Game')?.board?.tiles?.length===36);
  const ids=await page.evaluate(()=>jadeGame.scene.getScene('Game').board.level.solution.slice(0,3));
  for(const id of ids.slice(0,2)){
    const point=await legalTilePoint(page,id);await page.mouse.click(point.x,point.y);
    await page.waitForFunction(()=>!jadeGame.scene.getScene('Game').tray.isBusy);
  }
  const pair=await page.evaluate(()=>{const s=jadeGame.scene.getScene('Game'),tiles=s.tray.slots;return{entries:s.tray.entries.length,sameType:new Set(s.tray.types).size===1,glow:tiles.every(tile=>tile.pendingGlow.alpha>=.6),tint:tiles.every(tile=>tile.body.tintTopLeft===0xffe7a3)};});
  await page.screenshot({path:path.join(out,'09-pending-pair-highlight-live.png')});
  const third=await legalTilePoint(page,ids[2]);await page.mouse.click(third.x,third.y);await page.waitForTimeout(90);
  const clear=await page.evaluate(()=>{const s=jadeGame.scene.getScene('Game');return{entries:s.tray.entries.length,activeVisuals:s.tray.slots.length,combo:s.currentCombo,totalTriples:s.totalTriples};});
  await page.screenshot({path:path.join(out,'10-atomic-third-clear-live.png')});
  const report={passed:pair.entries===2&&pair.sameType&&pair.glow&&pair.tint&&clear.entries===0&&clear.activeVisuals===0&&clear.combo===1&&clear.totalTriples===1,pair,clear,interaction:'genuine-pointer'};
  await writeFile(path.join(out,'tray-visual-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(!report.passed)process.exitCode=1;
  await page.close();
}finally{await browser.close();command.kill();}
