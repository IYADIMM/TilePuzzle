import { solveLevel,solveLevelAsync } from './LevelSolver.js';

export function planHint(tiles,trayEntries=[],maxNodes=24000,knownSolution=[]){
  const solved=solveLevel(tiles,trayEntries,knownSolution,maxNodes);
  if(!solved.solved||!solved.sequence.length)return{ok:false,reason:solved.nodes>=maxNodes?'budget-exhausted':'no-solution',nodes:solved.nodes};
  // A hint is only trustworthy when it is the verified first step of the
  // returned continuation. Picking a visually attractive later step can
  // violate the solver ordering or point at a tile that is still blocked.
  return{ok:true,tileId:solved.sequence[0],nodes:solved.nodes,sequence:solved.sequence};
}

export function planShuffle(tiles,trayEntries=[],candidateOrders=[],maxNodes=24000){
  const original=tiles.map(tile=>tile.typeId);
  for(const candidate of candidateOrders){
    if(candidate.length!==original.length||candidate.every((typeId,index)=>typeId===original[index]))continue;
    const logical=tiles.map((tile,index)=>({...tile,typeId:candidate[index]}));
    const solved=solveLevel(logical,trayEntries,[],maxNodes);
    if(solved.solved)return{ok:true,assignment:[...candidate],sequence:solved.sequence,nodes:solved.nodes};
  }
  return{ok:false,reason:'no-solvable-non-noop'};
}

export async function planHintAsync(tiles,trayEntries=[],maxNodes=24000,knownSolution=[],options={}){const solved=await solveLevelAsync(tiles,trayEntries,knownSolution,maxNodes,options);if(solved.cancelled)return{ok:false,reason:'cancelled',nodes:solved.nodes};if(!solved.solved||!solved.sequence.length)return{ok:false,reason:solved.nodes>=maxNodes?'budget-exhausted':'no-solution',nodes:solved.nodes};return{ok:true,tileId:solved.sequence[0],nodes:solved.nodes,sequence:solved.sequence};}
export async function planShuffleAsync(tiles,trayEntries=[],candidateOrders=[],maxNodes=24000,options={}){const original=tiles.map(tile=>tile.typeId);for(const candidate of candidateOrders){if(options.isCancelled?.())return{ok:false,reason:'cancelled'};if(candidate.length!==original.length||candidate.every((typeId,index)=>typeId===original[index]))continue;const logical=tiles.map((tile,index)=>({...tile,typeId:candidate[index]})),solved=await solveLevelAsync(logical,trayEntries,[],maxNodes,options);if(solved.cancelled)return{ok:false,reason:'cancelled',nodes:solved.nodes};if(solved.solved)return{ok:true,assignment:[...candidate],sequence:solved.sequence,nodes:solved.nodes};}return{ok:false,reason:'no-solvable-non-noop'};}
