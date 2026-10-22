import { MUSIC_TRACKS,SFX_EVENTS } from './AudioManifest.js';
import { normalizeAudioPreferences } from './AudioPreferences.js';

export class AudioManager {
  constructor({soundManager=null,now=()=>performance.now(),persist=()=>{}}={}){
    this.sound=soundManager;this.now=now;this.persist=persist;this.preferences=normalizeAudioPreferences();this.scene=null;this.activeVoices=new Map();this.lastPlayed=new Map();this.currentMusic=null;this.currentTrack=null;this.pendingTrack=null;this.interrupted=false;this.placementCount=0;this.destroyed=false;this.audit=[];this.lifecycleInstalled=false;
  }

  setSoundManager(soundManager){this.sound=soundManager;return this;}
  setPersist(persist){this.persist=typeof persist==='function'?persist:()=>{};return this;}
  setPreferences(next,{persist=true}={}){
    this.preferences=normalizeAudioPreferences({...this.preferences,...next});
    if(this.currentMusic)this.setInstanceVolume(this.currentMusic,this.preferences.musicEnabled?this.musicTarget(this.currentTrack):0);
    if(!this.preferences.musicEnabled)this.currentMusic?.pause?.();
    else if(this.currentMusic?.isPaused)this.currentMusic.resume?.();
    else if(this.pendingTrack)this.playMusic(this.pendingTrack);
    if(persist)this.persist({...this.preferences});
    return this.preferences;
  }

  bindScene(scene,{music=null}={}){
    this.scene=scene;this.sound ||= scene?.sound||scene?.game?.sound;
    scene?.input?.once?.('pointerdown',()=>this.unlock());
    if(!this.lifecycleInstalled)this.installLifecycle(scene?.game);
    if(music)this.playMusic(music);
    return this;
  }

  async unlock(){
    if(!this.sound||this.destroyed)return false;
    try{
      this.sound.unlock?.();
      const context=this.sound.context;
      if(context?.state==='suspended')await context.resume();
      if(this.pendingTrack&&this.preferences.musicEnabled)this.playMusic(this.pendingTrack);
      return !context||context.state==='running';
    }catch(error){this.record('unlock','failed',{message:String(error?.message||error)});return false;}
  }

  play(event){
    const rule=SFX_EVENTS[event];if(!rule)return this.failure(event,'unknown-event');
    if(!this.preferences.sfxEnabled||this.preferences.sfxVolume<=0)return this.failure(event,'muted');
    const now=this.now(),last=this.lastPlayed.get(event)??-Infinity;
    if(now-last<rule.debounceMs)return this.failure(event,'debounced');
    const active=this.activeVoices.get(event)||new Set();
    if(active.size>=rule.maxVoices||this.voiceCount()>=7)return this.failure(event,'voice-cap');
    if(!this.canUse(rule.key))return this.failure(event,'missing-or-unavailable');
    let voice;
    try{
      voice=this.sound.add(rule.key,{volume:rule.baseVolume*this.preferences.sfxVolume});
      const played=voice?.play?.();
      if(played===false){voice?.destroy?.();return this.failure(event,'play-rejected');}
    }catch(error){voice?.destroy?.();return this.failure(event,'play-error',{message:String(error?.message||error)});}
    this.lastPlayed.set(event,now);active.add(voice);this.activeVoices.set(event,active);
    const cleanup=()=>{active.delete(voice);voice?.destroy?.();if(!active.size)this.activeVoices.delete(event);};
    voice.once?.('complete',cleanup);voice.once?.('stop',cleanup);voice.once?.('destroy',()=>active.delete(voice));
    this.record(event,'played',{key:rule.key,volume:rule.baseVolume*this.preferences.sfxVolume});
    return{played:true,event,key:rule.key,voice};
  }

  playPlacement(){this.placementCount++;return this.play(this.placementCount%5===0?'tile_place_b':'tile_place_a');}

  playMusic(track,{fadeMs=650}={}){
    const definition=MUSIC_TRACKS[track];if(!definition)return this.failure(`music:${track}`,'unknown-track');
    this.pendingTrack=track;
    if(!this.preferences.musicEnabled||this.preferences.musicVolume<=0)return this.failure(`music:${track}`,'muted');
    if(this.currentTrack===track&&this.currentMusic&&(this.currentMusic.isPlaying||this.currentMusic.isPaused)){if(this.currentMusic.isPaused)this.currentMusic.resume?.();this.fade(this.currentMusic,this.musicTarget(track),fadeMs);return{played:true,reused:true,track};}
    if(!this.canUse(definition.key))return this.failure(`music:${track}`,'missing-or-unavailable');
    let next;
    try{next=this.sound.add(definition.key,{loop:true,volume:0});if(next?.play?.()===false){next?.destroy?.();return this.failure(`music:${track}`,'play-rejected');}}catch(error){next?.destroy?.();return this.failure(`music:${track}`,'play-error',{message:String(error?.message||error)});}
    const previous=this.currentMusic;this.currentMusic=next;this.currentTrack=track;this.pendingTrack=null;this.fade(next,this.musicTarget(track),fadeMs);
    if(previous&&previous!==next)this.fade(previous,0,fadeMs,()=>{previous.stop?.();previous.destroy?.();});
    this.record(`music:${track}`,'played',{key:definition.key,volume:this.musicTarget(track)});return{played:true,track,key:definition.key};
  }

  pauseForInterruption(){if(this.currentMusic?.isPlaying){this.currentMusic.pause?.();this.interrupted=true;}this.record('lifecycle','paused');}
  async resumeAfterInterruption(){if(!this.interrupted)return false;this.interrupted=false;const unlocked=await this.unlock();if(unlocked&&this.preferences.musicEnabled)this.currentMusic?.resume?.();this.record('lifecycle','resumed',{unlocked});return unlocked;}
  stopAll(){for(const voices of this.activeVoices.values())for(const voice of voices){voice.stop?.();voice.destroy?.();}this.activeVoices.clear();if(this.currentMusic){this.currentMusic.stop?.();this.currentMusic.destroy?.();}this.currentMusic=null;this.currentTrack=null;}
  destroy(){this.destroyed=true;this.stopAll();}
  snapshot(){return{preferences:{...this.preferences},currentTrack:this.currentTrack,pendingTrack:this.pendingTrack,voiceCount:this.voiceCount(),contextState:this.sound?.context?.state||'unavailable',events:this.audit.map(event=>({...event}))};}

  installLifecycle(game){
    this.lifecycleInstalled=true;
    if(typeof document!=='undefined')document.addEventListener('visibilitychange',()=>document.hidden?this.pauseForInterruption():this.resumeAfterInterruption());
    game?.events?.on?.('blur',()=>this.pauseForInterruption());game?.events?.on?.('focus',()=>this.resumeAfterInterruption());
  }
  canUse(key){if(!this.sound?.add)return false;const cache=this.sound?.game?.cache?.audio;if(cache?.exists)return cache.exists(key);if(cache?.has)return cache.has(key);return true;}
  voiceCount(){let count=0;for(const voices of this.activeVoices.values())count+=voices.size;return count;}
  musicTarget(track){return(MUSIC_TRACKS[track]?.baseVolume||0)*this.preferences.musicVolume;}
  fade(target,volume,duration,onComplete){if(!target){onComplete?.();return;}if(this.scene?.tweens&&this.scene.sys?.isActive?.())this.scene.tweens.add({targets:target,volume,duration,ease:'Sine.InOut',onComplete});else{this.setInstanceVolume(target,volume);onComplete?.();}}
  setInstanceVolume(instance,volume){if(instance?.setVolume)instance.setVolume(volume);else if(instance)instance.volume=volume;}
  failure(event,reason,extra={}){this.record(event,'skipped',{reason,...extra});return{played:false,event,reason,...extra};}
  record(event,status,detail={}){this.audit.push({event,status,at:this.now(),...detail});if(this.audit.length>240)this.audit.splice(0,this.audit.length-240);}
}

export function getAudioManager(scene){return scene?.game?.registry?.get?.('audioManager')||null;}
export function bindSceneAudio(scene,music=null){const manager=getAudioManager(scene);manager?.bindScene(scene,{music});return manager;}
