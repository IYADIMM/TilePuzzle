import { chromium } from 'playwright-core';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const root=process.cwd();
const masterPath=path.join(root,'assets','premium','source','classic','classic-mahjong-master.png');
const sourceDir=path.join(root,'assets','premium','source','classic','faces');
const runtimeDir=path.join(root,'public','assets','premium','classic');
await mkdir(sourceDir,{recursive:true});await mkdir(runtimeDir,{recursive:true});

const FACE_IDS=[
  ...Array.from({length:9},(_,i)=>`circle-${i+1}`),
  ...Array.from({length:9},(_,i)=>`bamboo-${i+1}`),
  ...Array.from({length:9},(_,i)=>`character-${i+1}`),
  'wind-east','wind-south','wind-west','wind-north',
  'dragon-red','dragon-green','dragon-white','flower-plum','flower-chrysanthemum'
];

// The editable generated master is deliberately retained. These cells describe its
// five authored motif rows; every crop is alpha-trimmed and centered without upscaling.
const ROWS=[
  {top:145,bottom:356,count:9},
  {top:360,bottom:548,count:9},
  {top:550,bottom:755,count:9},
  {top:760,bottom:982,count:4},
  {top:985,bottom:1255,count:5}
];

const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROME_PATH||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true,args:['--no-sandbox']});
const page=await browser.newPage();
const master=await readFile(masterPath);
const uri=`data:image/png;base64,${master.toString('base64')}`;
let faceIndex=0;const faces=[];

for(const row of ROWS){
  for(let column=0;column<row.count;column++){
    const id=FACE_IDS[faceIndex++];
    const png=await page.evaluate(async({uri,row,column})=>{
      const image=new Image();image.src=uri;await image.decode();
      const cellW=image.width/row.count,x=Math.floor(column*cellW),w=Math.ceil(cellW),h=row.bottom-row.top;
      const scan=document.createElement('canvas');scan.width=w;scan.height=h;const scanCtx=scan.getContext('2d',{willReadFrequently:true});scanCtx.drawImage(image,x,row.top,w,h,0,0,w,h);
      const pixels=scanCtx.getImageData(0,0,w,h).data;let left=w,top=h,right=-1,bottom=-1;
      for(let py=0;py<h;py++)for(let px=0;px<w;px++){if(pixels[(py*w+px)*4+3]>14){left=Math.min(left,px);right=Math.max(right,px);top=Math.min(top,py);bottom=Math.max(bottom,py);}}
      if(right<left||bottom<top)throw new Error('Empty classic face crop');
      const out=document.createElement('canvas');out.width=512;out.height=512;const ctx=out.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
      const bw=right-left+1,bh=bottom-top+1,scale=Math.min(440/bw,440/bh),dw=bw*scale,dh=bh*scale;
      ctx.drawImage(scan,left,top,bw,bh,(512-dw)/2,(512-dh)/2,dw,dh);return out.toDataURL('image/png');
    },{uri,row,column});
    const buffer=Buffer.from(png.split(',')[1],'base64');await writeFile(path.join(sourceDir,`${id}.png`),buffer);faces.push({id,source:`assets/premium/source/classic/faces/${id}.png`,sha256:sha(buffer)});
  }
}

const manifest=[];
for(let logicalIndex=0;logicalIndex<72;logicalIndex++){
  const face=faces[logicalIndex%faces.length],variant=Math.floor(logicalIndex/faces.length),input=await readFile(path.join(root,face.source));
  const webp=await page.evaluate(async({uri,variant})=>{
    const image=new Image();image.src=uri;await image.decode();const out=document.createElement('canvas');out.width=512;out.height=512;const ctx=out.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(image,0,0,512,512);
    if(variant){const g=ctx.createRadialGradient(457,457,1,457,457,31);g.addColorStop(0,'#fff7bd');g.addColorStop(.45,'#d89b21');g.addColorStop(1,'#6f3510');ctx.fillStyle=g;ctx.beginPath();ctx.arc(457,457,24,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff0a0';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#173f34';ctx.beginPath();ctx.arc(457,457,9,0,Math.PI*2);ctx.fill();}
    return out.toDataURL('image/webp',.94);
  },{uri:`data:image/png;base64,${input.toString('base64')}`,variant});
  const buffer=Buffer.from(webp.split(',')[1],'base64'),id=`classic-${String(logicalIndex).padStart(3,'0')}`,file=`${id}.webp`;
  await writeFile(path.join(runtimeDir,file),buffer);manifest.push({id,faceId:face.id,variant,source:face.source,runtime:`/assets/premium/classic/${file}`,width:512,height:512,format:'webp',sha256:sha(buffer)});
}

await browser.close();
const output={version:1,generatedAt:new Date().toISOString(),master:'assets/premium/source/classic/classic-mahjong-master.png',generator:'built-in image generation + deterministic alpha crop/composite',lighting:'upper-left',palette:['lacquer-red','jade-green','deep-navy','warm-gold'],faceCount:faces.length,renderCount:manifest.length,faces,assets:manifest};
await writeFile(path.join(runtimeDir,'manifest.json'),JSON.stringify(output,null,2));
console.log(JSON.stringify({faces:faces.length,runtimeAssets:manifest.length,manifest:'public/assets/premium/classic/manifest.json'},null,2));

function sha(buffer){return crypto.createHash('sha256').update(buffer).digest('hex');}
