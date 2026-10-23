import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {LEVEL_CONFIGS} from '../src/data/levels.js';
import {generateLevel} from '../src/logic/LevelGenerator.js';
import {validateSolution} from '../src/logic/LevelSolver.js';
import {MATCH_SIZE,LEVEL_GENERATION_VERSION} from '../src/logic/GameRules.js';

const started=performance.now(),failures=[],shapeCounts={},themeCounts={};
for(const config of LEVEL_CONFIGS){
  try{
    const level=generateLevel(config),validation=validateSolution(level.tiles,level.solution),types=level.tiles.reduce((out,tile)=>(out[tile.typeId]=(out[tile.typeId]||0)+1,out),{});
    if(!validation.solved)failures.push({level:config.level,reason:validation.reason||'unsolved'});
    if(level.tiles.length!==config.tileCount)failures.push({level:config.level,reason:`tile-count:${level.tiles.length}`});
    if(Object.values(types).some(count=>count%MATCH_SIZE!==0))failures.push({level:config.level,reason:'non-pair-inventory'});
    shapeCounts[config.layoutId]=(shapeCounts[config.layoutId]||0)+1;themeCounts[config.themeId]=(themeCounts[config.themeId]||0)+1;
  }catch(error){failures.push({level:config.level,reason:String(error?.message||error)});}
}
const report={generatedAt:new Date().toISOString(),generationVersion:LEVEL_GENERATION_VERSION,matchSize:MATCH_SIZE,levels:LEVEL_CONFIGS.length,elapsedMs:Math.round(performance.now()-started),shapeCounts,themeCounts,failures,passed:LEVEL_CONFIGS.length===1000&&failures.length===0};
const out=path.join(process.cwd(),'qa','production-correction');await mkdir(out,{recursive:true});await writeFile(path.join(out,'levels-1000-validation.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(!report.passed)process.exitCode=1;
