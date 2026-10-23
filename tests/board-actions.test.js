import test from 'node:test';
import assert from 'node:assert/strict';
import { planHint,planShuffle } from '../src/logic/BoardActions.js';

const tiles=[
  {id:'a1',typeId:'a',row:0,col:0,layer:0,alive:true},
  {id:'a2',typeId:'a',row:0,col:4,layer:0,alive:true},
  {id:'b1',typeId:'b',row:4,col:0,layer:0,alive:true},
  {id:'b2',typeId:'b',row:4,col:4,layer:0,alive:true}
];
test('hint returns a solver-backed move that completes a held pair when available',()=>{const board=[tiles[0],tiles[2],tiles[3]],result=planHint(board,[{visualId:'held-a',typeId:'a'}]);assert.equal(result.ok,true);assert.equal(board.find(tile=>tile.id===result.tileId).typeId,'a');});
test('hint failure never fabricates an arbitrary selectable tile',()=>{const result=planHint([{...tiles[0],typeId:'orphan'}],[]);assert.equal(result.ok,false);assert.equal(result.tileId,undefined);});
test('shuffle rejects no-op and commits only a solvable multiset-preserving assignment',()=>{const old=tiles.map(tile=>tile.typeId),result=planShuffle(tiles,[],[old,['b','b','a','a']]);assert.equal(result.ok,true);assert.notDeepEqual(result.assignment,old);assert.deepEqual([...result.assignment].sort(),[...old].sort());});
