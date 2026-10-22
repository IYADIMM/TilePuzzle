const KEY = 'jade-garden-tiles-save-v3';
const LEGACY_KEYS = ['jade-garden-tiles-save-v2','jade-garden-tiles-save-v1'];
export const DEFAULT_SAVE = Object.freeze({
  version: 3, maxUnlockedLevel: 1, lastLevel: 1, coins: 250, xp: 0, stars: 0,
  lifetimeScore: 0, lifetimeCoinsEarned: 0, totalTriples: 0,
  chestProgress: 0, completedLevels: {}, claimedRewards: {}, achievements: {}, unlockedThemes: ['fruits'],
  boosters: { undo: 3, hint: 3, shuffle: 3 },
  prefs: { audioDisabled: true, haptics: true, reducedMotion: false },
  leaderboard: { player: { id:'garden-player',name:'Garden Player',avatar:'jade' }, weekly:{}, allTime:{}, claimedSeasonRewards:{} }
});

export class SaveManager {
  static load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || LEGACY_KEYS.map(key=>localStorage.getItem(key)).find(Boolean) || '{}');
      return migrate(raw);
    } catch { return clone(DEFAULT_SAVE); }
  }
  static save(data) { localStorage.setItem(KEY, JSON.stringify({ ...data, version: 3 })); }
  static reset() { localStorage.removeItem(KEY); LEGACY_KEYS.forEach(key=>localStorage.removeItem(key)); return clone(DEFAULT_SAVE); }
}

function migrate(raw) {
  const base = clone(DEFAULT_SAVE);
  const legacyLevel = raw.level || raw.maxUnlockedLevel;
  const legacyPrefs = raw.prefs || {};
  return {
    ...base, ...raw, version: 3,
    maxUnlockedLevel: Math.max(1, legacyLevel || 1), lastLevel: raw.lastLevel || legacyLevel || 1,
    completedLevels: { ...base.completedLevels, ...(raw.completedLevels || {}) },
    claimedRewards: { ...base.claimedRewards, ...(raw.claimedRewards || {}) },
    achievements: { ...base.achievements, ...(raw.achievements || {}) },
    unlockedThemes: [...new Set(raw.unlockedThemes || base.unlockedThemes)],
    boosters: { ...base.boosters, ...(raw.boosters || {}) },
    leaderboard: {
      ...base.leaderboard, ...(raw.leaderboard || {}),
      player:{...base.leaderboard.player,...(raw.leaderboard?.player||{})},
      weekly:{...(raw.leaderboard?.weekly||{})},allTime:{...(raw.leaderboard?.allTime||{})},
      claimedSeasonRewards:{...(raw.leaderboard?.claimedSeasonRewards||{})}
    },
    // Audio is intentionally not a preference anymore. Discard legacy sound/music
    // keys so an old save cannot resurrect audio infrastructure in a future scene.
    prefs: {
      audioDisabled: true,
      haptics: legacyPrefs.haptics ?? base.prefs.haptics,
      reducedMotion: legacyPrefs.reducedMotion ?? base.prefs.reducedMotion
    }
  };
}
function clone(value) { return JSON.parse(JSON.stringify(value)); }
