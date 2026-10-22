import { mkdir,writeFile } from 'node:fs/promises';
import path from 'node:path';
import { launchQaBrowser,startQaServer,tilePoint,legalTilePoint } from './qa-helpers.mjs';

const root=process.cwd(),out=path.join(root,'qa','audit-remediation'),port=4192;
await mkdir(out,{recursive:true});
const{command,url}=await startQaServer(root,port),browser=await launchQaBrowser(),checks=[],errors=[];

async function open(viewport={width:390,height:844},level=1){
  const page=await browser.newPage({viewport,isMobile:viewport.width<700,hasTouch:true});
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`${url}/?screen=game&level=${level}&debugGrid=1`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>jadeGame.scene.getScene('Game')?.board?.tiles?.length>0);
  await page.evaluate(()=>jadeGame.scene.getScene('Game').tweens.timeScale=12);
  await page.waitForTimeout(300);
  return page;
}

async function tileHits(page,point){
  await page.mouse.move(point.x,point.y);
  return page.evaluate(()=>jadeGame.scene.getScene('Game').input.hitTestPointer(jadeGame.scene.getScene('Game').input.activePointer).filter(item=>item.tileData?.id).map(item=>({id:item.tileData.id,depth:item.depth})).sort((a,b)=>b.depth-a.depth));
}

try{
  const offsets=[[-.32,-.32],[0,-.32],[.32,-.32],[-.32,0],[0,0],[.32,0],[-.32,.32],[0,.32],[.32,.32]];
  for(const[offsetX,offsetY]of offsets){
    const page=await open(),id=await page.evaluate(()=>jadeGame.scene.getScene('Game').board.level.solution[0]),point=await tilePoint(page,id,offsetX,offsetY),hits=await tileHits(page,point),visiblyTargeted=hits[0]?.id===id;
    let accepted=null;
    if(visiblyTargeted){await page.mouse.click(point.x,point.y);await page.waitForTimeout(100);accepted=await page.evaluate(id=>jadeGame.scene.getScene('Game').board.tiles.find(tile=>tile.tileData.id===id).isCollected,id);}
    checks.push({kind:'face-sample',id,offsetX,offsetY,visiblyTargeted,occludedBy:visiblyTargeted?null:hits[0]?.id??'outside-visible-input',accepted});
    await page.close();
  }

  for(const viewport of [{width:360,height:640},{width:390,height:844},{width:430,height:932},{width:768,height:1024}]){
    const page=await open(viewport),id=await page.evaluate(()=>jadeGame.scene.getScene('Game').board.selectableTiles.sort((a,b)=>b.y-a.y)[0].tileData.id),point=await legalTilePoint(page,id);
    await page.mouse.click(point.x,point.y);await page.waitForTimeout(100);
    const accepted=await page.evaluate(id=>jadeGame.scene.getScene('Game').board.tiles.find(tile=>tile.tileData.id===id).isCollected,id),screenshot=path.join(out,`pointer-${viewport.width}x${viewport.height}.png`);
    await page.screenshot({path:screenshot});checks.push({kind:'responsive-pointer',viewport,id,accepted,screenshot});await page.close();
  }

  let blockedEvidence=null;
  const blockedOffsets=[[-.42,-.35],[0,-.35],[.42,-.35],[-.42,0],[0,0],[.42,0],[-.42,.35],[0,.35],[.42,.35]];
  for(let level=1;level<=30&&!blockedEvidence;level++){
    const page=await open({width:390,height:844},level),blockedTiles=await page.evaluate(()=>jadeGame.scene.getScene('Game').board.tiles.filter(item=>item.isBlocked).map(item=>({id:item.tileData.id,reason:item.tileData.blockReason})));
    for(const blocked of blockedTiles){
      for(const[offsetX,offsetY]of blockedOffsets){
        const point=await tilePoint(page,blocked.id,offsetX,offsetY),hits=await tileHits(page,point);
        if(hits.length)continue;
        const before=await page.evaluate(()=>jadeGame.scene.getScene('Game').selectedTileCount);
        await page.mouse.click(point.x,point.y);await page.waitForTimeout(100);
        const rejected=await page.evaluate(({id,before})=>{const scene=jadeGame.scene.getScene('Game'),tile=scene.board.tiles.find(item=>item.tileData.id===id);return!tile.isCollected&&scene.selectedTileCount===before;},{id:blocked.id,before});
        const screenshot=path.join(out,'blocked-pointer-debug-390x844.png');await page.screenshot({path:screenshot});blockedEvidence={kind:'blocked-pointer',level,...blocked,offsetX,offsetY,rejected,screenshot};break;
      }
      if(blockedEvidence)break;
    }
    await page.close();
  }
  if(blockedEvidence)checks.push(blockedEvidence);

  const faceSamples=checks.filter(check=>check.kind==='face-sample'),visibleSamples=faceSamples.filter(check=>check.visiblyTargeted);
  const passed=visibleSamples.length>=4&&visibleSamples.every(check=>check.accepted)&&checks.filter(check=>check.kind==='responsive-pointer').every(check=>check.accepted)&&Boolean(blockedEvidence?.rejected)&&errors.length===0;
  const report={passed,summary:{sampledFacePoints:faceSamples.length,verifiedVisiblePoints:visibleSamples.length,occludedPoints:faceSamples.length-visibleSamples.length,responsiveSizes:4,blockedPointerEvidence:Boolean(blockedEvidence)},checks,errors};
  await writeFile(path.join(root,'qa','final-acceptance','interaction-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(!passed)process.exitCode=1;
}finally{await browser.close();command.kill();}
