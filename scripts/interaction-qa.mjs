import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import { mkdir,writeFile } from 'node:fs/promises';
import path from 'node:path';

const root=process.cwd(),out=path.join(root,'qa','final-acceptance');await mkdir(out,{recursive:true});
const server=process.platform==='win32'?spawn('C:\\Windows\\System32\\cmd.exe',['/d','/s','/c','npm run dev -- --port 4181'],{cwd:root,stdio:'ignore'}):spawn('npm',['run','dev','--','--port','4181'],{cwd:root,stdio:'ignore'});
await new Promise(resolve=>setTimeout(resolve,2500));
const browser=await chromium.launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true,args:['--no-sandbox']});
const checks=[];

async function fresh(){const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});await page.goto('http://127.0.0.1:4181/?screen=game&level=1&debugGrid=1',{waitUntil:'networkidle'});await page.waitForFunction(()=>jadeGame.scene.getScene('Game')?.board?.tiles?.length>0);await page.waitForTimeout(900);return page;}

for(const vertical of ['top','middle','bottom']){
  const page=await fresh();
  const target=await page.evaluate(vertical=>{const scene=jadeGame.scene.getScene('Game'),selectable=scene.board.selectableTiles.sort((a,b)=>a.y-b.y),tile=vertical==='top'?selectable[0]:vertical==='bottom'?selectable.at(-1):selectable[Math.floor(selectable.length/2)],camera=scene.cameras.main,canvas=scene.game.canvas,rect=canvas.getBoundingClientRect(),screenX=(tile.x-camera.worldView.x)*camera.zoom,screenY=(tile.y-camera.worldView.y)*camera.zoom;return{id:tile.tileData.id,x:rect.left+screenX*(rect.width/canvas.width),y:rect.top+screenY*(rect.height/canvas.height)};},vertical);
  await page.mouse.click(target.x,target.y);await page.waitForTimeout(90);
  const accepted=await page.evaluate(id=>jadeGame.scene.getScene('Game').board.tiles.find(tile=>tile.tileData.id===id).isCollected,target.id);
  checks.push({kind:`pointer-${vertical}`,id:target.id,accepted});await page.close();
}

const debugPage=await fresh();
let debugLevel=1;
for(let level=1;level<=30;level++){
  if(level>1){await debugPage.goto(`http://127.0.0.1:4181/?screen=game&level=${level}&debugGrid=1`,{waitUntil:'networkidle'});await debugPage.waitForFunction(()=>jadeGame.scene.getScene('Game')?.board?.tiles?.length>0);await debugPage.waitForTimeout(280);}
  const hasSandwich=await debugPage.evaluate(()=>jadeGame.scene.getScene('Game').board.tiles.some(tile=>tile.tileData.blockReason==='left+right-blocked'));
  if(hasSandwich){debugLevel=level;break;}
}
const logic=await debugPage.evaluate(()=>{const s=jadeGame.scene.getScene('Game'),states=s.board.tiles.filter(tile=>!tile.isCollected).map(tile=>({id:tile.tileData.id,y:tile.y,reason:tile.tileData.blockReason,blocked:tile.isBlocked,leftFree:tile.tileData.access.leftFree,rightFree:tile.tileData.access.rightFree,top:tile.tileData.access.top.length})),sample=s.board.selectableTiles[0],w=sample.geometry.tileW,h=sample.geometry.tileH,points=[[-.48,-.48],[0,-.48],[.48,-.48],[-.48,0],[0,0],[.48,0],[-.48,.48],[0,.48],[.48,.48]].map(([x,y])=>sample.input.hitArea.contains(x*w,y*h));return{topBlocked:states.some(v=>v.reason==='top-blocked'),sandwichBlocked:states.some(v=>v.reason==='left+right-blocked'),oneSideFree:states.some(v=>!v.blocked&&(v.leftFree||v.rightFree)),nineFacePoints:points,lowerSelectable:states.some(v=>!v.blocked&&v.y>480),states};});
await debugPage.screenshot({path:path.join(out,'15-debug-grid-blocker-logic.png')});await debugPage.close();
checks.push({kind:'shared-blocker-logic',debugLevel,...logic,states:undefined});
const passed=checks.every(check=>check.kind.startsWith('pointer-')?check.accepted:check.topBlocked&&check.sandwichBlocked&&check.oneSideFree&&check.nineFacePoints.every(Boolean));
const report={passed,checks};await writeFile(path.join(out,'interaction-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
await browser.close();server.kill();if(!passed)process.exitCode=1;
