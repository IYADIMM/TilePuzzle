import Phaser from 'phaser';
import { TEXT } from '../theme.js';
import { bindSceneAudio } from '../audio/AudioManager.js';
import { isAudioFullyMuted,normalizeAudioPreferences } from '../audio/AudioPreferences.js';
import { SaveManager } from '../systems/SaveManager.js';
import { applyDesignCamera } from '../ui/LayoutManager.js';
import { addGoldButton,addIconButton } from '../ui/components.js';

export class AudioSettingsScene extends Phaser.Scene {
  constructor(){super('AudioSettings');}
  init(data={}){this.hostKey=data.hostKey||'Menu';}
  create(){
    applyDesignCamera(this);this.save=SaveManager.load();this.audio=bindSceneAudio(this,null);this.input.topOnly=true;
    this.add.rectangle(270,480,900,1400,0x010605,.92).setInteractive();
    const card=this.add.graphics().fillStyle(0x160703,.65).fillRoundedRect(34,48,472,858,34).fillGradientStyle(0x8f4824,0x632817,0x2c0e06,0x47180b,1).fillRoundedRect(39,38,462,858,34).lineStyle(5,0x2b0d05).strokeRoundedRect(39,38,462,858,34).lineStyle(3,0xe4ac3c).strokeRoundedRect(48,47,444,840,27).fillStyle(0x062820,.92).fillRoundedRect(65,126,410,650,24).lineStyle(2,0xffd365,.5).strokeRoundedRect(65,126,410,650,24);
    this.add.text(270,84,'SOUND & COMFORT',{...TEXT.title,fontSize:'32px',color:'#ffe09a',stroke:'#3a1308',strokeThickness:6}).setOrigin(.5);
    this.add.text(270,116,'APPROVED AUDIO  •  QUIET DEFAULT MIX',{...TEXT.hud,fontSize:'10px',color:'#cce0d6',letterSpacing:1.5}).setOrigin(.5);
    const audio=normalizeAudioPreferences(this.save.prefs.audio);
    this.add.text(270,162,'SOUND EFFECTS',{...TEXT.hud,fontSize:'16px',color:'#f6ce63',letterSpacing:1.8}).setOrigin(.5);
    addGoldButton(this,270,210,310,audio.sfxEnabled?'SFX  ON':'SFX  OFF',()=>this.change(save=>save.prefs.audio.sfxEnabled=!save.prefs.audio.sfxEnabled));
    this.volumeRow('SFX VOLUME',286,audio.sfxVolume,delta=>this.change(save=>save.prefs.audio.sfxVolume=clampStep(save.prefs.audio.sfxVolume,delta)));
    this.add.text(270,364,'MUSIC',{...TEXT.hud,fontSize:'16px',color:'#f6ce63',letterSpacing:1.8}).setOrigin(.5);
    addGoldButton(this,270,412,310,audio.musicEnabled?'MUSIC  ON':'MUSIC  OFF',()=>this.change(save=>save.prefs.audio.musicEnabled=!save.prefs.audio.musicEnabled));
    this.volumeRow('MUSIC VOLUME',488,audio.musicVolume,delta=>this.change(save=>save.prefs.audio.musicVolume=clampStep(save.prefs.audio.musicVolume,delta)));
    addGoldButton(this,270,584,310,`HAPTICS  ${this.save.prefs.haptics?'ON':'OFF'}`,()=>this.change(save=>save.prefs.haptics=!save.prefs.haptics));
    addGoldButton(this,270,660,310,`REDUCED MOTION  ${this.save.prefs.reducedMotion?'ON':'OFF'}`,()=>this.change(save=>save.prefs.reducedMotion=!save.prefs.reducedMotion));
    const silent=isAudioFullyMuted(audio);addGoldButton(this,270,744,350,silent?'RESTORE SOUND':'MUTE ALL AUDIO',()=>this.change(save=>{const mute=!isAudioFullyMuted(save.prefs.audio);save.prefs.audio.sfxEnabled=!mute;save.prefs.audio.musicEnabled=!mute;}));
    this.add.text(270,797,'Music and sound effects can be controlled independently.',{...TEXT.hud,fontSize:'11px',color:'#bbd2c7'}).setOrigin(.5);
    addGoldButton(this,270,850,230,'DONE',()=>this.close());
  }
  volumeRow(label,y,value,onChange){
    this.add.text(270,y-25,`${label}  •  ${Math.round(value*100)}%`,{...TEXT.hud,fontSize:'14px',color:'#fff0c7'}).setOrigin(.5);
    addIconButton(this,154,y+18,'−',()=>onChange(-.1),'Decrease volume');addIconButton(this,386,y+18,'+',()=>onChange(.1),'Increase volume');
    const width=150,filled=Math.max(8,width*value);this.add.graphics().fillStyle(0x020d0a,.8).fillRoundedRect(195,y+5,width,25,12).lineStyle(2,0xd99c31).strokeRoundedRect(195,y+5,width,25,12).fillGradientStyle(0xffed94,0xf4bd3d,0xc66f17,0x9e4b0e,1).fillRoundedRect(200,y+10,filled-10,15,7);
  }
  change(mutator){mutator(this.save);this.save.prefs.audio=normalizeAudioPreferences(this.save.prefs.audio);SaveManager.save(this.save);this.audio?.setPreferences(this.save.prefs.audio,{persist:false});this.scene.restart({hostKey:this.hostKey});}
  close(){const host=this.scene.get(this.hostKey);if(this.hostKey==='Game')host?.board?.setLocked(false);this.scene.stop();}
}

function clampStep(value,delta){return Math.max(0,Math.min(1,Math.round(((Number(value)||0)+delta)*10)/10));}
