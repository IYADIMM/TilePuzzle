import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync,readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { DEFAULT_SAVE,migrateSave,validateSaveDomain } from '../src/systems/SaveManager.js';
import { getGardenTreasuresLevel,GARDEN_TREASURE_ICON_IDS } from '../src/data/gardenTreasures.js';
import { generateLevel } from '../src/logic/LevelGenerator.js';
import { completeGardenTreasures } from '../src/systems/ProgressionManager.js';

const clone=value=>JSON.parse(JSON.stringify(value));

test('premium home exposes every required functional destination without a developer-only replacement',()=>{
  const source=readFileSync(new URL('../src/scenes/MenuScene.js',import.meta.url),'utf8');
  for(const label of ['TILE STYLES','LEVELS','COLLECTION','MY RECORDS','ACHIEVEMENTS','TREASURE TRAIL'])assert.match(source,new RegExp(label));
  assert.doesNotMatch(source,/TEST SHOP/);
  assert.match(source,/this\.scene\.start\('Shop'\)/);
});

test('Garden Treasures is solver-backed Match-2 content with six stable premium identities',()=>{
  const config=getGardenTreasuresLevel(),level=generateLevel(config);
  assert.equal(level.tiles.length,24);
  assert.equal(level.validation.solved,true);
  assert.equal(new Set(level.tiles.map(tile=>tile.typeId)).size,6);
  assert.deepEqual(new Set(level.tiles.map(tile=>tile.typeId)),new Set(GARDEN_TREASURE_ICON_IDS));
  for(const id of GARDEN_TREASURE_ICON_IDS)assert.equal(level.tiles.filter(tile=>tile.typeId===id).length%2,0);
});

test('Garden Treasures reward and completion are durable and idempotent',()=>{
  const save=migrateSave(clone(DEFAULT_SAVE)),before=save.coins;
  const first=completeGardenTreasures(save,{score:4800,seconds:92});
  assert.equal(first.firstClear,true);assert.equal(first.coins,200);assert.equal(save.coins,before+200);
  const replay=completeGardenTreasures(save,{score:4000,seconds:120});
  assert.equal(replay.firstClear,false);assert.equal(replay.coins,0);assert.equal(save.coins,before+200);
  assert.equal(validateSaveDomain(save).ok,true);
});

test('Garden Treasures runtime art is six independent transparent 512px textures',async()=>{
  for(const id of GARDEN_TREASURE_ICON_IDS){const path=fileURLToPath(new URL(`../public/assets/premium/ivory-garden/${id}.webp`,import.meta.url));assert.equal(existsSync(path),true,id);const meta=await sharp(path).metadata();assert.equal(meta.width,512);assert.equal(meta.height,512);assert.equal(meta.hasAlpha,true);}
});
