import { getThemeForLevel } from '../data/themes.js';
import { recordLeaderboardResult } from '../logic/LeaderboardRules.js';
import { calculateStarRating } from '../logic/PerformanceRules.js';
import { LEVEL_COUNT } from '../data/levels.js';

export const ACHIEVEMENTS = Object.freeze([
  { id: 'first-clear', title: 'First Bloom', target: 1, stat: 'levels', reward: 75 },
  { id: 'pair-five', title: 'Perfect Pairing', target: 5, stat: 'bestCombo', reward: 100 },
  { id: 'collector-six', title: 'Curious Collector', target: 6, stat: 'themes', reward: 150 },
  { id: 'star-thirty', title: 'Golden Garden', target: 30, stat: 'stars', reward: 225 },
  { id: 'master-twenty', title: 'Tile Master', target: 20, stat: 'levels', reward: 350 }
]);

export function completeLevel(save, { level, score, combo, totalMatches = 0, totalTriples = 0, boostersUsed = 0, seconds = 0 }) {
  const coinsBefore=save.coins||0;
  const firstClear = !save.completedLevels[level];
  const stars = calculateStarRating({level,score,seconds});
  const prior = save.completedLevels[level] || {};
  const starDelta=Math.max(0,stars-(prior.stars||0));
  const isNewBestScore=firstClear||score>(prior.score||0);
  const isNewBestTime=firstClear||!prior.bestTime||(seconds>0&&seconds<prior.bestTime);
  save.completedLevels[level] = { score: Math.max(score, prior.score || 0), stars: Math.max(stars, prior.stars || 0), bestTime: prior.bestTime ? Math.min(seconds, prior.bestTime) : seconds };
  save.maxUnlockedLevel = Math.max(save.maxUnlockedLevel, Math.min(LEVEL_COUNT, level + 1));
  save.lastLevel = Math.min(LEVEL_COUNT, level + 1);
  const rewardKey = `level:${level}`;
  const coins = firstClear && !save.claimedRewards[rewardKey] ? 50 + stars * 25 : 0;
  if (coins) {
    save.claimedRewards[rewardKey] = true; save.coins += coins; save.xp += 40 + stars * 15;
  }
  save.stars=(save.stars||0)+starDelta;
  const completedCount=Object.keys(save.completedLevels).length;
  save.queuedChestRewards ||= [];
  if(firstClear&&completedCount%5===0){const milestoneId=`levels:${completedCount-4}-${completedCount}`;if(!save.claimedRewards[`chest:${milestoneId}`]&&!save.queuedChestRewards.includes(milestoneId))save.queuedChestRewards.push(milestoneId);}
  save.chestProgress=completedCount%5;
  const theme = getThemeForLevel(level + 1);
  if (!save.unlockedThemes.includes(theme.id) && save.maxUnlockedLevel >= level + 1) save.unlockedThemes.push(theme.id);
  const unlockedAchievements = evaluateAchievements(save, combo);
  const leaderboard = recordLeaderboardResult(save,{ level,stars,seconds,combo,score,boostersUsed });
  save.lifetimeScore=(save.lifetimeScore||0)+score;
  save.lifetimeCoinsEarned=(save.lifetimeCoinsEarned||0)+Math.max(0,save.coins-coinsBefore);
  save.totalMatches=(save.totalMatches||0)+Math.max(0,totalMatches||totalTriples);
  return { firstClear, stars, starDelta, coins, isNewBestScore, isNewBestTime, newStars:starDelta, unlockedAchievements, leaderboard };
}

export function evaluateAchievements(save, combo = 0) {
  const stats = achievementStats(save,combo);
  save.bestCombo = stats.bestCombo;
  return ACHIEVEMENTS.filter(a => stats[a.stat] >= a.target && !save.achievements[a.id]).map(a => {
    save.achievements[a.id] = { claimed: true, at: Date.now() }; save.coins += a.reward; return a;
  });
}

export function getAchievementProgress(save){const stats=achievementStats(save,save.bestCombo||0);return Object.fromEntries(ACHIEVEMENTS.map(item=>[item.id,{current:Math.min(item.target,stats[item.stat]||0),target:item.target,complete:Boolean(save.achievements[item.id])}]));}
function achievementStats(save,combo=0){return{levels:Object.keys(save.completedLevels||{}).length,bestCombo:Math.max(combo,save.bestCombo||0),themes:(save.unlockedThemes||[]).length,stars:save.stars||0};}

export function completeGardenTreasures(save,{score,seconds}){
  const state=save.bonusContent?.gardenTreasures;
  if(!state||state.unlocked===false)return{ok:false,reason:'locked'};
  const priorStars=state.stars||0,priorScore=state.bestScore||0,priorTime=state.bestTime||0;
  const firstClear=!state.completed,stars=calculateStarRating({level:10,score,seconds}),rewardKey='bonus:garden-treasures:first-clear';
  const reward=firstClear&&!save.claimedRewards[rewardKey]?200:0;
  state.completed=true;state.bestScore=Math.max(state.bestScore||0,score||0);state.bestTime=state.bestTime?Math.min(state.bestTime,seconds):seconds;state.stars=Math.max(state.stars||0,stars);
  if(reward){save.claimedRewards[rewardKey]=true;state.rewardClaimed=true;save.coins+=reward;save.lifetimeCoinsEarned=(save.lifetimeCoinsEarned||0)+reward;}
  return{ok:true,firstClear,stars,coins:reward,newStars:Math.max(0,stars-priorStars),isNewBestScore:firstClear||score>priorScore,isNewBestTime:firstClear||!priorTime||seconds<priorTime,unlockedAchievements:[],leaderboard:null};
}
