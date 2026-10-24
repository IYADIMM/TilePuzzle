import test from 'node:test';
import assert from 'node:assert/strict';
import { ActivePlayClock } from '../src/logic/ActivePlayClock.js';
import { createAttemptCheckpoint,operationId } from '../src/logic/AttemptCheckpoint.js';
import { SaveManager,DEFAULT_SAVE,migrateSave } from '../src/systems/SaveManager.js';
import { planHint } from '../src/logic/BoardActions.js';
import { computeAccessibility,validateSolution } from '../src/logic/LevelSolver.js';
import { applyWalletTransaction } from '../src/economy/WalletLedger.js';
import { claimDailyReward } from '../src/economy/DailyRewardService.js';
import { completeLevel } from '../src/systems/ProgressionManager.js';
import { LEVEL_CONFIGS,getLevelConfig,normalizeLevelNumber } from '../src/data/levels.js';
import { clampPlayableLevel,levelPageFor,levelsForPage } from '../src/logic/LevelNavigation.js';
import { generateLevel } from '../src/logic/LevelGenerator.js';
import { LEVEL_GENERATION_VERSION } from '../src/logic/GameRules.js';

const fresh=()=>JSON.parse(JSON.stringify(DEFAULT_SAVE));

test('active play clock excludes modal and background pauses',()=>{
  let now=1000;const clock=new ActivePlayClock(()=>now);now=4000;assert.equal(clock.elapsedMs,3000);clock.pause('modal');now=304000;clock.pause('background');clock.resume('background');assert.equal(clock.elapsedMs,3000);clock.resume('modal');now=306000;assert.equal(clock.elapsedMs,5000);
});

test('checkpoint captures the post-action snapshot and bounded history immutably',()=>{
  const snapshot={score:50,tray:[{visualId:'a',typeId:'fruit'}],tiles:[{id:'a',collected:true}]},history=Array.from({length:12},(_,i)=>({score:i}));
  const checkpoint=createAttemptCheckpoint({level:3,elapsedMs:1200,snapshot,history,boostersUsed:1,attemptId:'attempt:1'});snapshot.score=999;history[11].score=999;
  assert.equal(checkpoint.snapshot.score,50);assert.equal(checkpoint.history.length,8);assert.equal(checkpoint.history.at(-1).score,11);assert.equal(checkpoint.elapsedMs,1200);
});

test('save verification reports blocked or silently ignored storage writes',()=>{
  const storage={getItem:()=>null,setItem:()=>{},removeItem:()=>{}};
  assert.equal(SaveManager.save(fresh(),storage).ok,false);
});

test('corrupt primary is repaired from verified backup and can save again',()=>{
  const values=new Map(),storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
  const backup=fresh();backup.coins=777;values.set('jade-garden-tiles-save-v5','{bad');values.set('jade-garden-tiles-save-backup-v5',JSON.stringify(backup));
  const recovered=SaveManager.load(storage);assert.equal(recovered.coins,777);assert.doesNotThrow(()=>JSON.parse(values.get('jade-garden-tiles-save-v5')));recovered.coins=888;assert.equal(SaveManager.save(recovered,storage).ok,true);assert.equal(SaveManager.load(storage).coins,888);
});

test('level routes canonicalize fractions, infinities and invalid values',()=>{
  assert.equal(normalizeLevelNumber(1.9),1);assert.equal(normalizeLevelNumber(Infinity),1);assert.equal(normalizeLevelNumber(-8),1);assert.equal(normalizeLevelNumber(5000),1000);assert.equal(getLevelConfig('2.9').level,2);
  assert.equal(clampPlayableLevel(4.8,10,1000),4);assert.equal(clampPlayableLevel(Infinity,10,1000),1);assert.equal(levelPageFor(7.9),1);assert.equal(levelsForPage(LEVEL_CONFIGS,1.9).page,1);
});

test('hint is always the first selectable step of its verified continuation',()=>{
  const tiles=[{id:'held-partner',typeId:'a',row:0,col:0,layer:0,alive:true},{id:'cover-a',typeId:'b',row:0,col:0,layer:1,alive:true},{id:'cover-b',typeId:'b',row:0,col:6,layer:1,alive:true}];
  const result=planHint(tiles,[{visualId:'held',typeId:'a'}]);assert.equal(result.ok,true);assert.equal(result.tileId,result.sequence[0]);assert.equal(computeAccessibility(tiles).get(result.tileId).blocked,false);assert.equal(validateSolution(tiles,result.sequence,[{visualId:'held',typeId:'a'}]).solved,true);
});

test('wallet rejects duplicate operation ids with a different payload',()=>{
  const save=fresh();assert.equal(applyWalletTransaction(save,{id:'op',currency:'coins',amount:10,source:'test',metadata:{a:1}}).ok,true);
  assert.equal(applyWalletTransaction(save,{id:'op',currency:'coins',amount:11,source:'test',metadata:{a:1}}).reason,'transaction-id-conflict');
  assert.notEqual(operationId('shop'),operationId('shop'));
});

test('offline daily reward refuses a clock rollback',()=>{
  const save=fresh(),later=Date.parse('2026-10-24T12:00:00Z'),earlier=later-86400000;assert.equal(claimDailyReward(save,later).ok,true);assert.equal(claimDailyReward(save,earlier).reason,'clock-rollback');
});

test('replay reward flags distinguish worse results from real improvements',()=>{
  const save=fresh();completeLevel(save,{level:1,score:2000,combo:5,seconds:50});const worse=completeLevel(save,{level:1,score:1000,combo:2,seconds:80});assert.equal(worse.isNewBestScore,false);assert.equal(worse.isNewBestTime,false);assert.equal(worse.newStars,0);const better=completeLevel(save,{level:1,score:3000,combo:6,seconds:40});assert.equal(better.isNewBestScore,true);assert.equal(better.isNewBestTime,true);
});

test('generation v4 varies silhouettes independently and invalidates only older attempts',()=>{
  assert.equal(LEVEL_GENERATION_VERSION,4);for(const config of LEVEL_CONFIGS.filter((_,i)=>i%97===0)){const level=generateLevel(config);assert.equal(level.validation.solved,true);assert.equal(level.validation.shapeValid,true);assert.equal(level.validation.shapeFallbackUsed,false);assert.notEqual(level.attempt,'fallback');}
  const fruitShapes=new Set(LEVEL_CONFIGS.filter(level=>level.themeId==='fruits').map(level=>level.layoutId));assert.equal(fruitShapes.size,12);
  const migrated=migrateSave({rules:{matchSize:2,generationVersion:3},activeAttempt:{level:1,snapshot:{}},completedLevels:{1:{score:10,stars:1}},coins:999});assert.equal(migrated.activeAttempt,null);assert.equal(migrated.completedLevels[1].score,10);assert.equal(migrated.coins,999);
});
