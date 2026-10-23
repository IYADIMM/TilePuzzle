import { solveLevel } from './LevelSolver.js';

export function planHint(tiles,trayEntries=[],maxNodes=24000){
  const solved=solveLevel(tiles,trayEntries,[],maxNodes);
  if(!solved.solved||!solved.sequence.length)return{ok:false,reason:solved.nodes>=maxNodes?'budget-exhausted':'no-solution',nodes:solved.nodes};
  const heldCounts=trayEntries.reduce((map,entry)=>(map.set(entry.typeId,(map.get(entry.typeId)||0)+1),map),new Map());
  const firstCompleter=solved.sequence.find(id=>heldCounts.get(tiles.find(tile=>tile.id===id)?.typeId)>0);
  return{ok:true,tileId:firstCompleter||solved.sequence[0],nodes:solved.nodes,sequence:solved.sequence};
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
