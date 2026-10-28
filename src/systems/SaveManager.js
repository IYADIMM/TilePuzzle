import { DEFAULT_AUDIO_PREFERENCES,normalizeAudioPreferences } from '../audio/AudioPreferences.js';
import { LEVEL_COUNT } from '../data/levels.js';
import { LEVEL_GENERATION_VERSION,MATCH_SIZE,SUPPORTED_GENERATION_VERSIONS } from '../logic/GameRules.js';
import { normalizeTileStyle,TILE_STYLE_IDS,TILE_STYLE_VERSION } from '../art/TileStyleRegistry.js';
import { defaultSaveStorage } from '../qa/DevQaProfile.js';

const KEY='jade-garden-tiles-save-v5',BACKUP_KEY='jade-garden-tiles-save-backup-v5';
const LEGACY_KEYS=['jade-garden-tiles-save-v4','jade-garden-tiles-save-backup-v4','jade-garden-tiles-save-v3','jade-garden-tiles-save-v2','jade-garden-tiles-save-v1'];

export const DEFAULT_SAVE=Object.freeze({
  version:6,maxUnlockedLevel:1,lastLevel:1,coins:250,gems:20,xp:0,stars:0,
  lifetimeScore:0,lifetimeCoinsEarned:0,totalMatches:0,totalTriples:0,chestProgress:0,
  rules:{matchSize:MATCH_SIZE,generationVersion:LEVEL_GENERATION_VERSION},activeAttempt:null,
  attemptStats:{abandoned:0,restarted:0},
  completedLevels:{},claimedRewards:{},queuedChestRewards:[],achievements:{},unlockedThemes:['fruits'],
  boosters:{undo:3,hint:3,shuffle:3},
  prefs:{audio:{...DEFAULT_AUDIO_PREFERENCES},haptics:true,reducedMotion:false,tileStyle:TILE_STYLE_IDS.ILLUSTRATED,tileStyleVersion:TILE_STYLE_VERSION},
  tutorial:{completed:false,dismissed:false,completedAt:null},
  leaderboard:{player:{id:'garden-player',name:'Garden Player',avatar:'jade'},weekly:{},allTime:{},claimedSeasonRewards:{}},
  economy:{ledger:[],inventory:{owned:['tile-classic','tray-mahogany'],equipped:{tile:'tile-classic',tray:'tray-mahogany',celebration:'celebration-gold'}},daily:{lastClaimDay:null,streak:0},revives:{},entitlements:{}},
  storageRecovery:null
});

export class SaveManager {
  static lastError=null;
  static load(storage){storage??=defaultSaveStorage();
    const candidates=[KEY,BACKUP_KEY,...LEGACY_KEYS];let sawCorrupt=false;
    for(const key of candidates){const encoded=safeGet(storage,key);if(!encoded)continue;try{const save=migrateSave(JSON.parse(encoded)),validation=validateSaveDomain(save);if(!validation.ok)throw new Error(`Invalid migrated save: ${validation.errors.join(', ')}`);if(key!==KEY){save.storageRecovery={recoveredFrom:key,at:Date.now()};repairPrimary(storage,save);}return save;}catch(error){sawCorrupt=true;this.lastError=error;}}
    const fresh=clone(DEFAULT_SAVE);if(sawCorrupt)fresh.storageRecovery={recoveredFrom:null,at:Date.now(),reason:'No valid save copy'};return fresh;
  }
  static save(data,storage){storage??=defaultSaveStorage();
    try{const validation=validateSaveDomain(data);if(!validation.ok)throw new Error(`Invalid save data: ${validation.errors.join(', ')}`);const current=safeGet(storage,KEY),encoded=JSON.stringify({...data,version:6,storageRecovery:null});if(current&&isValidEncodedSave(current))storage.setItem(BACKUP_KEY,current);storage.setItem(KEY,encoded);if(safeGet(storage,KEY)!==encoded)throw new Error('Save verification failed');this.lastError=null;return{ok:true};}
    catch(error){this.lastError=error;return{ok:false,error:String(error?.message||error)};}
  }
  static export(data){return JSON.stringify({...data,version:6},null,2);}
  static reset(storage){storage??=defaultSaveStorage();[KEY,BACKUP_KEY,...LEGACY_KEYS].forEach(key=>{try{storage.removeItem(key);}catch{}});return clone(DEFAULT_SAVE);}
}

export function validateSaveDomain(save){
  const errors=[];
  const nonNegativeInteger=(value,name)=>{if(!Number.isInteger(value)||value<0)errors.push(name);};
  if(!save||typeof save!=='object'||Array.isArray(save))return{ok:false,errors:['root']};
  nonNegativeInteger(save.coins,'coins');nonNegativeInteger(save.gems,'gems');nonNegativeInteger(save.xp,'xp');nonNegativeInteger(save.stars,'stars');
  nonNegativeInteger(save.lifetimeScore,'lifetimeScore');nonNegativeInteger(save.lifetimeCoinsEarned,'lifetimeCoinsEarned');nonNegativeInteger(save.totalMatches,'totalMatches');
  if(!Number.isInteger(save.maxUnlockedLevel)||save.maxUnlockedLevel<1||save.maxUnlockedLevel>LEVEL_COUNT)errors.push('maxUnlockedLevel');
  if(!Number.isInteger(save.lastLevel)||save.lastLevel<1||save.lastLevel>LEVEL_COUNT)errors.push('lastLevel');
  for(const key of ['undo','hint','shuffle'])nonNegativeInteger(save.boosters?.[key],`boosters.${key}`);
  for(const [level,record] of Object.entries(save.completedLevels||{})){
    const number=Number(level);if(!Number.isInteger(number)||number<1||number>LEVEL_COUNT){errors.push(`completedLevels.${level}`);continue;}
    if(!record||typeof record!=='object'||!Number.isFinite(record.score)||record.score<0||!Number.isInteger(record.stars)||record.stars<0||record.stars>3)errors.push(`completedLevels.${level}`);
  }
  if(save.activeAttempt!=null){
    const attempt=save.activeAttempt;
    if(!isAttemptCheckpointValid(attempt))errors.push('activeAttempt');
  }
  return{ok:errors.length===0,errors};
}

export function migrateSave(raw={}){
  if(!raw||typeof raw!=='object'||Array.isArray(raw))raw={};
  const base=clone(DEFAULT_SAVE),completedLevels={};
  for(const [key,record] of Object.entries(objectOrEmpty(raw.completedLevels))){const level=Number(key);if(!Number.isInteger(level)||level<1||level>LEVEL_COUNT||!record||typeof record!=='object')continue;completedLevels[level]={score:nonNegativeInt(record.score),stars:clampInt(record.stars,0,3),bestTime:nonNegativeNumber(record.bestTime)};}
  const derivedStars=Object.values(completedLevels).reduce((sum,record)=>sum+record.stars,0);
  const completedCount=Object.keys(completedLevels).length;
  const maxUnlockedLevel=Math.max(1,positiveInt(raw.maxUnlockedLevel),positiveInt(raw.level));
  const economy=objectOrEmpty(raw.economy);
  const claimedRewards=Object.fromEntries(Object.entries(objectOrEmpty(raw.claimedRewards)).filter(([key,value])=>typeof key==='string'&&value===true));
  const queuedChestRewards=[...new Set(arrayOrEmpty(raw.queuedChestRewards).filter(value=>typeof value==='string'&&/^levels:\d+-\d+$/.test(value)))];
  for(let milestone=5;milestone<=completedCount;milestone+=5){const id=`levels:${milestone-4}-${milestone}`;if(!raw.claimedRewards?.[`chest:${id}`]&&!queuedChestRewards.includes(id))queuedChestRewards.push(id);}
  const attemptedVersion=Number(raw.activeAttempt?.generationVersion??raw.rules?.generationVersion),activeAttempt=raw.rules?.matchSize===MATCH_SIZE&&SUPPORTED_GENERATION_VERSIONS.includes(attemptedVersion)&&isAttemptCheckpointValid(raw.activeAttempt)?{...clone(raw.activeAttempt),generationVersion:attemptedVersion}:null;
  return{
    ...base,...raw,version:6,maxUnlockedLevel:Math.min(LEVEL_COUNT,maxUnlockedLevel),lastLevel:clampInt(raw.lastLevel||maxUnlockedLevel,1,LEVEL_COUNT),coins:nonNegativeInt(raw.coins,base.coins),gems:nonNegativeInt(raw.gems,base.gems),xp:nonNegativeInt(raw.xp),stars:derivedStars,lifetimeScore:nonNegativeInt(raw.lifetimeScore),lifetimeCoinsEarned:nonNegativeInt(raw.lifetimeCoinsEarned),totalMatches:nonNegativeInt(raw.totalMatches||raw.totalTriples),totalTriples:0,
    completedLevels,claimedRewards,queuedChestRewards,achievements:objectOrEmpty(raw.achievements),chestProgress:completedCount%5,
    unlockedThemes:[...new Set(arrayOrEmpty(raw.unlockedThemes).filter(value=>typeof value==='string').length?arrayOrEmpty(raw.unlockedThemes).filter(value=>typeof value==='string'):base.unlockedThemes)],boosters:{undo:nonNegativeInt(raw.boosters?.undo,base.boosters.undo),hint:nonNegativeInt(raw.boosters?.hint,base.boosters.hint),shuffle:nonNegativeInt(raw.boosters?.shuffle,base.boosters.shuffle)},
    leaderboard:{...base.leaderboard,...objectOrEmpty(raw.leaderboard),player:{...base.leaderboard.player,...objectOrEmpty(raw.leaderboard?.player)},weekly:objectOrEmpty(raw.leaderboard?.weekly),allTime:objectOrEmpty(raw.leaderboard?.allTime),claimedSeasonRewards:objectOrEmpty(raw.leaderboard?.claimedSeasonRewards)},
    economy:{...base.economy,...economy,ledger:arrayOrEmpty(economy.ledger).filter(validLedgerEntry),inventory:{...base.economy.inventory,...objectOrEmpty(economy.inventory),owned:[...new Set(arrayOrEmpty(economy.inventory?.owned).filter(value=>typeof value==='string').length?arrayOrEmpty(economy.inventory?.owned).filter(value=>typeof value==='string'):base.economy.inventory.owned)],equipped:{...base.economy.inventory.equipped,...objectOrEmpty(economy.inventory?.equipped)}},daily:{...base.economy.daily,...objectOrEmpty(economy.daily)},revives:objectOrEmpty(economy.revives),entitlements:objectOrEmpty(economy.entitlements)},
    prefs:{audio:normalizeAudioPreferences(raw.prefs?.audio),haptics:raw.prefs?.haptics??base.prefs.haptics,reducedMotion:raw.prefs?.reducedMotion??base.prefs.reducedMotion,tileStyle:normalizeTileStyle(raw.prefs?.tileStyle),tileStyleVersion:TILE_STYLE_VERSION},
    tutorial:{...base.tutorial,...objectOrEmpty(raw.tutorial)},attemptStats:{abandoned:nonNegativeInt(raw.attemptStats?.abandoned),restarted:nonNegativeInt(raw.attemptStats?.restarted)},
    rules:{matchSize:MATCH_SIZE,generationVersion:LEVEL_GENERATION_VERSION},
    activeAttempt
  };
}

export function abandonActiveAttempt(save,reason='leave'){
  save.attemptStats??={abandoned:0,restarted:0};
  save.attemptStats[reason==='restart'?'restarted':'abandoned']++;
  save.activeAttempt=null;
  return save;
}

function safeGet(storage,key){try{return storage.getItem(key);}catch(error){SaveManager.lastError=error;return null;}}
function isValidEncodedSave(encoded){try{return validateSaveDomain(migrateSave(JSON.parse(encoded))).ok;}catch{return false;}}
function repairPrimary(storage,save){try{const encoded=JSON.stringify({...save,version:6});storage.setItem(KEY,encoded);if(safeGet(storage,KEY)!==encoded)throw new Error('Recovered save verification failed');SaveManager.lastError=null;return true;}catch(error){SaveManager.lastError=error;return false;}}
function clone(value){return JSON.parse(JSON.stringify(value));}
function objectOrEmpty(value){return value&&typeof value==='object'&&!Array.isArray(value)?value:{};}
function arrayOrEmpty(value){return Array.isArray(value)?value:[];}
function nonNegativeInt(value,fallback=0){const number=Number(value);return Number.isFinite(number)&&number>=0?Math.floor(number):fallback;}
function positiveInt(value){const number=Number(value);return Number.isFinite(number)&&number>0?Math.floor(number):0;}
function clampInt(value,min,max){return Math.max(min,Math.min(max,Math.floor(Number(value)||0)));}
function nonNegativeNumber(value){const number=Number(value);return Number.isFinite(number)&&number>=0?number:0;}
function validLedgerEntry(entry){return Boolean(entry&&typeof entry.id==='string'&&['coins','gems'].includes(entry.currency)&&Number.isInteger(entry.amount)&&entry.amount!==0&&typeof entry.source==='string');}
function isAttemptCheckpointValid(attempt){
  if(!attempt||typeof attempt!=='object'||!Number.isInteger(attempt.level)||attempt.level<1||attempt.level>LEVEL_COUNT||!['active','lost'].includes(attempt.status)||!attempt.snapshot||typeof attempt.snapshot!=='object')return false;
  const {tiles,tray}=attempt.snapshot;if(!Array.isArray(tiles)||!Array.isArray(tray)||tray.length>4)return false;
  const ids=new Set();for(const tile of tiles){if(!tile||typeof tile.id!=='string'||!tile.id||ids.has(tile.id)||typeof tile.typeId!=='string'||!tile.typeId)return false;ids.add(tile.id);}
  const trayIds=new Set();for(const entry of tray){if(!entry||typeof entry.visualId!=='string'||!ids.has(entry.visualId)||trayIds.has(entry.visualId)||typeof entry.typeId!=='string'||!entry.typeId)return false;trayIds.add(entry.visualId);}
  return Number.isFinite(Number(attempt.elapsedMs))&&Number(attempt.elapsedMs)>=0&&(!attempt.history||Array.isArray(attempt.history));
}
