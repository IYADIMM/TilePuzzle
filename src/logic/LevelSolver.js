import { createTrayState, reduceTray, TRAY_CAPACITY } from './SlotState.js';
import { TILE_GEOMETRY,logicalFaceRect,overlapSize } from '../game/TileGeometry.js';

export function computeAccessibility(tiles, aliveIds = new Set(tiles.filter(tile => tile.alive !== false).map(tile => tile.id))) {
  const alive=tiles.filter(tile=>aliveIds.has(tile.id));
  const result=new Map();
  for(const tile of alive){
    const rect=logicalFaceRect(tile),top=[],left=[],right=[];
    for(const other of alive){
      if(other.id===tile.id)continue;
      const otherRect=logicalFaceRect(other),overlap=overlapSize(rect,otherRect);
      if(other.layer>tile.layer&&overlap.x>TILE_GEOMETRY.coverTolerance&&overlap.y>TILE_GEOMETRY.coverTolerance){top.push(other.id);continue;}
      if(other.layer!==tile.layer)continue;
      const verticalOverlap=Math.max(0,overlap.y)/TILE_GEOMETRY.faceHeight;
      if(verticalOverlap<TILE_GEOMETRY.sideVerticalOverlapRatio)continue;
      if(otherRect.x<rect.x){const gap=rect.left-otherRect.right;if(gap<=TILE_GEOMETRY.sideGapTolerance&&otherRect.right<=rect.x)left.push(other.id);}
      if(otherRect.x>rect.x){const gap=otherRect.left-rect.right;if(gap<=TILE_GEOMETRY.sideGapTolerance&&otherRect.left>=rect.x)right.push(other.id);}
    }
    const sandwich=left.length>0&&right.length>0,blocked=top.length>0||sandwich;
    result.set(tile.id,{blocked,top,left,right,leftFree:!left.length,rightFree:!right.length,reason:top.length?'top-blocked':sandwich?'left+right-blocked':'selectable',blockerIds:top.length?top:[...left,...right]});
  }
  return result;
}

export function computeBlockedBy(tiles, aliveIds = new Set(tiles.filter(tile => tile.alive !== false).map(tile => tile.id))) {
  return new Map([...computeAccessibility(tiles,aliveIds)].map(([id,details])=>[id,details.blocked?details.blockerIds:[]]));
}

export function validateSolution(tiles, sequence, initialTray = []) {
  const alive = new Set(tiles.map(tile => tile.id));
  let tray = createTrayState(initialTray);
  for (const id of sequence) {
    if (!alive.has(id)) return { solved: false, reason: `dead:${id}` };
    const blocked = computeBlockedBy(tiles, alive).get(id) || [];
    if (blocked.length) return { solved: false, reason: `blocked:${id}`, blockedBy: blocked };
    const tile = tiles.find(item => item.id === id);
    alive.delete(id);
    const result = reduceTray(tray, { type: 'INSERT', tile: { visualId: tile.id, typeId: tile.typeId } });
    if (!result.accepted || result.full) return { solved: false, reason: result.reason || 'tray-full' };
    tray = result.state;
  }
  return { solved: alive.size === 0 && tray.entries.length === 0, remaining: alive.size, tray: tray.entries };
}

export function solveLevel(tiles, initialTray = [], knownSolution = [], maxNodes = 50000) {
  if (knownSolution.length) {
    const known = validateSolution(tiles, knownSolution, initialTray);
    if (known.solved) return { solved: true, sequence: [...knownSolution], nodes: 1, source: 'known' };
  }
  const byId = new Map(tiles.map(tile => [tile.id, tile]));
  const initialAlive = new Set(tiles.map(tile => tile.id));
  const memo = new Set();
  let nodes = 0;

  function dfs(alive, tray, sequence) {
    if (++nodes > maxNodes) return null;
    if (!alive.size) return tray.entries.length === 0 ? sequence : null;
    const key = `${[...alive].sort().join(',')}|${tray.entries.map(entry => entry.typeId).sort().join(',')}`;
    if (memo.has(key)) return null;
    memo.add(key);
    const blockers = computeBlockedBy(tiles, alive);
    const exposed = [...alive].map(id => byId.get(id)).filter(tile => !(blockers.get(tile.id)?.length));
    exposed.sort((a, b) => priority(b, tray) - priority(a, tray) || b.layer - a.layer || a.id.localeCompare(b.id));
    for (const tile of exposed) {
      const next = reduceTray(tray, { type: 'INSERT', tile: { visualId: tile.id, typeId: tile.typeId } });
      if (!next.accepted || next.full) continue;
      const nextAlive = new Set(alive); nextAlive.delete(tile.id);
      const answer = dfs(nextAlive, next.state, [...sequence, tile.id]);
      if (answer) return answer;
    }
    return null;
  }

  const sequence = dfs(initialAlive, createTrayState(initialTray), []);
  return { solved: Boolean(sequence), sequence: sequence || [], nodes, source: 'search', capacity: TRAY_CAPACITY };
}

export function projectRect(tile) {
  return logicalFaceRect(tile);
}
function priority(tile, tray) { return tray.entries.filter(entry => entry.typeId === tile.typeId).length * 100 + tile.layer * 10; }

