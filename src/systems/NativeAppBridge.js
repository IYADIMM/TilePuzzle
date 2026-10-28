import { Capacitor } from '@capacitor/core';

export function nativeBackAction(activeKeys = []) {
  if (activeKeys.includes('TileStyleGallery')) return 'close-tile-style';
  if (activeKeys.includes('AudioSettings')) return 'close-audio-settings';
  if (activeKeys.includes('Game')) return 'pause-game';
  if (activeKeys.includes('Menu')) return 'minimize-app';
  return 'menu';
}

export async function installNativeAppBridge(game) {
  if (!Capacitor.isNativePlatform()) return null;
  const { App } = await import('@capacitor/app');
  const listener = await App.addListener('backButton', () => {
    const activeScenes = game.scene.getScenes(true);
    const keys = activeScenes.map(scene => scene.scene.key);
    const action = nativeBackAction(keys);
    if (action === 'close-tile-style') return game.scene.getScene('TileStyleGallery')?.close?.();
    if (action === 'close-audio-settings') return game.scene.getScene('AudioSettings')?.close?.();
    if (action === 'pause-game') {
      const scene = game.scene.getScene('Game');
      if (scene?.modal?.root && !scene.gameEnded) {
        scene.modal.close();
        scene.resumeGame?.();
      } else if (!scene?.gameEnded) scene?.pauseGame?.();
      return;
    }
    if (action === 'minimize-app') return App.minimizeApp();
    game.scene.start('Menu');
  });
  return listener;
}
