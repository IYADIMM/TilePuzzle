import { buildStandings, ensureLeaderboard, getSeasonEnd, getSeasonId, getTier, sumBest } from '../logic/LeaderboardRules.js';

// The scene talks to this provider-shaped facade. A production API can replace
// these methods without coupling network timing to the game or reward reducer.
export class LeaderboardManager {
  constructor(save, now = Date.now()) { this.save = save; this.now = now; ensureLeaderboard(save); }
  get seasonId(){ return getSeasonId(this.now); }
  get seasonEndsAt(){ return getSeasonEnd(this.seasonId); }
  get secondsRemaining(){ return Math.max(0, Math.floor((this.seasonEndsAt-this.now)/1000)); }
  standings(mode='weekly'){ return buildStandings(this.save,mode,this.now); }
  player(mode='weekly'){ return this.standings(mode).find(row=>row.isPlayer); }
  summary(){
    const weekly=sumBest(this.save.leaderboard.weekly[this.seasonId]), allTime=sumBest(this.save.leaderboard.allTime);
    return { weekly, allTime, rank:null, tier:getTier(weekly), reward:null, seasonId:this.seasonId, secondsRemaining:this.secondsRemaining };
  }
}
