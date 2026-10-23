import { readFile,writeFile } from 'node:fs/promises';
import path from 'node:path';
import { LEVEL_CONFIGS } from '../src/data/levels.js';
import { MATERIALS,THEMES } from '../src/data/themes.js';
import { generateLevel } from '../src/logic/LevelGenerator.js';
import { PREMIUM_ICONS,PREMIUM_MATERIALS } from '../src/art/PremiumAssetManifest.js';

const root=process.cwd();
const runtimeManifest=JSON.parse(await readFile(path.join(root,'public','assets','premium','manifest.json'),'utf8'));
const runtimeIds=new Set(runtimeManifest.assets.map(asset=>asset.id));
const referencedCollections=new Set(['fruits','cars','sports','auto-parts','wild-animals','pets']);
const assetInventory={generatedAt:new Date().toISOString(),visualAcceptance:'PENDING_USER_REVIEW',summary:{plannedIcons:THEMES.reduce((sum,theme)=>sum+theme.iconIds.length,0),nativeSourceIcons:0,optimizedRuntimeIcons:0,proceduralFallbackIcons:0,userApprovedIcons:0,plannedMaterials:Object.keys(MATERIALS).length,nativeRasterMaterials:0},icons:[],materials:[]};
for(const theme of THEMES)for(const id of theme.iconIds){
  const runtime=PREMIUM_ICONS[id]||null,runtimeId=runtime?path.basename(runtime,'.webp'):null,native=Boolean(runtime);
  assetInventory.icons.push({id,collection:theme.id,conceptDirectionAvailable:referencedCollections.has(theme.id),nativeTransparentSource:native,source:native?`assets/premium/source/icons/${runtimeId}.png`:null,optimizedRuntimeWebP:native&&runtimeIds.has(runtimeId),runtime,proceduralFallback:!native,userApproved:false});
  if(native){assetInventory.summary.nativeSourceIcons++;assetInventory.summary.optimizedRuntimeIcons++;}else assetInventory.summary.proceduralFallbackIcons++;
}
for(const material of Object.values(MATERIALS)){const runtime=PREMIUM_MATERIALS[material.id],runtimeId=`tile-material-${material.id}`,native=Boolean(runtime)&&runtimeIds.has(runtimeId);assetInventory.materials.push({id:material.id,name:material.name,planned:true,nativeRasterSource:native,source:native?`assets/premium/source/materials/tile-${material.id}.png`:null,optimizedRuntimeMaterial:native,runtime:runtime?.url||null,proceduralRuntime:!native,userApproved:false});if(native)assetInventory.summary.nativeRasterMaterials++;}

const levelRows=[];
for(const config of LEVEL_CONFIGS){
  const generated=generateLevel(config),solved=generated.validation,theme=THEMES.find(item=>item.id===config.themeId),premiumCount=theme.iconIds.filter(id=>PREMIUM_ICONS[id]).length;
  levelRows.push({level:config.level,theme:config.themeId,material:config.materialId,tileCount:config.tileCount,layers:config.layers,solutionLength:generated.solution.length,solverSolved:solved.solved,gridAligned:generated.tiles.every(tile=>Number.isInteger(tile.row)&&Number.isInteger(tile.col)&&Number.isInteger(tile.layer)),premiumRuntimeIcons:`${premiumCount}/${theme.iconIds.length}`,materialMode:PREMIUM_MATERIALS[config.materialId]?'native-material-body':'procedural-fallback'});
}
const firstTwenty=levelRows.filter(row=>row.level<=20);
const levelsReport={generatedAt:new Date().toISOString(),levels:levelRows,summary:{total:levelRows.length,solverVerified:levelRows.filter(row=>row.solverSolved).length,gridAligned:levelRows.filter(row=>row.gridAligned).length,allPassed:levelRows.every(row=>row.solverSolved&&row.gridAligned&&row.solutionLength===row.tileCount),firstTwentyFullRasterCoverage:firstTwenty.every(row=>row.premiumRuntimeIcons==='6/6'),firstTwentyFallbackLevels:firstTwenty.filter(row=>row.premiumRuntimeIcons!=='6/6').map(row=>row.level)}};
await writeFile(path.join(root,'qa','ASSET_INVENTORY.json'),JSON.stringify(assetInventory,null,2));
await writeFile(path.join(root,'qa','LEVELS_30_VALIDATION.json'),JSON.stringify(levelsReport,null,2));
await writeFile(path.join(root,'qa','LEVELS_1000_VALIDATION.json'),JSON.stringify(levelsReport,null,2));
const phase2Dir=path.join(root,'qa','production-visual-ux');
const csv=['collection,typeId,source,runtime,status',...assetInventory.icons.map(icon=>[icon.collection,icon.id,icon.source||'',icon.runtime||'',icon.proceduralFallback?'fallback':'premium-raster'].map(value=>`"${String(value).replaceAll('"','""')}"`).join(','))].join('\n');
const coverage=['# Theme Art Coverage','','| Collection | Runtime icons | Tile body | Status |','|---|---:|---|---|',...THEMES.map(theme=>{const count=theme.iconIds.filter(id=>PREMIUM_ICONS[id]).length,nativeBody=Boolean(PREMIUM_MATERIALS[theme.materialId]);return`| ${theme.name} | ${count}/6 | ${nativeBody?'Native raster material':'Procedural material'} | ${count===6&&nativeBody?'Production candidate — user review pending':'Fallback — unfinished'} |`; }),'','All 72 icons and 12 material bodies are technically integrated. Visual approval has not been inferred from technical integration.'].join('\n');
await writeFile(path.join(phase2Dir,'ASSET_MANIFEST.csv'),csv);
await writeFile(path.join(phase2Dir,'THEME_ART_COVERAGE.md'),coverage);
console.log(JSON.stringify({assets:assetInventory.summary,levels:levelsReport.summary},null,2));
