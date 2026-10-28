import { mkdir,writeFile } from 'node:fs/promises';
import path from 'node:path';
import { launchQaBrowser,startQaServer } from './qa-helpers.mjs';

const root=process.cwd(),out=path.join(root,'qa','leaderboard'),port=4193;
await mkdir(out,{recursive:true});
const{command,url}=await startQaServer(root,port),browser=await launchQaBrowser(),errors=[],screens=[];
async function retryIo(work){for(let attempt=0;attempt<6;attempt++){try{return await work();}catch(error){if(attempt===5)throw error;await new Promise(resolve=>setTimeout(resolve,250*(attempt+1)));}}}
try{
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  page.on('pageerror',error=>errors.push(error.message));
  await page.addInitScript(()=>localStorage.setItem('jade-garden-tiles-save-v2',JSON.stringify({
    version:5,maxUnlockedLevel:4,lastLevel:3,coins:250,gems:0,xp:300,stars:7,bestCombo:3,
    completedLevels:{1:{score:2100,stars:3,bestTime:42},2:{score:1650,stars:2,bestTime:58},3:{score:1300,stars:2,bestTime:65}},
    claimedRewards:{},queuedChestRewards:[],achievements:{},unlockedThemes:['fruits','cars','sports'],boosters:{undo:3,hint:3,shuffle:3},
    prefs:{audio:{musicEnabled:true,sfxEnabled:true,musicVolume:.18,sfxVolume:.42},haptics:false,reducedMotion:false}
  })));
  await page.goto(`${url}/?screen=leaderboard`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>jadeGame.scene.isActive('Leaderboard')&&jadeGame.scene.getScene('Leaderboard')?.boardLayer);
  const local=await page.evaluate(()=>{
    const scene=jadeGame.scene.getScene('Leaderboard'),texts=scene.children.list.flatMap(function walk(node){return [node,...(node.list||[]).flatMap(walk)];}).filter(node=>typeof node.text==='string').map(node=>node.text);
    return{mode:scene.boardLayer.getData('records-mode'),texts,localPoints:scene.manager.summary().allTime,recordCount:Object.keys(scene.save.completedLevels).length};
  });
  const shot=path.join(out,'local-records-390x844.png');await retryIo(()=>page.screenshot({path:shot}));screens.push(shot);
  await page.setViewportSize({width:430,height:932});await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>jadeGame.scene.isActive('Leaderboard'));
  const large=path.join(out,'local-records-430x932.png');await retryIo(()=>page.screenshot({path:large}));screens.push(large);
  const joined=local.texts.join(' '),report={scope:'truthful-device-local-records-only',local,screens,errors,passed:local.mode==='device-local'&&local.recordCount===3&&joined.includes('NOT AN ONLINE RANK')&&joined.includes('BEST LEVEL RESULTS')&&!joined.includes('WEEKLY')&&!joined.includes('FRIENDS')&&!joined.includes('YOU  #')&&errors.length===0};
  await retryIo(()=>writeFile(path.join(root,'qa','leaderboard-report.json'),JSON.stringify(report,null,2)));console.log(JSON.stringify(report,null,2));if(!report.passed)process.exitCode=1;
}finally{await browser.close();command.kill();}
