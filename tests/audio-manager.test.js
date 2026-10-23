import test from 'node:test';
import assert from 'node:assert/strict';
import { AudioManager } from '../src/audio/AudioManager.js';
import { DEFAULT_AUDIO_PREFERENCES,normalizeAudioPreferences } from '../src/audio/AudioPreferences.js';
import { AUDIO_KEYS } from '../src/audio/AudioManifest.js';

test('audio preferences normalize mute and volume paths',()=>{
  assert.deepEqual(normalizeAudioPreferences(),DEFAULT_AUDIO_PREFERENCES);
  assert.deepEqual(normalizeAudioPreferences({musicEnabled:false,sfxEnabled:false,musicVolume:3,sfxVolume:-2}),{musicEnabled:false,sfxEnabled:false,musicVolume:1,sfxVolume:0});
});

test('approved event plays once at cautious mixed volume and persists settings',()=>{
  let now=100,persisted;const sound=new FakeSoundManager(),audio=new AudioManager({soundManager:sound,now:()=>now,random:()=>.99,persist:value=>persisted=value});
  audio.setPreferences({sfxVolume:.5,musicVolume:.25});
  const result=audio.play('tile_select');
  assert.equal(result.played,true);assert.equal(result.key,AUDIO_KEYS.tileSelect);assert.equal(sound.voices[0].volume,.17);assert.equal(persisted.sfxVolume,.5);
  now+=10;assert.equal(audio.play('tile_select').reason,'debounced');
  result.voice.emit('complete');assert.equal(audio.snapshot().voiceCount,0);
});

test('selection and victory variants use every available take without immediate repeats',()=>{
  let now=0;const sound=new FakeSoundManager(),audio=new AudioManager({soundManager:sound,now:()=>now,random:()=>.99});
  const selection=[];for(let index=0;index<7;index++){now+=100;selection.push(audio.play('tile_select').key);sound.voices.at(-1).emit('complete');}
  const victories=[];for(let index=0;index<7;index++){now+=2000;victories.push(audio.play('level_complete').key);sound.voices.at(-1).emit('complete');}
  assert.equal(new Set(selection.slice(0,3)).size,3);assert.equal(new Set(victories.slice(0,3)).size,3);
  assert.ok(selection.every((key,index)=>index===0||key!==selection[index-1]));
  assert.ok(victories.every((key,index)=>index===0||key!==victories[index-1]));
  assert.ok(selection.includes(AUDIO_KEYS.tileSelect));assert.ok(victories.includes(AUDIO_KEYS.levelComplete));
});

test('muted and missing audio fail gracefully without fabricated playback',()=>{
  const sound=new FakeSoundManager(),audio=new AudioManager({soundManager:sound});
  audio.setPreferences({sfxEnabled:false},{persist:false});assert.equal(audio.play('tile_match').reason,'muted');
  audio.setPreferences({sfxEnabled:true},{persist:false});sound.missing.add(AUDIO_KEYS.tileMatch);assert.equal(audio.play('tile_match').reason,'missing-or-unavailable');assert.equal(sound.voices.length,0);
});

test('voice cap and deterministic placement variation prevent sound stacking',()=>{
  let now=0;const sound=new FakeSoundManager(),audio=new AudioManager({soundManager:sound,now:()=>now});
  assert.equal(audio.play('ui_click').played,true);now=100;assert.equal(audio.play('ui_click').played,true);now=200;assert.equal(audio.play('ui_click').reason,'voice-cap');
  sound.voices.forEach(voice=>voice.emit('complete'));const placementKeys=[];
  for(let i=0;i<5;i++){now+=100;placementKeys.push(audio.playPlacement().key);sound.voices.at(-1).emit('complete');}
  assert.deepEqual(placementKeys,[AUDIO_KEYS.tilePlaceA,AUDIO_KEYS.tilePlaceA,AUDIO_KEYS.tilePlaceA,AUDIO_KEYS.tilePlaceA,AUDIO_KEYS.tilePlaceB]);
});

test('music reuses a track, crossfades without overlap, and handles interruption',async()=>{
  const sound=new FakeSoundManager(),audio=new AudioManager({soundManager:sound});audio.setPreferences({musicVolume:.5},{persist:false});
  const menu=audio.playMusic('menu',{fadeMs:0});assert.equal(menu.played,true);const menuVoice=sound.voices.at(-1);assert.equal(menuVoice.volume,.09);
  assert.equal(audio.playMusic('menu').reused,true);audio.playMusic('gameplay',{fadeMs:0});const gameVoice=sound.voices.at(-1);assert.equal(menuVoice.destroyed,true);assert.equal(gameVoice.volume,.08);assert.equal(audio.snapshot().currentTrack,'gameplay');
  audio.pauseForInterruption();assert.equal(gameVoice.isPaused,true);await audio.resumeAfterInterruption();assert.equal(gameVoice.isPlaying,true);
});

test('suspended context unlocks on user gesture and silent fallback remains playable',async()=>{
  const sound=new FakeSoundManager();sound.context.state='suspended';const audio=new AudioManager({soundManager:sound});
  assert.equal(await audio.unlock(),true);assert.equal(sound.context.state,'running');
  const unavailable=new AudioManager({soundManager:null});assert.equal(unavailable.play('ui_click').reason,'missing-or-unavailable');
});

class FakeSoundManager{
  constructor(){this.voices=[];this.missing=new Set();this.locked=false;this.context={state:'running',resume:async()=>{this.context.state='running';}};this.game={cache:{audio:{exists:key=>!this.missing.has(key)}}};}
  add(key,config){const voice=new FakeVoice(key,config);this.voices.push(voice);return voice;}
  unlock(){this.locked=false;}
}
class FakeVoice{
  constructor(key,{volume=1,loop=false}={}){this.key=key;this.volume=volume;this.loop=loop;this.handlers={};this.isPlaying=false;this.isPaused=false;this.destroyed=false;}
  play(){this.isPlaying=true;return true;}
  once(event,callback){(this.handlers[event]||=[]).push(callback);return this;}
  emit(event){for(const callback of this.handlers[event]||[])callback();this.handlers[event]=[];}
  setVolume(value){this.volume=value;return this;}
  pause(){this.isPlaying=false;this.isPaused=true;}
  resume(){this.isPaused=false;this.isPlaying=true;}
  stop(){this.isPlaying=false;this.emit('stop');}
  destroy(){this.destroyed=true;this.emit('destroy');}
}
