const root='/assets/audio';

export const AUDIO_KEYS=Object.freeze({
  tileSelect:'audio:tile-select',tileSelectB:'audio:tile-select-b',tileSelectC:'audio:tile-select-c',tilePlaceA:'audio:tile-place-a',tilePlaceB:'audio:tile-place-b',tileMatch:'audio:tile-match',tileBlocked:'audio:tile-blocked',combo:'audio:combo',uiClick:'audio:ui-click',booster:'audio:booster',chestOpen:'audio:chest-open',levelFailed:'audio:level-failed',undo:'audio:undo',shuffle:'audio:shuffle',starEarned:'audio:star-earned',levelComplete:'audio:level-complete',levelCompleteB:'audio:level-complete-b',levelCompleteC:'audio:level-complete-c',musicMenu:'audio:music-menu',musicGameplay:'audio:music-gameplay'
});

export const AUDIO_ASSETS=Object.freeze([
  asset(AUDIO_KEYS.tileSelect,['tile_select.mp3'],'ElevenLabs original'),
  asset(AUDIO_KEYS.tileSelectB,['tile_select_variant_b.wav'],'original procedural master'),
  asset(AUDIO_KEYS.tileSelectC,['tile_select_variant_c.wav'],'original procedural master'),
  asset(AUDIO_KEYS.tilePlaceA,['tile_place_v2_A.ogg','tile_place_v2_A.mp3']),
  asset(AUDIO_KEYS.tilePlaceB,['tile_place_v2_B.ogg','tile_place_v2_B.mp3']),
  asset(AUDIO_KEYS.tileMatch,['tile_match.ogg','tile_match.mp3']),
  asset(AUDIO_KEYS.tileBlocked,['tile_blocked.ogg','tile_blocked.mp3']),
  asset(AUDIO_KEYS.combo,['combo.ogg','combo.mp3']),
  asset(AUDIO_KEYS.uiClick,['ui_click.ogg','ui_click.mp3']),
  asset(AUDIO_KEYS.booster,['booster.ogg','booster.mp3']),
  asset(AUDIO_KEYS.chestOpen,['chest_open.ogg','chest_open.mp3']),
  asset(AUDIO_KEYS.levelFailed,['level_failed.ogg','level_failed.mp3']),
  asset(AUDIO_KEYS.undo,['undo_optional.ogg','undo_optional.mp3']),
  asset(AUDIO_KEYS.shuffle,['shuffle_optional.ogg','shuffle_optional.mp3']),
  asset(AUDIO_KEYS.starEarned,['star_earned_optional.ogg','star_earned_optional.mp3']),
  asset(AUDIO_KEYS.levelComplete,['level_complete.mp3'],'ElevenLabs original'),
  asset(AUDIO_KEYS.levelCompleteB,['level_complete_variant_b.wav'],'original procedural master'),
  asset(AUDIO_KEYS.levelCompleteC,['level_complete_variant_c.wav'],'original procedural master'),
  asset(AUDIO_KEYS.musicMenu,['music_menu_ambient.ogg','music_menu_ambient.mp3']),
  asset(AUDIO_KEYS.musicGameplay,['music_gameplay_ambient.ogg','music_gameplay_ambient.mp3'])
]);

export const SFX_EVENTS=Object.freeze({
  tile_select:variantRule([AUDIO_KEYS.tileSelect,AUDIO_KEYS.tileSelectB,AUDIO_KEYS.tileSelectC],.34,65,2),
  tile_place_a:rule(AUDIO_KEYS.tilePlaceA,.3,70,2),
  tile_place_b:rule(AUDIO_KEYS.tilePlaceB,.24,70,2),
  tile_match:rule(AUDIO_KEYS.tileMatch,.34,180,1),
  tile_blocked:rule(AUDIO_KEYS.tileBlocked,.26,160,1),
  combo:rule(AUDIO_KEYS.combo,.3,300,1),
  ui_click:rule(AUDIO_KEYS.uiClick,.2,75,2),
  booster:rule(AUDIO_KEYS.booster,.3,180,1),
  chest_open:rule(AUDIO_KEYS.chestOpen,.32,600,1),
  level_failed:rule(AUDIO_KEYS.levelFailed,.28,1000,1),
  undo:rule(AUDIO_KEYS.undo,.26,180,1),
  shuffle:rule(AUDIO_KEYS.shuffle,.25,250,1),
  star_earned:rule(AUDIO_KEYS.starEarned,.22,300,1),
  level_complete:variantRule([AUDIO_KEYS.levelComplete,AUDIO_KEYS.levelCompleteB,AUDIO_KEYS.levelCompleteC],.34,1800,1)
});

export const MUSIC_TRACKS=Object.freeze({
  menu:{key:AUDIO_KEYS.musicMenu,baseVolume:.18},
  gameplay:{key:AUDIO_KEYS.musicGameplay,baseVolume:.16}
});

export function preloadApprovedAudio(scene){
  AUDIO_ASSETS.forEach(({key,sources})=>scene.load.audio(key,sources));
}

function asset(key,files,provenance='approved local pack'){return Object.freeze({key,sources:files.map(file=>`${root}/${file}`),provenance});}
function rule(key,baseVolume,debounceMs,maxVoices){return Object.freeze({key,baseVolume,debounceMs,maxVoices});}
function variantRule(keys,baseVolume,debounceMs,maxVoices){return Object.freeze({keys:Object.freeze([...keys]),baseVolume,debounceMs,maxVoices});}
