import { DEFAULT_AUDIO_PREFERENCES,normalizeAudioPreferences } from '../audio/AudioPreferences.js';
import { LEVEL_COUNT } from '../data/levels.js';
import { LEVEL_GENERATION_VERSION,MATCH_SIZE } from '../logic/GameRules.js';

const KEY='jade-garden-tiles-save-v5',BACKUP_KEY='jade-garden-tiles-save-backup-v5';
const LEGACY_KEYS=['jade-garden-tiles-save-v4','jade-garden-tiles-save-backup-v4','jade-garden-tiles-save-v3','jade-garden-tiles-save-v2','jade-garden-tiles-save-v1'];

export const DEFAULT_SAVE=Object.freeze({
  version:5,maxUnlockedLevel:1,lastLevel:1,coins:250,gems:20,xp:0,stars:0,
  lifetimeScore:0,lifetimeCoinsEarned:0,totalMatches:0,totalTriples:0,chestProgress:0,
  rules:{matchSize:MATCH_SIZE,generationVersion:LEVEL_GENERATION_VERSION},activeAttempt:null,
  attemptStats:{abandoned:0,restarted:0},
  completedLevels:{},claimedRewards:{},queuedChestRewards:[],achievements:{},unlockedThemes:['fruits'],
  boosters:{undo:3,hint:3,shuffle:3},
  prefs:{audio:{...DEFAULT_AUDIO_PREFERENCES},haptics:true,reducedMotion:false},
  tutorial:{completed:false,dismissed:false,completedAt:null},
  leaderboard:{player:{id:'garden-player',name:'Garden Player',avatar:'jade'},weekly:{},allTime:{},claimedSeasonRewards:{}},
  economy:{ledger:[],inventory:{owned:['tile-classic','tray-mahogany'],equipped:{tile:'tile-classic',tray:'tray-mahogany',celebration:'celebration-gold'}},daily:{lastClaimDay:null,streak:0},revives:{},entitlements:{}},
  storageRecovery:null
});

export class SaveManager {
  static lastError=null;
  static load(storage=localStorage){
    const candidates=[KEY,BACKUP_KEY,...LEGACY_KEYS];let sawCorrupt=false;
    for(const key of candidates){const encoded=safeGet(storage,key);if(!encoded)continue;try{const save=migrateSave(JSON.parse(encoded));if(key!==KEY)save.storageRecovery={recoveredFrom:key,at:Date.now()};return save;}catch(error){sawCorrupt=true;this.lastError=error;}}
    const fresh=clone(DEFAULT_SAVE);if(sawCorrupt)fresh.storageRecovery={recoveredFrom:null,at:Date.now(),reason:'No valid save copy'};return fresh;
  }
  static save(data,storage=localStorage){
    try{const current=safeGet(storage,KEY);if(current){JSON.parse(current);storage.setItem(BACKUP_KEY,current);}storage.setItem(KEY,JSON.stringify({...data,version:5,storageRecovery:null}));this.lastError=null;return{ok:true};}
    catch(error){this.lastError=error;return{ok:false,error:String(error?.message||error)};}
  }
  static export(data){return JSON.stringify({...data,version:5},null,2);}
  static reset(storage=localStorage){[KEY,BACKUP_KEY,...LEGACY_KEYS].forEach(key=>{try{storage.removeItem(key);}catch{}});return clone(DEFAULT_SAVE);}
}

export function migrateSave(raw={}){
  const base=clone(DEFAULT_SAVE),completedLevels={...(raw.completedLevels||{})};
  const derivedStars=Object.values(completedLevels).reduce((sum,record)=>sum+Math.max(0,Math.min(3,Number(record?.stars)||0)),0);
  const completedCount=Object.keys(completedLevels).length;
  const maxUnlockedLevel=Math.max(1,Number(raw.maxUnlockedLevel)||0,Number(raw.level)||0);
  const economy=raw.economy||{};
  const queuedChestRewards=[...new Set(raw.queuedChestRewards||[])];
  for(let milestone=5;milestone<=completedCount;milestone+=5){const id=`levels:${milestone-4}-${milestone}`;if(!raw.claimedRewards?.[`chest:${id}`]&&!queuedChestRewards.includes(id))queuedChestRewards.push(id);}
  return{
    ...base,...raw,version:5,maxUnlockedLevel:Math.min(LEVEL_COUNT,maxUnlockedLevel),lastLevel:Math.max(1,Math.min(LEVEL_COUNT,Number(raw.lastLevel)||maxUnlockedLevel)),stars:derivedStars,
    completedLevels,claimedRewards:{...(raw.claimedRewards||{})},queuedChestRewards,achievements:{...(raw.achievements||{})},chestProgress:completedCount%5,
    unlockedThemes:[...new Set(raw.unlockedThemes||base.unlockedThemes)],boosters:{...base.boosters,...(raw.boosters||{})},
    leaderboard:{...base.leaderboard,...(raw.leaderboard||{}),player:{...base.leaderboard.player,...(raw.leaderboard?.player||{})},weekly:{...(raw.leaderboard?.weekly||{})},allTime:{...(raw.leaderboard?.allTime||{})},claimedSeasonRewards:{...(raw.leaderboard?.claimedSeasonRewards||{})}},
    economy:{...base.economy,...economy,ledger:[...(economy.ledger||[])],inventory:{...base.economy.inventory,...(economy.inventory||{}),owned:[...new Set(economy.inventory?.owned||base.economy.inventory.owned)],equipped:{...base.economy.inventory.equipped,...(economy.inventory?.equipped||{})}},daily:{...base.economy.daily,...(economy.daily||{})},revives:{...(economy.revives||{})},entitlements:{...(economy.entitlements||{})}},
    prefs:{audio:normalizeAudioPreferences(raw.prefs?.audio),haptics:raw.prefs?.haptics??base.prefs.haptics,reducedMotion:raw.prefs?.reducedMotion??base.prefs.reducedMotion},
    tutorial:{...base.tutorial,...(raw.tutorial||{})},attemptStats:{...base.attemptStats,...(raw.attemptStats||{})},
    totalMatches:Number(raw.totalMatches)||Number(raw.totalTriples)||0,
    rules:{matchSize:MATCH_SIZE,generationVersion:LEVEL_GENERATION_VERSION},
    activeAttempt:raw.rules?.matchSize===MATCH_SIZE&&raw.rules?.generationVersion===LEVEL_GENERATION_VERSION?(raw.activeAttempt||null):null
  };
}

export function abandonActiveAttempt(save,reason='leave'){
  save.attemptStats??={abandoned:0,restarted:0};
  save.attemptStats[reason==='restart'?'restarted':'abandoned']++;
  save.activeAttempt=null;
  return save;
}

function safeGet(storage,key){try{return storage.getItem(key);}catch(error){SaveManager.lastError=error;return null;}}
function clone(value){return JSON.parse(JSON.stringify(value));}
