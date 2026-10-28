import Phaser from 'phaser';
import { AssetFactory } from '../art/AssetFactory.js';
import { preloadApprovedAudio } from '../audio/AudioManifest.js';
import { AudioManager } from '../audio/AudioManager.js';
import { SaveManager } from '../systems/SaveManager.js';
import { normalizeLevelNumber } from '../data/levels.js';

export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  preload() { this.saved=SaveManager.load();this.load.image('brand:ivory-mahjong','/assets/brand/ivory-mahjong-emblem-1536.png');AssetFactory.preload(this,{tileStyle:this.saved.prefs.tileStyle});preloadApprovedAudio(this); }
  create() {
    AssetFactory.createRuntimeTextures(this);
    const saved=this.saved||SaveManager.load(),audioManager=new AudioManager({soundManager:this.sound,persist:preferences=>{const latest=SaveManager.load();latest.prefs.audio=preferences;SaveManager.save(latest);}});
    audioManager.setPreferences(saved.prefs.audio,{persist:false});this.game.registry.set('audioManager',audioManager);
    const fontLoad = document.fonts
      ? Promise.all([
        document.fonts.load('700 32px Fredoka'),
        document.fonts.load('700 20px Poppins'),
        document.fonts.load('700 20px Cairo')
      ])
      : Promise.resolve();
    const ready = Promise.race([
      fontLoad,
      new Promise(resolve => window.setTimeout(resolve, 1800))
    ]);
    ready.catch(() => {}).finally(() => {
      const query=new URLSearchParams(location.search);const screen=query.get('screen');
      if(screen==='styles'){
        this.scene.start('Menu');
        this.scene.launch('TileStyleGallery',{hostKey:'Menu'});
        return;
      }
      const route=screen==='game'?'Game':screen==='levels'?'LevelSelect':screen==='collection'?'Collection':screen==='leaderboard'?'Leaderboard':import.meta.env.DEV&&screen==='shop'?'Shop':import.meta.env.DEV&&screen==='icons'?'IconSheet':'Menu';
      this.scene.start(route,{level:normalizeLevelNumber(query.get('level'))});
    });
  }
}
