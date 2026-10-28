import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_SAVE } from '../src/systems/SaveManager.js';
import { buildStandings, calculateLeaderboardPoints, claimSeasonReward, getSeasonId, getTier, recordLeaderboardResult, sumBest } from '../src/logic/LeaderboardRules.js';
import { completeLevel } from '../src/systems/ProgressionManager.js';

const fresh=()=>JSON.parse(JSON.stringify(DEFAULT_SAVE));
const MONDAY=Date.parse('2026-10-19T12:00:00Z');

test('higher-quality clears earn more leaderboard points',()=>{
  const modest=calculateLeaderboardPoints({level:1,stars:1,seconds:220,combo:1,boostersUsed:2});
  const perfect=calculateLeaderboardPoints({level:1,stars:3,seconds:45,combo:8,boostersUsed:0});
  const difficult=calculateLeaderboardPoints({level:401,stars:3,seconds:45,combo:8,boostersUsed:0});
  assert.ok(perfect>modest);assert.ok(difficult>perfect);
});

test('only the best result per level contributes so easy stages cannot be farmed',()=>{
  const save=fresh(),result={level:1,stars:3,seconds:60,combo:5,boostersUsed:0};
  const first=recordLeaderboardResult(save,result,MONDAY),second=recordLeaderboardResult(save,result,MONDAY+1000);
  assert.ok(first.earned>0);assert.equal(second.earned,0);assert.equal(second.weeklyTotal,first.weeklyTotal);
  const improved=recordLeaderboardResult(save,{...result,seconds:30,combo:7},MONDAY+2000);
  assert.ok(improved.earned>0);assert.equal(improved.weeklyTotal,first.weeklyTotal+improved.earned);
});

test('weekly seasons reset while all-time best persists',()=>{
  const save=fresh();recordLeaderboardResult(save,{level:1,stars:3,seconds:50,combo:4,boostersUsed:0},MONDAY);
  const nextWeek=MONDAY+7*86400000;
  assert.equal(sumBest(save.leaderboard.weekly[getSeasonId(nextWeek)]),0);
  assert.ok(sumBest(save.leaderboard.allTime)>0);
  assert.equal(buildStandings(save,'weekly',nextWeek).find(row=>row.isPlayer).points,0);
});

test('standings expose only truthful local player records without simulated rivals',()=>{
  const save=fresh();recordLeaderboardResult(save,{level:1,stars:3,seconds:20,combo:12,boostersUsed:0},MONDAY);
  const all=buildStandings(save,'weekly',MONDAY),friends=buildStandings(save,'friends',MONDAY);
  assert.equal(all.length,1);assert.equal(friends.length,1);assert.equal(all[0].isPlayer,true);assert.equal(all[0].rank,null);
});

test('level completion records leaderboard points and reports rank movement',()=>{
  const save=fresh(),reward=completeLevel(save,{level:1,score:1200,combo:6,seconds:42,boostersUsed:0});
  assert.equal(reward.leaderboard.improved,true);assert.ok(reward.leaderboard.earned>0);assert.equal(reward.leaderboard.rankAfter,null);
});

test('offline records never mint fake competitive season rewards',()=>{
  const save=fresh();recordLeaderboardResult(save,{level:1,stars:3,seconds:30,combo:8,boostersUsed:0},MONDAY);
  const season=getSeasonId(MONDAY);assert.equal(claimSeasonReward(save,season,MONDAY),null);
  const coins=save.coins;assert.equal(claimSeasonReward(save,season,MONDAY+8*86400000),null);assert.equal(save.coins,coins);
});

test('league tiers advance with points',()=>{assert.equal(getTier(0).id,'jade');assert.equal(getTier(3000).id,'sapphire');assert.equal(getTier(13000).id,'garden-master');});
