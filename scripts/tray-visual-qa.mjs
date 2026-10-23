import { mkdir,writeFile } from 'node:fs/promises';
import path from 'node:path';
import { launchQaBrowser,legalTilePoint,startQaServer } from './qa-helpers.mjs';

const root=process.cwd(),out=path.join(root,'qa','final-acceptance');
await mkdir(out,{recursive:true});
const{command,url}=await startQaServer(root,4184),browser=await launchQaBrowser();
try{
  const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  await page.addInitScript(()=>localStorage.setItem('jade-garden-tiles-save-v2',JSON.stringify({version:5,tutorial:{completed:true,dismissed:false,completedAt:1}})));
  await page.goto(`${url}/?screen=game&level=1`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>{const board=jadeGame.scene.getScene('Game')?.board;return board?.tiles?.length===36&&board.tiles.every(tile=>tile.scaleX>.94&&tile.icon.visible);},{timeout:8000});
  const ids=await page.evaluate(()=>jadeGame.scene.getScene('Game').board.level.solution.slice(0,2));
  for(const id of ids.slice(0,1)){
    const point=await legalTilePoint(page,id);await page.mouse.click(point.x,point.y);await page.waitForFunction(tileId=>jadeGame.scene.getScene('Game').board.tiles.find(tile=>tile.tileData.id===tileId)?.isCollected,id);
    await page.waitForFunction(()=>!jadeGame.scene.getScene('Game').tray.isBusy);
  }
  const pending=await page.evaluate(()=>{const s=jadeGame.scene.getScene('Game'),tiles=s.tray.slots;return{entries:s.tray.entries.length,glow:tiles.every(tile=>tile.pendingGlow.alpha>=.6),tint:tiles.every(tile=>tile.body.tintTopLeft===0xffe7a3)};});
  await page.screenshot({path:path.join(out,'09-pending-pair-highlight-live.png')});
  const second=await legalTilePoint(page,ids[1]);await page.mouse.click(second.x,second.y);await page.waitForFunction(()=>jadeGame.scene.getScene('Game').totalMatches===1);await page.waitForTimeout(60);
  const clear=await page.evaluate(()=>{const s=jadeGame.scene.getScene('Game');return{entries:s.tray.entries.length,activeVisuals:s.tray.slots.length,combo:s.currentCombo,totalMatches:s.totalMatches};});
  await page.screenshot({path:path.join(out,'10-atomic-pair-clear-live.png')});
  const report={passed:pending.entries===1&&pending.glow&&pending.tint&&clear.entries===0&&clear.activeVisuals===0&&clear.combo===1&&clear.totalMatches===1,pending,clear,interaction:'genuine-pointer'};
  await writeFile(path.join(out,'tray-visual-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(!report.passed)process.exitCode=1;
  await page.close();
}finally{await browser.close();command.kill();}
