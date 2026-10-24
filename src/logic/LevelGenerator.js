import { getTheme } from '../data/themes.js';
import { solveLevel,computeAccessibility } from './LevelSolver.js';
import { MATCH_SIZE,isValidLevelInventory } from './GameRules.js';

export function generateLevel(config) {
  if(!isValidLevelInventory(config.tileCount))throw new Error(`Level ${config.level} tileCount must be divisible by MATCH_SIZE (${MATCH_SIZE})`);
  const theme = getTheme(config.themeId);
  const rng = mulberry32(config.seed);
  for (let attempt = 0; attempt < 5; attempt++) {
    const positions = buildPositions(config.tileCount, config.layers, config.layoutId);
    const { tiles, solution } = assignSolvableSymbols(positions, theme.iconIds, rng, config.level);
    const solved = solveLevel(tiles, [], solution);
    if (solved.solved) return { ...config, theme, tiles, solution: solved.sequence, validation: {...solved,shapeValid:validateShapePositions(config,positions),shapeFallbackUsed:false}, attempt };
  }
  throw new Error(`Level ${config.level} failed generation validation`);
}

export function buildPositions(count, layerCount, layoutId) {
  const layerCounts = allocateLayerCounts(count, layerCount);
  const templates = [
    { cols: 5, rows: 8, colStart: 0, rowStart: 0 },
    { cols: 4, rows: 7, colStart: 1, rowStart: 1 },
    { cols: 3, rows: 6, colStart: 2, rowStart: 2 },
    { cols: 3, rows: 5, colStart: 2, rowStart: 3 },
    { cols: 2, rows: 4, colStart: 3, rowStart: 4 }
  ];
  const positions = [];
  for (let layer = 0; layer < layerCount; layer++) {
    const template = templates[layer];
    const candidates = [];
    for (let row = 0; row < template.rows; row++) for (let col = 0; col < template.cols; col++) {
      candidates.push({layer,row:template.rowStart+row*2,col:template.colStart+col*2,maskScore:shapeScore(layoutId,row,col,template.rows,template.cols)});
    }
    if(candidates.length<layerCounts[layer])throw new Error(`${layoutId} layer ${layer} capacity ${candidates.length} < ${layerCounts[layer]}`);
    candidates.sort((a,b)=>b.maskScore-a.maskScore||a.row-b.row||a.col-b.col);
    const selected=candidates.slice(0,layerCounts[layer]);
    positions.push(...selected.map(({maskScore,...position})=>({...position,maskId:layoutId,maskValid:Number.isFinite(maskScore)})));
  }
  return positions;
}

export function validateShapePositions(config,positions){
  if(positions.length!==config.tileCount)return false;
  const expected=buildPositions(config.tileCount,config.layers,config.layoutId);
  const key=position=>`${position.layer}:${position.row}:${position.col}`;
  const allowed=new Set(expected.map(key));
  return positions.every(position=>position.maskId===config.layoutId&&position.maskValid===true&&allowed.has(key(position)));
}

function allocateLayerCounts(total, layers) {
  const weights = { 2:[.62,.38], 3:[.5,.3,.2], 4:[.42,.28,.18,.12], 5:[.37,.25,.18,.12,.08] }[layers];
  let remaining = total;
  return weights.map((weight, index) => {
    if (index === weights.length - 1) return remaining;
    const future = (weights.length - index - 1) * MATCH_SIZE;
    const value = Math.max(MATCH_SIZE, Math.min(remaining - future, Math.round(total * weight / MATCH_SIZE) * MATCH_SIZE));
    remaining -= value;
    return value;
  });
}

function assignSolvableSymbols(positions, iconIds, rng, level) {
  const tiles=positions.map((position,index)=>({id:`L${level}-T${index}`,typeId:'pending',symbolId:'pending',...position,position:{row:position.row,col:position.col},alive:true,blockedBy:[]}));
  const solution=buildMahjongRemovalOrder(tiles,rng);
  let groupIndex=level%iconIds.length;
  for(let index=0;index<solution.length;index+=MATCH_SIZE){const typeId=iconIds[groupIndex++%iconIds.length];solution.slice(index,index+MATCH_SIZE).forEach(id=>{const tile=tiles.find(item=>item.id===id);tile.typeId=typeId;tile.symbolId=typeId;});}
  return { tiles, solution };
}

function buildMahjongRemovalOrder(tiles,rng){const alive=new Set(tiles.map(tile=>tile.id)),sequence=[];while(alive.size){const access=computeAccessibility(tiles,alive),choices=tiles.filter(tile=>alive.has(tile.id)&&!access.get(tile.id).blocked).sort((a,b)=>b.layer-a.layer||a.row-b.row||a.col-b.col||a.id.localeCompare(b.id));if(!choices.length)throw new Error('Mahjong layout has no removable edge tile');const window=choices.slice(0,Math.min(3,choices.length)),pick=window[Math.floor(rng()*window.length)];alive.delete(pick.id);sequence.push(pick.id);}return sequence;}

export function shapeScore(id,row,col,rows,cols){
  const nx=cols<=1?0:(col/(cols-1))*2-1,ny=rows<=1?0:(row/(rows-1))*2-1;
  const radius=Math.hypot(nx,ny),angle=Math.atan2(ny,nx);
  if(id==='diamond')return 1.4-(Math.abs(nx)+Math.abs(ny));
  if(id==='hourglass')return .24+.78*Math.abs(ny)-Math.abs(nx);
  if(id==='bridge')return Math.max(.32-Math.abs(ny+.72),.24-Math.min(Math.abs(nx-.9),Math.abs(nx+.9)));
  if(id==='lantern')return Math.max(1-(nx/.78)**2-(ny/.82)**2,.55-Math.abs(nx)-Math.abs(ny+.95));
  if(id==='fan')return 1.08-radius-Math.max(0,Math.abs(nx)-(.25+(ny+1)*.38));
  if(id==='heart')return 1.02-((nx*.9)**2+(ny*.88-Math.sqrt(Math.abs(nx))*.58)**2);
  if(id==='butterfly')return Math.max(.35-Math.abs(nx),.38-((Math.abs(nx)-.52)**2+(ny*.82)**2));
  if(id==='flower')return .8+.18*Math.cos(angle*5)-radius;
  if(id==='star')return .55+.25*Math.cos(angle*5)-radius;
  if(id==='bear')return Math.max(.72-(nx*nx+(ny+.25)**2),.28-Math.min((nx-.58)**2+(ny+.82)**2,(nx+.58)**2+(ny+.82)**2));
  if(id==='car')return Math.max(.78-Math.abs(nx)-Math.abs(ny-.25)*.45,.52-Math.abs(nx)-Math.abs(ny+.35)*.7);
  return 1-Math.abs(nx)*.72-Math.abs(ny)*.18;
}
function mulberry32(seed){return function(){let t=seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}

