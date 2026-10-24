import { chromium } from 'playwright-core';
import { mkdir,writeFile } from 'node:fs/promises';
import path from 'node:path';

const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROME_PATH||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true,args:['--no-sandbox']});
try{
  const page=await browser.newPage();
  const dataUrl=await page.evaluate(()=>{
    const width=540,height=960,canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d');
    const radial=ctx.createRadialGradient(width*.5,height*.42,20,width*.5,height*.48,width*.72);radial.addColorStop(0,'#155746');radial.addColorStop(.48,'#0d4438');radial.addColorStop(.82,'#082f28');radial.addColorStop(1,'#031b18');ctx.fillStyle=radial;ctx.fillRect(0,0,width,height);
    const pixels=ctx.getImageData(0,0,width,height),data=pixels.data;let seed=0x4a414445;
    for(let y=0;y<height;y++)for(let x=0;x<width;x++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const noise=((seed>>>24)-128)*.055,index=(y*width+x)*4;data[index]=Math.max(0,Math.min(255,data[index]+noise));data[index+1]=Math.max(0,Math.min(255,data[index+1]+noise));data[index+2]=Math.max(0,Math.min(255,data[index+2]+noise*.7));}
    ctx.putImageData(pixels,0,0);ctx.globalAlpha=.055;ctx.strokeStyle='#d5efe2';ctx.lineWidth=.35;
    for(let i=0;i<430;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const x=seed%width;seed=(Math.imul(seed,1664525)+1013904223)>>>0;const y=seed%height;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+3+(seed%6),y+1);ctx.stroke();}
    return canvas.toDataURL('image/webp',.92);
  });
  const output=path.join(process.cwd(),'public','assets','premium','premium-felt.webp');await mkdir(path.dirname(output),{recursive:true});await writeFile(output,Buffer.from(dataUrl.split(',')[1],'base64'));console.log(output);
}finally{await browser.close();}
