import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { nativeBackAction } from '../src/systems/NativeAppBridge.js';

test('native Android back routing prioritizes overlays and preserves active gameplay', () => {
  assert.equal(nativeBackAction(['Game', 'TileStyleGallery']), 'close-tile-style');
  assert.equal(nativeBackAction(['Game', 'AudioSettings']), 'close-audio-settings');
  assert.equal(nativeBackAction(['Game']), 'pause-game');
  assert.equal(nativeBackAction(['LevelSelect']), 'menu');
  assert.equal(nativeBackAction(['Menu']), 'minimize-app');
});

test('release signing configuration uses environment variables and contains no credentials', async () => {
  const gradle = await readFile(new URL('../android/app/build.gradle', import.meta.url), 'utf8');
  for (const name of ['JGT_UPLOAD_KEYSTORE', 'JGT_UPLOAD_KEY_ALIAS', 'JGT_UPLOAD_STORE_PASSWORD', 'JGT_UPLOAD_KEY_PASSWORD']) assert.match(gradle, new RegExp(name));
  assert.doesNotMatch(gradle, /storePassword\s+["'][^"']+["']/);
  assert.doesNotMatch(gradle, /keyPassword\s+["'][^"']+["']/);
});

test('production manifest is offline-only, blocks cleartext and disables unverified backup restore', async () => {
  const manifest = await readFile(new URL('../android/app/src/main/AndroidManifest.xml', import.meta.url), 'utf8');
  assert.doesNotMatch(manifest, /android\.permission\.INTERNET/);
  assert.match(manifest, /android:usesCleartextTraffic="false"/);
  assert.match(manifest, /android:allowBackup="false"/);
  assert.match(manifest, /android:screenOrientation="portrait"/);
});
