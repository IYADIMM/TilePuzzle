import Phaser from 'phaser';
import './styles.css';
import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { LevelSelectScene } from './scenes/LevelSelectScene.js';
import { CollectionScene } from './scenes/CollectionScene.js';
import { AchievementsScene } from './scenes/AchievementsScene.js';
import { RewardScene } from './scenes/RewardScene.js';
import { IconSheetScene } from './scenes/IconSheetScene.js';
import { LeaderboardScene } from './scenes/LeaderboardScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#123f35',
  width: window.innerWidth,
  height: window.innerHeight,
  resolution: Math.min(window.devicePixelRatio || 1, 2),
  render: { antialias: true, roundPixels: true, powerPreference: 'high-performance' },
  // Hard-disable Phaser's audio manager. This prevents even an idle Web Audio
  // context from being constructed; the game is visual/haptic-only by design.
  audio: { noAudio: true },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  input: { activePointers: 2 },
  scene: [BootScene, MenuScene, LevelSelectScene, CollectionScene, AchievementsScene, LeaderboardScene, GameScene, RewardScene, IconSheetScene]
};

window.jadeGame = new Phaser.Game(config);
