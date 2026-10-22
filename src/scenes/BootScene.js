import Phaser from 'phaser';
import { AssetFactory } from '../art/AssetFactory.js';

export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  preload() { AssetFactory.preload(this); }
  create() {
    AssetFactory.createRuntimeTextures(this);
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
      this.scene.start(screen==='game'?'Game':screen==='levels'?'LevelSelect':screen==='collection'?'Collection':screen==='leaderboard'?'Leaderboard':screen==='icons'?'IconSheet':'Menu',{level:Number(query.get('level'))||1});
    });
  }
}
