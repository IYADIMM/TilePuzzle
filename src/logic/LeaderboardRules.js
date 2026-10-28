import { getLevelConfig } from '../data/levels.js';

export const LEADERBOARD_TIERS = Object.freeze([
  { id: 'jade', name: 'Jade', min: 0, color: 0x63c888 },
  { id: 'ruby', name: 'Ruby', min: 1200, color: 0xe45758 },
  { id: 'sapphire', name: 'Sapphire', min: 2800, color: 0x55a9e8 },
  { id: 'gold', name: 'Gold', min: 5200, color: 0xf1c34d },
  { id: 'diamond', name: 'Diamond', min: 8500, color: 0x9be4e8 },
  { id: 'garden-master', name: 'Ivory Master', min: 12500, color: 0xffdf72 }
]);

export function calculateLeaderboardPoints({ level, stars = 1, seconds = 999, combo = 0, boostersUsed = 0, score = 0 }) {
  const difficulty = getLevelConfig(level).difficulty;
  const base = 160 + difficulty * 70;
  const starBonus = Math.max(1, Math.min(3, stars)) * 100;
  const speedBonus = Math.round(Math.max(0, Math.min(180, 240 - Math.max(0, seconds))) * 1.2);
  const comboBonus = Math.min(30, Math.max(0, combo)) * 20;
  const cleanBonus = boostersUsed === 0 ? 120 : 0;
  const scoreBonus=Math.min(300,Math.floor(Math.max(0,score)/100));
  return base + starBonus + speedBonus + comboBonus + cleanBonus + scoreBonus;
}

export function getSeasonId(now = Date.now()) {
  const date = new Date(now), day = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - day);
  date.setUTCHours(0, 0, 0, 0);
  return date.toISOString().slice(0, 10);
}

export function getSeasonEnd(seasonId) {
  const date = new Date(`${seasonId}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + 7);
  return date.getTime();
}

export function getTier(points) {
  let tier = LEADERBOARD_TIERS[0];
  for (const candidate of LEADERBOARD_TIERS) if (points >= candidate.min) tier = candidate;
  const index = LEADERBOARD_TIERS.indexOf(tier), next = LEADERBOARD_TIERS[index + 1] || null;
  return { ...tier, next, progress: next ? (points - tier.min) / (next.min - tier.min) : 1 };
}

export function ensureLeaderboard(save) {
  save.leaderboard ||= {};
  save.leaderboard.player ||= { id: 'garden-player', name: 'Player', avatar: 'jade' };
  if(save.leaderboard.player.name==='Garden Player')save.leaderboard.player.name='Player';
  save.leaderboard.weekly ||= {};
  save.leaderboard.allTime ||= {};
  save.leaderboard.claimedSeasonRewards ||= {};
  return save.leaderboard;
}

export function sumBest(best = {}) {
  return Object.values(best).reduce((sum, result) => sum + (result.points || 0), 0);
}

export function recordLeaderboardResult(save, result, now = Date.now()) {
  const state = ensureLeaderboard(save), seasonId = getSeasonId(now), levelKey = String(result.level);
  state.weekly[seasonId] ||= {};
  const points = calculateLeaderboardPoints(result);
  const previousWeekly = state.weekly[seasonId][levelKey]?.points || 0;
  const previousAllTime = state.allTime[levelKey]?.points || 0;
  const record = { points, stars: result.stars, seconds: result.seconds, combo: result.combo, score:result.score, boostersUsed: result.boostersUsed, updatedAt: now };
  if (points > previousWeekly) state.weekly[seasonId][levelKey] = record;
  if (points > previousAllTime) state.allTime[levelKey] = record;
  const weeklyTotal = sumBest(state.weekly[seasonId]), allTimeTotal = sumBest(state.allTime);
  return { points, earned: Math.max(0, points - previousWeekly), improved: points > previousWeekly, weeklyTotal, allTimeTotal, rankBefore:null, rankAfter:null, seasonId, tier: getTier(weeklyTotal) };
}

export function buildStandings(save, mode = 'weekly', now = Date.now()) {
  const state = ensureLeaderboard(save), seasonId = getSeasonId(now);
  const playerPoints = mode === 'allTime' ? sumBest(state.allTime) : sumBest(state.weekly[seasonId]);
  return [{ ...state.player, points: playerPoints, isPlayer: true, isFriend: true, rank: null }];
}

export function getPlayerRank(save, mode = 'weekly', now = Date.now()) {
  buildStandings(save, mode, now);
  return null;
}

export function projectedSeasonReward(rank) {
  if (rank === 1) return { coins: 1000, label: 'Champion Chest' };
  if (rank <= 3) return { coins: 700, label: 'Podium Chest' };
  if (rank <= 10) return { coins: 400, label: 'Top 10 Chest' };
  return { coins: 100, label: 'Season Chest' };
}

export function claimSeasonReward(save, seasonId, now = Date.now()) {
  ensureLeaderboard(save);
  void seasonId; void now;
  return null;
}
