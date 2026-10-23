import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile,stat } from 'node:fs/promises';
import path from 'node:path';
import { THEMES } from '../src/data/themes.js';
import { CLASSIC_ASSETS,CLASSIC_FACE_IDS,TILE_STYLE_IDS,buildClassicMapping,createTileSkinResolver } from '../src/art/TileStyleRegistry.js';
import { DEFAULT_SAVE,migrateSave } from '../src/systems/SaveManager.js';
import { generateLevel } from '../src/logic/LevelGenerator.js';
import { LEVEL_CONFIGS } from '../src/data/levels.js';

test('classic style ships at least 36 authored faces and every runtime asset',async()=>{const manifest=JSON.parse(await readFile('public/assets/premium/classic/manifest.json','utf8'));assert.equal(CLASSIC_FACE_IDS.length,36);assert.equal(manifest.faceCount,36);assert.equal(manifest.renderCount,72);assert.equal(CLASSIC_ASSETS.length,72);for(const asset of manifest.assets){assert.match(asset.sha256,/^[a-f0-9]{64}$/);assert.ok((await stat(path.join('public',asset.runtime.replace(/^\//,'')))).size>1000,asset.id);}});
test('classic mapping is deterministic and injective across all 72 logical identities',()=>{const ids=THEMES.flatMap(theme=>theme.iconIds),a=buildClassicMapping(ids),b=buildClassicMapping([...ids].reverse());assert.equal(a.size,72);assert.equal(new Set(a.values()).size,72);for(const id of ids)assert.equal(a.get(id),b.get(id));});
test('same seeded level keeps identities and solution when presentation style changes',()=>{const level=generateLevel(LEVEL_CONFIGS[117]),ids=[...new Set(level.tiles.map(tile=>tile.typeId))],garden=createTileSkinResolver('illustrated',ids),classic=createTileSkinResolver('classic',ids);assert.deepEqual(level.tiles.map(tile=>tile.typeId),generateLevel(LEVEL_CONFIGS[117]).tiles.map(tile=>tile.typeId));assert.equal(new Set(ids.map(id=>classic.textureKey(id))).size,ids.length);assert.ok(ids.every(id=>garden.textureKey(id)!==classic.textureKey(id)));});
test('existing and corrupt tile-style preferences migrate safely without resetting progress',()=>{const legacy=migrateSave({version:5,maxUnlockedLevel:42,coins:999,prefs:{}});assert.equal(legacy.prefs.tileStyle,TILE_STYLE_IDS.ILLUSTRATED);assert.equal(legacy.maxUnlockedLevel,42);assert.equal(legacy.coins,999);const selected=migrateSave({version:6,prefs:{tileStyle:'classic'}});assert.equal(selected.prefs.tileStyle,TILE_STYLE_IDS.CLASSIC);const invalid=migrateSave({version:6,prefs:{tileStyle:'unknown'}});assert.equal(invalid.prefs.tileStyle,TILE_STYLE_IDS.ILLUSTRATED);assert.equal(DEFAULT_SAVE.prefs.tileStyle,TILE_STYLE_IDS.ILLUSTRATED);});
