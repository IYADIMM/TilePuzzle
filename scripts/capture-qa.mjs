import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root=process.cwd(),out=path.join(root,'qa','screenshots');await mkdir(out,{recursive:true});
const server=process.platform==='win32'
  ? spawn('C:\\Windows\\System32\\cmd.exe',['/d','/s','/c','npm run dev -- --port 4176'],{cwd:root,stdio:'ignore'})
  : spawn('npm',['run','dev','--','--port','4176'],{cwd:root,stdio:'ignore'});
await new Promise(r=>setTimeout(r,2500));
const browser=await chromium.launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true,args:['--no-sandbox']});
const results=[];
for(const [width,height] of [[360,640],[390,844],[430,932],[768,1024]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1,isMobile:true,hasTouch:true});const errors=[];
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4176/?screen=game&level=1',{waitUntil:'networkidle'});await page.waitForTimeout(2200);
  const file=path.join(out,`game-${width}x${height}.png`);await page.screenshot({path:file});
  results.push({width,height,file,canvas:await page.locator('canvas').count(),errors});await page.close();
}
for(const [name,url] of [['cars-level-2','?screen=game&level=2'],['collection-gallery','?screen=collection']]){
  const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:4176/${url}`,{waitUntil:'networkidle'});await page.waitForTimeout(2200);const file=path.join(out,`${name}-390x844.png`);await page.screenshot({path:file});results.push({name,width:390,height:844,file,canvas:await page.locator('canvas').count(),errors});await page.close();
}
await browser.close();server.kill();await writeFile(path.join(root,'qa','capture-report.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
