import { getThemeForLevel } from '../data/themes.js';
import { recordLeaderboardResult } from '../logic/LeaderboardRules.js';
import { calculateStarRating } from '../logic/PerformanceRules.js';

export const ACHIEVEMENTS = Object.freeze([
  { id: 'first-clear', title: 'First Bloom', target: 1, stat: 'levels', reward: 75 },
  { id: 'triple-five', title: 'Triple Talent', target: 5, stat: 'bestCombo', reward: 100 },
  { id: 'collector-six', title: 'Curious Collector', target: 6, stat: 'themes', reward: 150 },
  { id: 'star-thirty', title: 'Golden Garden', target: 30, stat: 'stars', reward: 225 },
  { id: 'master-twenty', title: 'Tile Master', target: 20, stat: 'levels', reward: 350 }
]);

export function completeLevel(save, { level, score, combo, totalTriples = 0, boostersUsed = 0, seconds = 0 }) {
  const coinsBefore=save.coins||0;
  const firstClear = !save.completedLevels[level];
  const stars = calculateStarRating({level,score,seconds});
  const prior = save.completedLevels[level] || {};
  const starDelta=Math.max(0,stars-(prior.stars||0));
  save.completedLevels[level] = { score: Math.max(score, prior.score || 0), stars: Math.max(stars, prior.stars || 0), bestTime: prior.bestTime ? Math.min(seconds, prior.bestTime) : seconds };
  save.maxUnlockedLevel = Math.max(save.maxUnlockedLevel, Math.min(30, level + 1));
  save.lastLevel = Math.min(30, level + 1);
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
  save.totalTriples=(save.totalTriples||0)+Math.max(0,totalTriples);
  return { firstClear, stars, starDelta, coins, unlockedAchievements, leaderboard };
}

export function evaluateAchievements(save, combo = 0) {
  const stats = { levels: Object.keys(save.completedLevels).length, bestCombo: Math.max(combo, save.bestCombo || 0), themes: save.unlockedThemes.length, stars: save.stars };
  save.bestCombo = stats.bestCombo;
  return ACHIEVEMENTS.filter(a => stats[a.stat] >= a.target && !save.achievements[a.id]).map(a => {
    save.achievements[a.id] = { claimed: true, at: Date.now() }; save.coins += a.reward; return a;
  });
}
