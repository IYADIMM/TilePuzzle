import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { ActivePlayClock } from '../src/logic/ActivePlayClock.js';
import { createAttemptCheckpoint,operationId } from '../src/logic/AttemptCheckpoint.js';
import { SaveManager,DEFAULT_SAVE,migrateSave } from '../src/systems/SaveManager.js';
import { planHint,planHintAsync } from '../src/logic/BoardActions.js';
import { computeAccessibility,validateSolution } from '../src/logic/LevelSolver.js';
import { applyWalletTransaction } from '../src/economy/WalletLedger.js';
import { claimDailyReward } from '../src/economy/DailyRewardService.js';
import { completeLevel } from '../src/systems/ProgressionManager.js';
import { LEVEL_CONFIGS,getLevelConfig,normalizeLevelNumber } from '../src/data/levels.js';
import { clampPlayableLevel,levelPageFor,levelsForPage } from '../src/logic/LevelNavigation.js';
import { generateLevel } from '../src/logic/LevelGenerator.js';
import { LEVEL_GENERATION_VERSION } from '../src/logic/GameRules.js';
import { claimTreasureReward,commitAbandonAttempt } from '../src/logic/SaveTransactions.js';

const fresh=()=>JSON.parse(JSON.stringify(DEFAULT_SAVE));

test('active play clock excludes modal and background pauses',()=>{
  let now=1000;const clock=new ActivePlayClock(()=>now);now=4000;assert.equal(clock.elapsedMs,3000);clock.pause('modal');now=304000;clock.pause('background');clock.resume('background');assert.equal(clock.elapsedMs,3000);clock.resume('modal');now=306000;assert.equal(clock.elapsedMs,5000);
});

test('duplicate and unknown clock resumes are idempotent',()=>{
  let now=1000;const clock=new ActivePlayClock(()=>now);now=2000;clock.pause('modal');now=5000;clock.resume('modal');now=7000;assert.equal(clock.elapsedMs,3000);
  clock.resume('modal');now=9000;assert.equal(clock.elapsedMs,5000);
  clock.resume('unknown');now=10000;assert.equal(clock.elapsedMs,6000);
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

test('save verification rejects invalid domain values before storage mutation',()=>{
  let writes=0;const storage={getItem:()=>null,setItem:()=>{writes++;},removeItem:()=>{}};
  const save=fresh();save.coins=-100;save.boosters.hint=-3;
  const result=SaveManager.save(save,storage);
  assert.equal(result.ok,false);assert.equal(writes,0);
});

test('treasure and abandon transactions roll back completely when persistence fails',()=>{
  const reward=fresh();reward.queuedChestRewards=['levels:1-5'];reward.coins=250;reward.boosters.hint=3;
  const failedClaim=claimTreasureReward(reward,'levels:1-5',()=>({ok:false,error:'quota'}));
  assert.equal(failedClaim.ok,false);assert.deepEqual(reward.queuedChestRewards,['levels:1-5']);assert.equal(reward.coins,250);assert.equal(reward.boosters.hint,3);assert.equal(reward.claimedRewards['chest:levels:1-5'],undefined);
  const run=fresh();run.activeAttempt={level:1,status:'active',snapshot:{tiles:[],tray:[]}};
  const failedLeave=commitAbandonAttempt(run,'leave',()=>({ok:false,error:'blocked'}));
  assert.equal(failedLeave.ok,false);assert.equal(run.activeAttempt.level,1);assert.equal(run.attemptStats.abandoned,0);
});

test('treasure claim is atomic and cannot be replayed',()=>{
  const save=fresh();save.queuedChestRewards=['levels:1-5'];let writes=0;
  assert.equal(claimTreasureReward(save,'levels:1-5',()=>{writes++;return{ok:true};}).ok,true);
  assert.equal(save.coins,400);assert.equal(save.boosters.hint,4);assert.equal(writes,1);
  assert.equal(claimTreasureReward(save,'levels:1-5',()=>{writes++;return{ok:true};}).ok,false);assert.equal(writes,1);
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

test('cooperative hint solving preserves correctness and honors cancellation',async()=>{
  const level=generateLevel(LEVEL_CONFIGS[199]),result=await planHintAsync(level.tiles,[],24000,level.solution,{yieldEvery:1});assert.equal(result.ok,true);assert.equal(result.tileId,level.solution[0]);
  const cancelled=await planHintAsync(level.tiles,[],24000,[],{yieldEvery:1,isCancelled:()=>true});assert.equal(cancelled.ok,false);assert.equal(cancelled.reason,'cancelled');
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

test('generation v5 varies silhouettes independently and invalidates only unsupported attempts',()=>{
  assert.equal(LEVEL_GENERATION_VERSION,5);for(const config of LEVEL_CONFIGS.filter((_,i)=>i%97===0)){const level=generateLevel(config);assert.equal(level.validation.solved,true);assert.equal(level.validation.shapeValid,true);assert.equal(level.validation.shapeFallbackUsed,false);assert.notEqual(level.attempt,'fallback');}
  const fruitShapes=new Set(LEVEL_CONFIGS.filter(level=>level.themeId==='fruits').map(level=>level.layoutId));assert.equal(fruitShapes.size,12);
  const migrated=migrateSave({rules:{matchSize:2,generationVersion:3},activeAttempt:{level:1,snapshot:{}},completedLevels:{1:{score:10,stars:1}},coins:999});assert.equal(migrated.activeAttempt,null);assert.equal(migrated.completedLevels[1].score,10);assert.equal(migrated.coins,999);
});

test('valid generation v4 active attempts remain pinned while permanent progress migrates to v5',()=>{
  const snapshot={score:0,tray:[],tiles:[{id:'L1-T0',typeId:'cherries'}]},legacy=migrateSave({rules:{matchSize:2,generationVersion:4},activeAttempt:{level:1,status:'active',elapsedMs:10,snapshot,history:[]},completedLevels:{1:{score:10,stars:1}}});
  assert.equal(legacy.rules.generationVersion,5);assert.equal(legacy.activeAttempt.generationVersion,4);assert.equal(getLevelConfig(1,legacy.activeAttempt.generationVersion).generationVersion,4);
});

test('generation v4 compatibility hashes remain frozen for existing attempts',()=>{
  const expected=new Map([[1,'0aa2fdca36638462c8e089d710814910ad3ff180acf109debc09bb57519870b1'],[25,'43bdd1c3e56587020800a41825cc13a61c16a1fcea65133ff603f0aebe96b66e'],[100,'916c656adef4ef875dcd7362b310383bbf7d8c3b5853f39118d713b0d9835a9b'],[500,'c0ea7e18ccedefc2c2e9c69c225acec19da53b9de47cd839f4e9e4dca756a2b6'],[1000,'cddc87d5592e9178ca96c5a36165316a95d5fb7e3c94d031d8b34bd98dbebd77']]);
  for(const [number,hash] of expected){const level=generateLevel(getLevelConfig(number,4)),canonical=level.tiles.map(tile=>`${tile.layer}:${tile.row}:${tile.col}:${tile.typeId}`).sort().join('|');assert.equal(createHash('sha256').update(canonical).digest('hex'),hash,`v4 level ${number}`);}
});
