import { chromium } from 'playwright-core';import { readFile,writeFile,mkdir } from 'node:fs/promises';import path from 'node:path';
const root=process.cwd(),source=path.join(root,'assets','premium','source'),out=path.join(source,'icons');await mkdir(out,{recursive:true});
const jobs=[
  ['fruits-master.png','fruit-cherries.png',0,0,3,1],['fruits-master.png','fruit-orange.png',1,0,3,1],['fruits-master.png','fruit-strawberry.png',2,0,3,1],
  ['cars-master.png','car-sports.png',0,0,3,1],['cars-master.png','car-sedan.png',1,0,3,1],['cars-master.png','car-suv.png',2,0,3,1],
  ...grid('sports-master-v2.png','sports',['soccer','basketball','tennis','baseball','football','trophy']),
  ...grid('auto-parts-master-v2.png','auto',['gear','spark-plug','tire','piston','steering-wheel','brake-disc']),
  ...grid('wild-animals-master-v2.png','wild',['lion','elephant','zebra','giraffe','tiger','panda']),
  ...grid('pets-master-v2.png','pet',['puppy','kitten','rabbit','hamster','parrot','goldfish'])
];
const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROME_PATH||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true,args:['--no-sandbox']});const page=await browser.newPage();
for(const[master,file,col,row,cols,rows]of jobs){const input=await readFile(path.join(source,master)),data=await page.evaluate(async({uri,col,row,cols,rows})=>{const image=new Image();image.src=uri;await image.decode();const cellW=Math.floor(image.width/cols),cellH=Math.floor(image.height/rows),canvas=document.createElement('canvas');canvas.width=cellW;canvas.height=cellH;canvas.getContext('2d').drawImage(image,col*cellW,row*cellH,cellW,cellH,0,0,cellW,cellH);return canvas.toDataURL('image/png');},{uri:`data:image/png;base64,${input.toString('base64')}`,col,row,cols,rows});await writeFile(path.join(out,file),Buffer.from(data.split(',')[1],'base64'));}
await browser.close();console.log(JSON.stringify({extracted:jobs.map(([,file])=>file)},null,2));
function grid(master,prefix,ids){return ids.map((id,index)=>[master,`${prefix}-${id}.png`,index%3,Math.floor(index/3),3,2]);}
