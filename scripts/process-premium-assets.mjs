import { chromium } from 'playwright-core';
import { readFile,writeFile,mkdir } from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const root=process.cwd(),source=path.join(root,'assets','premium','source'),runtime=path.join(root,'public','assets','premium');
await mkdir(runtime,{recursive:true});
const jobs=[
  {name:'tile-body',master:'tile-body-master-v2.png',cell:[0,0,1,1],size:[512,640],padding:.025},
  ...['mahogany','naturalWood','chrome','brushedSteel','clearGlass','frostedGlass','ceramic','leather','fabric','fur','stone','decorativeMetal'].map(id=>({name:`tile-material-${id}`,master:`materials/tile-${id}.png`,cell:[0,0,1,1],size:[512,640],padding:.025})),
  ...['cherries','orange','strawberry','pineapple','watermelon','grapes'].map(id=>({name:`fruit-${id}`,master:`icons/fruit-${id}.png`,cell:[0,0,1,1],size:[512,512],padding:.045})),
  ...['sports','sedan','suv','race','taxi','convertible'].map(id=>({name:`car-${id}`,master:`icons/car-${id}.png`,cell:[0,0,1,1],size:[512,512],padding:.025})),
  ...['soccer','basketball','tennis','baseball','football','trophy'].map(id=>({name:`sports-${id}`,master:`icons/sports-${id}.png`,cell:[0,0,1,1],size:[512,512],padding:.035})),
  ...['gear','spark-plug','tire','piston','steering-wheel','brake-disc'].map(id=>({name:`auto-${id}`,master:`icons/auto-${id}.png`,cell:[0,0,1,1],size:[512,512],padding:.035})),
  ...['lion','elephant','zebra','giraffe','tiger','panda'].map(id=>({name:`wild-${id}`,master:`icons/wild-${id}.png`,cell:[0,0,1,1],size:[512,512],padding:.035})),
  ...['puppy','kitten','rabbit','hamster','parrot','goldfish'].map(id=>({name:`pet-${id}`,master:`icons/pet-${id}.png`,cell:[0,0,1,1],size:[512,512],padding:.035})),
  ...['cupcake','donut','ice-cream','macaron','cake','cookie'].map(id=>({name:`dessert-${id}`,master:`icons/dessert-${id}.png`,cell:[0,0,1,1],size:[512,512],padding:.035})),
  ...['blossom','sunflower','tulip','rose','daisy','lavender'].map(id=>({name:`flower-${id}`,master:`icons/flower-${id}.png`,cell:[0,0,1,1],size:[512,512],padding:.035})),
  ...['dolphin','turtle','seahorse','starfish','octopus','tropical-fish'].map(id=>({name:`ocean-${id}`,master:`icons/ocean-${id}.png`,cell:[0,0,1,1],size:[512,512],padding:.035})),
  ...['guitar','piano','drum','saxophone','headphones','microphone'].map(id=>({name:`music-${id}`,master:`icons/music-${id}.png`,cell:[0,0,1,1],size:[512,512],padding:.035})),
  ...['airplane','suitcase','camera','compass','passport','globe'].map(id=>({name:`travel-${id}`,master:`icons/travel-${id}.png`,cell:[0,0,1,1],size:[512,512],padding:.035})),
  ...['rocket','planet','moon','astronaut','comet','satellite'].map(id=>({name:`space-${id}`,master:`icons/space-${id}.png`,cell:[0,0,1,1],size:[512,512],padding:.035})),
  {name:'tray-four-slot',master:'tray-master-v2.png',cell:[0,0,1,1],size:[1024,400],padding:.02,fit:'stretch'},
  {name:'button-mahogany',master:'button-master.png',cell:[0,0,1,1],size:[768,256],padding:.025}
];
const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROME_PATH||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true,args:['--no-sandbox']});
const page=await browser.newPage();
const manifest=[];
for(const job of jobs){
  const input=await readFile(path.join(source,job.master));
  const data=await page.evaluate(async({uri,cell,size,padding,fit})=>{
    const image=new Image();image.src=uri;await image.decode();
    const sx=Math.round(cell[0]*image.width),sy=Math.round(cell[1]*image.height),sw=Math.round(cell[2]*image.width),sh=Math.round(cell[3]*image.height);
    const scan=document.createElement('canvas');scan.width=sw;scan.height=sh;const scanCtx=scan.getContext('2d',{willReadFrequently:true});scanCtx.drawImage(image,sx,sy,sw,sh,0,0,sw,sh);
    const pixels=scanCtx.getImageData(0,0,sw,sh).data;let left=sw,top=sh,right=0,bottom=0;
    for(let y=0;y<sh;y++)for(let x=0;x<sw;x++){if(pixels[(y*sw+x)*4+3]>10){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}}
    if(right<=left||bottom<=top)throw new Error('Transparent asset has no visible pixels');
    const bw=right-left+1,bh=bottom-top+1,out=document.createElement('canvas');out.width=size[0];out.height=size[1];const ctx=out.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';const pad=Math.round(Math.min(...size)*padding),scale=Math.min((size[0]-pad*2)/bw,(size[1]-pad*2)/bh),dw=fit==='stretch'?size[0]-pad*2:bw*scale,dh=fit==='stretch'?size[1]-pad*2:bh*scale,dx=(size[0]-dw)/2,dy=(size[1]-dh)/2;ctx.drawImage(scan,left,top,bw,bh,dx,dy,dw,dh);return out.toDataURL('image/webp',.94);
  },{uri:`data:image/png;base64,${input.toString('base64')}`,cell:job.cell,size:job.size,padding:job.padding,fit:job.fit});
  const buffer=Buffer.from(data.split(',')[1],'base64'),file=`${job.name}.webp`;await writeFile(path.join(runtime,file),buffer);manifest.push({id:job.name,source:`assets/premium/source/${job.master}`,runtime:`/assets/premium/${file}`,width:job.size[0],height:job.size[1],format:'webp',sha256:crypto.createHash('sha256').update(buffer).digest('hex')});
}
await browser.close();await writeFile(path.join(runtime,'manifest.json'),JSON.stringify({version:2,generatedAt:new Date().toISOString(),alpha:true,lighting:'upper-left',tileBodyVisibleBounds:{left:19,top:13,right:492,bottom:626},trayGeometry:{textureWidth:1024,textureHeight:400,slotInteriors:[[64,94,265,282],[300,94,492,282],[528,94,720,282],[757,94,958,282]],safeInset:[10,12]},assets:manifest},null,2));console.log(JSON.stringify({processed:manifest.length,assets:manifest.map(asset=>({id:asset.id,bytes:asset.runtime}))},null,2));
