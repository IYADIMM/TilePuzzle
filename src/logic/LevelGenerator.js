import { getTheme } from '../data/themes.js';
import { solveLevel,computeAccessibility } from './LevelSolver.js';

export function generateLevel(config) {
  const theme = getTheme(config.themeId);
  const rng = mulberry32(config.seed);
  for (let attempt = 0; attempt < 5; attempt++) {
    const positions = buildPositions(config.tileCount, config.layers, config.layoutId, rng);
    const { tiles, solution } = assignSolvableSymbols(positions, theme.iconIds, rng, config.level);
    const solved = solveLevel(tiles, [], solution);
    if (solved.solved) return { ...config, theme, tiles, solution: solved.sequence, validation: solved, attempt };
  }
  return fallbackLevel(config, theme);
}

function buildPositions(count, layerCount, layoutId, rng) {
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
      if (shapeAllows(layoutId, row, col, template.rows, template.cols)) candidates.push({ layer, row: template.rowStart + row * 2, col: template.colStart + col * 2 });
    }
    const pool = candidates.length >= layerCounts[layer] ? candidates : fillCandidates(template, layer);
    positions.push(...spreadSelect(pool, layerCounts[layer], rng));
  }
  return positions;
}

function allocateLayerCounts(total, layers) {
  const weights = { 2:[.62,.38], 3:[.5,.3,.2], 4:[.42,.28,.18,.12], 5:[.37,.25,.18,.12,.08] }[layers];
  let remaining = total;
  return weights.map((weight, index) => {
    if (index === weights.length - 1) return remaining;
    const future = (weights.length - index - 1) * 3;
    const value = Math.max(3, Math.min(remaining - future, Math.round(total * weight / 3) * 3));
    remaining -= value;
    return value;
  });
}

function assignSolvableSymbols(positions, iconIds, rng, level) {
  const tiles=positions.map((position,index)=>({id:`L${level}-T${index}`,typeId:'pending',symbolId:'pending',...position,position:{row:position.row,col:position.col},alive:true,blockedBy:[]}));
  const solution=buildMahjongRemovalOrder(tiles,rng);
  let groupIndex=level%iconIds.length;
  for(let index=0;index<solution.length;index+=3){const typeId=iconIds[groupIndex++%iconIds.length];solution.slice(index,index+3).forEach(id=>{const tile=tiles.find(item=>item.id===id);tile.typeId=typeId;tile.symbolId=typeId;});}
  return { tiles, solution };
}

function buildMahjongRemovalOrder(tiles,rng){const alive=new Set(tiles.map(tile=>tile.id)),sequence=[];while(alive.size){const access=computeAccessibility(tiles,alive),choices=tiles.filter(tile=>alive.has(tile.id)&&!access.get(tile.id).blocked).sort((a,b)=>b.layer-a.layer||a.row-b.row||a.col-b.col||a.id.localeCompare(b.id));if(!choices.length)throw new Error('Mahjong layout has no removable edge tile');const window=choices.slice(0,Math.min(3,choices.length)),pick=window[Math.floor(rng()*window.length)];alive.delete(pick.id);sequence.push(pick.id);}return sequence;}

function fallbackLevel(config, theme) {
  const tiles = [];
  const solution = [];
  for (let i = 0; i < config.tileCount; i++) {
    const typeId = theme.iconIds[Math.floor(i / 3) % theme.iconIds.length];
    const tile = { id: `L${config.level}-F${i}`, typeId, symbolId: typeId, layer: 0, row: Math.floor(i / 5) * 2, col: (i % 5) * 2, position: { row: Math.floor(i / 5) * 2, col: (i % 5) * 2 }, alive: true, blockedBy: [] };
    tiles.push(tile);
  }
  Object.values(groupBy(tiles, tile => tile.typeId)).forEach(group => solution.push(...group.map(tile => tile.id)));
  return { ...config, theme, tiles, solution, validation: solveLevel(tiles, [], solution), attempt: 'fallback' };
}

function shapeAllows(id, row, col, rows, cols) {
  if (id === 'diamond') return Math.abs(col-(cols-1)/2)/Math.max(1,cols/2)+Math.abs(row-(rows-1)/2)/Math.max(1,rows/2) <= 1.35;
  if (id === 'hourglass') return row < 2 || row >= rows-2 || Math.abs(col-(cols-1)/2) < Math.max(1, cols/3);
  if (id === 'bridge') return row % 3 !== 1 || col === 0 || col === cols-1;
  if (id === 'lantern') return row > 0 && row < rows-1 ? true : col > 0 && col < cols-1;
  if (id === 'fan') return row >= Math.abs(col-(cols-1)/2);
  return true;
}

function fillCandidates(template, layer) { const out=[]; for(let r=0;r<template.rows;r++)for(let c=0;c<template.cols;c++)out.push({layer,row:template.rowStart+r*2,col:template.colStart+c*2}); return out; }
function spreadSelect(candidates, count, rng) { if(count>=candidates.length)return candidates.slice(0,count); const selected=[candidates[Math.floor(rng()*candidates.length)]], available=candidates.filter(p=>p!==selected[0]); while(selected.length<count){let best=0,score=-1;available.forEach((p,i)=>{const s=Math.min(...selected.map(q=>(p.col-q.col)**2+(p.row-q.row)**2))+rng()*.01;if(s>score){score=s;best=i}});selected.push(available.splice(best,1)[0]);}return selected; }
function groupBy(items,key){return items.reduce((out,item)=>((out[key(item)]||=[]).push(item),out),{});}
function shuffle(items,rng){for(let i=items.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[items[i],items[j]]=[items[j],items[i]];}return items;}
function mulberry32(seed){return function(){let t=seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}

