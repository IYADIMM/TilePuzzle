import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {launchQaBrowser,legalTilePoint,startQaServer,worldPoint} from './qa-helpers.mjs';

const root=process.cwd(),out=path.join(root,'qa','performance-soak'),minutes=Math.max(.1,Number(process.argv[2]||process.env.SOAK_MINUTES)||15),durationMs=minutes*60_000;
await mkdir(out,{recursive:true});
const{command,url}=await startQaServer(root,53210),browser=await launchQaBrowser(),page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
const errors=[],frameTimes=[],inputLatencyMs=[],sceneReadyMs=[],heapSamples=[],textureCounts=[],displayCounts=[];
page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('favicon'))errors.push(message.text());});
await page.addInitScript(()=>{if(!localStorage.getItem('jade-soak-initialized')){localStorage.clear();localStorage.setItem('jade-soak-initialized','1');}});
let completedLevels=0,pointerEvents=0,level=1,startedAt=0,deadline=0;

async function beginSampling(started=Date.now()){
  await page.waitForFunction(()=>{const scene=window.jadeGame?.scene?.getScene('Game');return scene?.scene?.isActive()&&scene?.board?.tiles?.length>0&&scene?.tray;},{timeout:12000});
  await page.evaluate(()=>{const scene=jadeGame.scene.getScene('Game');scene.tweens.timeScale=12;window.__soakFrames=[];let previous=performance.now();const sample=now=>{if(!jadeGame?.scene?.isActive('Game'))return;window.__soakFrames.push(now-previous);previous=now;requestAnimationFrame(sample);};requestAnimationFrame(sample);});
  await page.waitForFunction(()=>window.jadeGame?.scene?.getScene('Game')?.board?.tiles?.every(tile=>tile.scaleX>.94&&tile.scaleY>.94&&tile.alpha>.94&&tile.icon.visible),{timeout:8000});
  sceneReadyMs.push(Date.now()-started);
}

async function openInitialLevel(){const started=Date.now();await page.goto(`${url}/?screen=game&level=1`,{waitUntil:'domcontentloaded'});await beginSampling(started);}

async function advanceLevel(){
  const started=Date.now();
  if(level<30){const point=await worldPoint(page,'Reward',270,711);await page.mouse.click(point.x,point.y);level++;}
  else{await page.evaluate(()=>jadeGame.scene.getScene('Reward').scene.start('Game',{level:1,newAttempt:true}));level=1;}
  await beginSampling(started);
}

async function playCurrentLevel(){
  const ids=await page.evaluate(()=>[...jadeGame.scene.getScene('Game').board.level.solution]);
  for(const id of ids){
    if(Date.now()>=deadline)return false;
    await page.waitForFunction(()=>{const scene=window.jadeGame?.scene?.getScene('Game');return scene?.scene?.isActive()&&scene?.tray&&scene?.board&&!scene.tray.isBusy&&!scene.board.locked;},{timeout:6000});
    const point=await legalTilePoint(page,id),started=performance.now();await page.mouse.click(point.x,point.y);
    await page.waitForFunction(tileId=>{const scene=window.jadeGame?.scene?.getScene('Game'),tile=scene?.board?.tiles?.find(item=>item.tileData.id===tileId);return!scene?.scene?.isActive()||tile?.isCollected;},id,{timeout:6000});
    inputLatencyMs.push(performance.now()-started);pointerEvents++;
  }
  await page.waitForFunction(()=>window.jadeGame?.scene?.isActive('Reward'),{timeout:10000});await page.waitForTimeout(180);completedLevels++;
  return true;
}

function percentile(values,ratio){if(!values.length)return 0;const sorted=[...values].sort((a,b)=>a-b);return sorted[Math.min(sorted.length-1,Math.floor(sorted.length*ratio))];}

try{
  await openInitialLevel();startedAt=Date.now();deadline=startedAt+durationMs;
  while(Date.now()<deadline){
    const complete=await playCurrentLevel();
    const sample=await page.evaluate(()=>{const scene=jadeGame.scene.getScene('Reward')||jadeGame.scene.getScene('Game'),memory=performance.memory?.usedJSHeapSize||null;return{frames:window.__soakFrames||[],heap:memory,textures:scene?.textures?.getTextureKeys().length||0,display:scene?.children?.list?.length||0};});
    frameTimes.push(...sample.frames.slice(5));if(sample.heap)heapSamples.push(sample.heap);textureCounts.push(sample.textures);displayCounts.push(sample.display);
    if(!complete||Date.now()>=deadline)break;await advanceLevel();
  }
  const report={generatedAt:new Date().toISOString(),environment:'desktop-headless-chromium-mobile-viewport',requestedMinutes:minutes,actualMinutes:Number(((Date.now()-startedAt)/60000).toFixed(2)),completedLevels,pointerEvents,framePacing:{samples:frameTimes.length,medianMs:Number(percentile(frameTimes,.5).toFixed(2)),p95Ms:Number(percentile(frameTimes,.95).toFixed(2)),p99Ms:Number(percentile(frameTimes,.99).toFixed(2)),maxMs:Number(Math.max(0,...frameTimes).toFixed(2)),longFramesOver50ms:frameTimes.filter(value=>value>50).length},inputAcknowledgement:{samples:inputLatencyMs.length,medianMs:Number(percentile(inputLatencyMs,.5).toFixed(2)),p95Ms:Number(percentile(inputLatencyMs,.95).toFixed(2)),p99Ms:Number(percentile(inputLatencyMs,.99).toFixed(2)),maxMs:Number(Math.max(0,...inputLatencyMs).toFixed(2))},sceneReady:{samples:sceneReadyMs.length,medianMs:Number(percentile(sceneReadyMs,.5).toFixed(2)),p95Ms:Number(percentile(sceneReadyMs,.95).toFixed(2)),maxMs:Math.max(0,...sceneReadyMs)},heap:{available:heapSamples.length>0,startBytes:heapSamples[0]||null,endBytes:heapSamples.at(-1)||null,peakBytes:heapSamples.length?Math.max(...heapSamples):null},textureCount:{min:Math.min(...textureCounts),max:Math.max(...textureCounts)},displayObjects:{min:Math.min(...displayCounts),max:Math.max(...displayCounts)},errors,physicalAndroidValidated:false};
  report.passed=completedLevels>0&&pointerEvents>0&&errors.length===0&&report.framePacing.p99Ms<100;
  await writeFile(path.join(out,'browser-soak-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(!report.passed)process.exitCode=1;
}finally{await browser.close();command.kill();}
