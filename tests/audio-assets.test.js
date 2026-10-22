import test from 'node:test';
import assert from 'node:assert/strict';
import { access,readFile,stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { AUDIO_ASSETS } from '../src/audio/AudioManifest.js';

const publicRoot=path.resolve('public');

test('every approved runtime audio source exists and rejected placement v1 is absent',async()=>{
  for(const asset of AUDIO_ASSETS)for(const url of asset.sources){const file=path.join(publicRoot,url.replace(/^\//,'')),details=await stat(file);assert.ok(details.size>1000,`${url} must be nonempty`);}
  await assert.rejects(access(path.join(publicRoot,'assets/audio/tile_place.mp3')));
});

test('approved ElevenLabs originals retain exact supplied bytes',async()=>{
  assert.equal(await sha('public/assets/audio/tile_select.mp3'),'e12c4e4b761262ec278a65f6eec3ffb41b8c0d0517d1b0995c00121b6e8b573f');
  assert.equal(await sha('public/assets/audio/level_complete.mp3'),'a357be041b994207d85c52d8c194e6fd12ae6b5478e188d97cb1863bdfce0916');
});

test('approved local OGG files match the handoff manifest',async()=>{
  const manifest=JSON.parse(await readFile('docs/audio/ASSET_MANIFEST.json','utf8'));
  for(const asset of manifest.assets){assert.equal(await sha(path.join('public/assets/audio',path.basename(asset.ogg))),asset.ogg_sha256,asset.name);}
});

async function sha(file){return createHash('sha256').update(await readFile(file)).digest('hex');}
