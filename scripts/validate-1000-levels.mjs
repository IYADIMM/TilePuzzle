import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {LEVEL_CONFIGS,getLevelConfig} from '../src/data/levels.js';
import {generateLevel,topologyFingerprint} from '../src/logic/LevelGenerator.js';
import {validateSolution,solveLevel} from '../src/logic/LevelSolver.js';
import {MATCH_SIZE,LEVEL_GENERATION_VERSION} from '../src/logic/GameRules.js';
import {createHash} from 'node:crypto';
import {computeAccessibility} from '../src/logic/LevelSolver.js';

const started=performance.now(),failures=[],shapeCounts={},themeCounts={},themeShapeCounts={},fingerprints=new Map(),duplicates=[],topologyFingerprints=new Map(),topologyDuplicates=[],difficulty=[],fallbackLevels=[],independentSolverSamples=[],v4Manifest=[];
for(const config of LEVEL_CONFIGS){
  try{
    const level=generateLevel(config),validation=validateSolution(level.tiles,level.solution),types=level.tiles.reduce((out,tile)=>(out[tile.typeId]=(out[tile.typeId]||0)+1,out),{});
    if(!validation.solved)failures.push({level:config.level,reason:validation.reason||'unsolved'});
    if(level.tiles.length!==config.tileCount)failures.push({level:config.level,reason:`tile-count:${level.tiles.length}`});
    if(Object.values(types).some(count=>count%MATCH_SIZE!==0))failures.push({level:config.level,reason:'non-pair-inventory'});
    if(!level.validation.shapeValid)failures.push({level:config.level,reason:'shape-mask-invalid'});
    if(level.validation.shapeFallbackUsed||level.attempt==='fallback')fallbackLevels.push(config.level);
    const canonical=level.tiles.map(tile=>`${tile.layer}:${tile.row}:${tile.col}:${tile.typeId}`).sort().join('|'),fingerprint=createHash('sha256').update(canonical).digest('hex');
    if(fingerprints.has(fingerprint))duplicates.push({level:config.level,duplicateOf:fingerprints.get(fingerprint),fingerprint});else fingerprints.set(fingerprint,config.level);
    const topologyHash=createHash('sha256').update(topologyFingerprint(level)).digest('hex');if(topologyFingerprints.has(topologyHash))topologyDuplicates.push({level:config.level,duplicateOf:topologyFingerprints.get(topologyHash),topologyHash});else topologyFingerprints.set(topologyHash,config.level);
    const legacy=generateLevel(getLevelConfig(config.level,4)),legacyHash=createHash('sha256').update(legacy.tiles.map(tile=>`${tile.layer}:${tile.row}:${tile.col}:${tile.typeId}`).sort().join('|')).digest('hex');v4Manifest.push({level:config.level,hash:legacyHash});
    const accessibility=computeAccessibility(level.tiles),selectable=[...accessibility.values()].filter(item=>!item.blocked).length;
    difficulty.push({level:config.level,declared:config.difficulty,tileCount:config.tileCount,layers:config.layers,initialSelectable:selectable,solutionDepth:level.solution.length});
    shapeCounts[config.layoutId]=(shapeCounts[config.layoutId]||0)+1;themeCounts[config.themeId]=(themeCounts[config.themeId]||0)+1;themeShapeCounts[config.themeId]??={};themeShapeCounts[config.themeId][config.layoutId]=(themeShapeCounts[config.themeId][config.layoutId]||0)+1;
    if([1,25,100,241,500,750,999,1000].includes(config.level)){const independent=solveLevel(level.tiles,[],[],250000);independentSolverSamples.push({level:config.level,solved:independent.solved,nodes:independent.nodes,source:independent.source});if(!independent.solved)failures.push({level:config.level,reason:'independent-search-unsolved',nodes:independent.nodes});}
  }catch(error){failures.push({level:config.level,reason:String(error?.message||error)});}
}
if(fallbackLevels.length)failures.push({reason:'generator-fallback-used',levels:fallbackLevels});
if(duplicates.length)failures.push({reason:'duplicate-logical-fingerprints',duplicates});
const difficultySummary=Object.values(difficulty.reduce((groups,row)=>{const key=String(row.declared),group=groups[key]||={declared:row.declared,levels:0,tileCountMin:Infinity,tileCountMax:0,initialSelectableMin:Infinity,initialSelectableMax:0,initialSelectableTotal:0};group.levels++;group.tileCountMin=Math.min(group.tileCountMin,row.tileCount);group.tileCountMax=Math.max(group.tileCountMax,row.tileCount);group.initialSelectableMin=Math.min(group.initialSelectableMin,row.initialSelectable);group.initialSelectableMax=Math.max(group.initialSelectableMax,row.initialSelectable);group.initialSelectableTotal+=row.initialSelectable;groups[key]=group;return groups;},{})).map(group=>({...group,initialSelectableAverage:Number((group.initialSelectableTotal/group.levels).toFixed(2))})).map(({initialSelectableTotal,...group})=>group);
const report={generatedAt:new Date().toISOString(),generationVersion:LEVEL_GENERATION_VERSION,matchSize:MATCH_SIZE,levels:LEVEL_CONFIGS.length,uniqueFingerprints:fingerprints.size,uniqueTopologyFingerprints:topologyFingerprints.size,duplicateFingerprints:duplicates,topologyDuplicateCount:topologyDuplicates.length,topologyDuplicateSample:topologyDuplicates.slice(0,20),fallbackCount:fallbackLevels.length,elapsedMs:Math.round(performance.now()-started),shapeCounts,themeCounts,themeShapeCounts,independentSolverSamples,difficultySummary,v4ManifestSha256:createHash('sha256').update(JSON.stringify(v4Manifest)).digest('hex'),failures,passed:LEVEL_CONFIGS.length===1000&&fingerprints.size===1000&&topologyFingerprints.size>=900&&fallbackLevels.length===0&&failures.length===0};
const out=path.join(process.cwd(),'qa','production-correction');await mkdir(out,{recursive:true});await writeFile(path.join(out,'levels-1000-validation.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(!report.passed)process.exitCode=1;
