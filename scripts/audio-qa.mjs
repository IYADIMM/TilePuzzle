import { mkdir,writeFile } from 'node:fs/promises';
import path from 'node:path';
import { launchQaBrowser,legalPointerPlaythrough,legalTilePoint,startQaServer,tilePoint,worldPoint } from './qa-helpers.mjs';

const root=process.cwd(),out=path.join(root,'qa','audio'),port=4194;
await mkdir(out,{recursive:true});
const{command,url}=await startQaServer(root,port),browser=await launchQaBrowser(),errors=[],screens=[];

async function open(pathname='/',viewport={width:390,height:844}){
  const page=await browser.newPage({viewport,isMobile:viewport.width<700,hasTouch:true});
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  await page.goto(`${url}${pathname}`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>jadeGame.registry.get('audioManager'));
  return page;
}
async function clickWorld(page,scene,x,y){const point=await worldPoint(page,scene,x,y);await page.mouse.click(point.x,point.y);return point;}
async function played(page,event){return page.evaluate(event=>jadeGame.registry.get('audioManager').snapshot().events.filter(item=>item.event===event&&item.status==='played').length,event);}

try{
  for(const viewport of [{width:360,height:640},{width:390,height:844},{width:430,height:932},{width:768,height:1024}]){
    const page=await open('/',viewport);await page.waitForFunction(()=>jadeGame.scene.isActive('Menu'));await clickWorld(page,'Menu',53,53);await page.waitForFunction(()=>jadeGame.scene.isActive('AudioSettings'));await page.waitForTimeout(250);
    const file=path.join(out,`audio-settings-${viewport.width}x${viewport.height}.png`);await page.screenshot({path:file});screens.push(file);await page.close();
  }

  const page=await open('/');await page.waitForFunction(()=>jadeGame.scene.isActive('Menu'));
  const beforeGesture=await page.evaluate(()=>jadeGame.registry.get('audioManager').snapshot());
  await clickWorld(page,'Menu',53,53);await page.waitForFunction(()=>jadeGame.scene.isActive('AudioSettings'));await page.waitForTimeout(250);
  const afterGesture=await page.evaluate(()=>{const manager=jadeGame.registry.get('audioManager'),audio=document.createElement('audio');return{snapshot:manager.snapshot(),codecs:{ogg:audio.canPlayType('audio/ogg; codecs="vorbis"'),mp3:audio.canPlayType('audio/mpeg')},cached:['audio:tile-select','audio:level-complete','audio:tile-place-a','audio:tile-place-b','audio:tile-match','audio:music-menu','audio:music-gameplay'].every(key=>jadeGame.cache.audio.exists(key))};});

  await clickWorld(page,'AudioSettings',270,744);await page.waitForTimeout(180);
  const muted=await page.evaluate(()=>({saved:JSON.parse(localStorage.getItem('jade-garden-tiles-save-v5')).prefs.audio,snapshot:jadeGame.registry.get('audioManager').snapshot()}));
  await clickWorld(page,'AudioSettings',270,744);await page.waitForTimeout(180);
  const restored=await page.evaluate(()=>JSON.parse(localStorage.getItem('jade-garden-tiles-save-v5')).prefs.audio);
  await clickWorld(page,'AudioSettings',270,850);await page.waitForFunction(()=>!jadeGame.scene.isActive('AudioSettings'));
  await clickWorld(page,'Menu',270,559);await page.waitForFunction(()=>jadeGame.scene.isActive('Game'));await page.evaluate(()=>jadeGame.scene.getScene('Game').tweens.timeScale=12);await page.waitForTimeout(300);
  const ids=await page.evaluate(()=>jadeGame.scene.getScene('Game').board.level.solution.slice(0,7));
  for(const id of ids.slice(0,6)){await page.waitForFunction(()=>{const scene=jadeGame.scene.getScene('Game');return!scene.tray.isBusy&&!scene.board.locked;});const point=await legalTilePoint(page,id);await page.mouse.click(point.x,point.y);await page.waitForFunction(id=>jadeGame.scene.getScene('Game').board.tiles.find(tile=>tile.tileData.id===id).isCollected,id);await page.waitForFunction(()=>!jadeGame.scene.getScene('Game').tray.isBusy);}

  await clickWorld(page,'Game',104,867);await page.waitForTimeout(120);await clickWorld(page,'Game',270,867);await page.waitForTimeout(160);await clickWorld(page,'Game',436,867);await page.waitForTimeout(180);
  const blocked=await findBlockedPointer(page);await page.mouse.click(blocked.x,blocked.y);await page.waitForTimeout(180);
  const synced=await page.evaluate(()=>jadeGame.registry.get('audioManager').snapshot());
  const gameShot=path.join(out,'gameplay-audio-sync-390x844.png');await page.screenshot({path:gameShot});screens.push(gameShot);

  await page.evaluate(()=>jadeGame.registry.get('audioManager').setPreferences({musicEnabled:false,sfxEnabled:false},{persist:false}));
  const mutedBefore=await page.evaluate(()=>jadeGame.registry.get('audioManager').snapshot().events.length),mutedTarget=ids[6],mutedPoint=await legalTilePoint(page,mutedTarget);await page.mouse.click(mutedPoint.x,mutedPoint.y);await page.waitForFunction(id=>jadeGame.scene.getScene('Game').board.tiles.find(tile=>tile.tileData.id===id).isCollected,mutedTarget);await page.waitForTimeout(100);
  const mutedGameplay=await page.evaluate(before=>{const manager=jadeGame.registry.get('audioManager'),events=manager.snapshot().events.slice(before);return{accepted:jadeGame.scene.getScene('Game').selectedTileCount>0,played:events.filter(item=>item.status==='played').length,mutedSkips:events.filter(item=>item.reason==='muted').length};},mutedBefore);
  await page.close();

  const lossPage=await open('/?screen=game&level=1');await lossPage.waitForFunction(()=>jadeGame.scene.getScene('Game')?.board?.tiles?.length===36);await lossPage.evaluate(()=>jadeGame.scene.getScene('Game').tweens.timeScale=12);await lossPage.waitForTimeout(300);
  for(const id of ['L1-T21','L1-T22','L1-T3','L1-T13']){const point=await legalTilePoint(lossPage,id);await lossPage.mouse.click(point.x,point.y);await lossPage.waitForFunction(id=>jadeGame.scene.getScene('Game').board.tiles.find(tile=>tile.tileData.id===id).isCollected,id);await lossPage.waitForFunction(()=>!jadeGame.scene.getScene('Game').tray.isBusy);}
  await lossPage.waitForFunction(()=>jadeGame.scene.getScene('Game').gameEnded);const lossCount=await played(lossPage,'level_failed');await lossPage.close();

  const victoryPage=await open('/?screen=game&level=1');await victoryPage.waitForFunction(()=>jadeGame.scene.getScene('Game')?.board?.tiles?.length===36);const play=await legalPointerPlaythrough(victoryPage,{timeScale:1});await victoryPage.waitForFunction(()=>jadeGame.scene.isActive('Reward'),{timeout:8000});await victoryPage.waitForTimeout(3100);
  const victory=await victoryPage.evaluate(()=>{const snapshot=jadeGame.registry.get('audioManager').snapshot(),count=event=>snapshot.events.filter(item=>item.event===event&&item.status==='played').length;return{snapshot,counts:{tileSelect:count('tile_select'),tilePlaceA:count('tile_place_a'),tilePlaceB:count('tile_place_b'),tileMatch:count('tile_match'),combo:count('combo'),levelComplete:count('level_complete'),starEarned:count('star_earned')}};});
  await victoryPage.close();

  const counts=event=>synced.events.filter(item=>item.event===event&&item.status==='played').length;
  const report={
    environment:'headless Chromium browser emulation; no physical speaker or real-device claim',
    originals:{tileSelectSha256:'e12c4e4b761262ec278a65f6eec3ffb41b8c0d0517d1b0995c00121b6e8b573f',levelCompleteSha256:'a357be041b994207d85c52d8c194e6fd12ae6b5478e188d97cb1863bdfce0916'},
    unlock:{before:beforeGesture.contextState,after:afterGesture.snapshot.contextState,cached:afterGesture.cached,codecs:afterGesture.codecs},
    settings:{muted:muted.saved,restored},
    synchronized:{currentTrack:synced.currentTrack,tileSelect:counts('tile_select'),tilePlaceA:counts('tile_place_a'),tilePlaceB:counts('tile_place_b'),tileMatch:counts('tile_match'),combo:counts('combo'),tileBlocked:counts('tile_blocked'),booster:counts('booster'),shuffle:counts('shuffle'),undo:counts('undo')},
    mutedGameplay,lossCount,victory:{pointerEvents:play.events.length,...victory.counts},screens,errors
  };
  report.passed=afterGesture.cached&&Boolean(afterGesture.codecs.ogg)&&Boolean(afterGesture.codecs.mp3)&&muted.saved.musicEnabled===false&&muted.saved.sfxEnabled===false&&restored.musicEnabled&&restored.sfxEnabled&&report.synchronized.currentTrack==='gameplay'&&report.synchronized.tileSelect===6&&report.synchronized.tilePlaceA===5&&report.synchronized.tilePlaceB===1&&report.synchronized.tileMatch===1&&report.synchronized.combo===1&&report.synchronized.tileBlocked===1&&report.synchronized.booster===1&&report.synchronized.shuffle===1&&report.synchronized.undo===1&&mutedGameplay.accepted&&mutedGameplay.played===0&&mutedGameplay.mutedSkips>=1&&lossCount===1&&report.victory.pointerEvents===36&&report.victory.tileSelect===36&&report.victory.tilePlaceA===29&&report.victory.tilePlaceB===7&&report.victory.tileMatch===12&&report.victory.combo===11&&report.victory.levelComplete===1&&report.victory.starEarned===1&&errors.length===0;
  await writeFile(path.join(out,'audio-browser-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(!report.passed)process.exitCode=1;
}finally{await browser.close();command.kill();}

async function findBlockedPointer(page){
  const blocked=await page.evaluate(()=>jadeGame.scene.getScene('Game').board.tiles.filter(tile=>tile.isBlocked).map(tile=>tile.tileData.id)),offsets=[[-.42,-.35],[0,-.35],[.42,-.35],[-.42,0],[0,0],[.42,0],[-.42,.35],[0,.35],[.42,.35]];
  for(const id of blocked)for(const[offsetX,offsetY]of offsets){const point=await tilePoint(page,id,offsetX,offsetY);await page.mouse.move(point.x,point.y);const hits=await page.evaluate(()=>jadeGame.scene.getScene('Game').input.hitTestPointer(jadeGame.scene.getScene('Game').input.activePointer).filter(item=>item.tileData?.id));if(!hits.length)return point;}
  throw new Error('No uncovered blocked-tile pointer target found');
}
