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
import { ShopScene } from './scenes/ShopScene.js';
import { AudioSettingsScene } from './scenes/AudioSettingsScene.js';
import { TileStyleGalleryScene } from './scenes/TileStyleGalleryScene.js';
import { installNativeAppBridge } from './systems/NativeAppBridge.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#123f35',
  width: window.innerWidth,
  height: window.innerHeight,
  resolution: Math.min(window.devicePixelRatio || 1, 2),
  render: { antialias: true, roundPixels: false, powerPreference: 'high-performance' },
  audio: { disableWebAudio: false },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  input: { activePointers: 2 },
  scene: [
    BootScene, MenuScene, LevelSelectScene, CollectionScene, AchievementsScene,
    LeaderboardScene, GameScene, RewardScene,
    ShopScene,
    ...(import.meta.env.DEV ? [IconSheetScene] : []),
    AudioSettingsScene, TileStyleGalleryScene
  ]
};

window.jadeGame = new Phaser.Game(config);
installNativeAppBridge(window.jadeGame);
