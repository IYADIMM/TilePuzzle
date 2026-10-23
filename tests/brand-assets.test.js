import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';

const root=process.cwd();

test('PWA and native handoff manifests reference distinct production icon masters',async()=>{
  const web=JSON.parse(await readFile(`${root}/public/manifest.webmanifest`,'utf8'));
  const brand=JSON.parse(await readFile(`${root}/public/assets/brand/manifest.json`,'utf8'));
  assert.equal(web.icons.length,2);
  assert.deepEqual(new Set(web.icons.map(icon=>icon.purpose)),new Set(['any','maskable']));
  assert.equal(brand.assets.length,3);
  for(const asset of brand.assets){
    const file=`${root}/public${asset.path}`;
    assert.ok((await stat(file)).size>100_000,asset.id);
    assert.deepEqual([...await readFile(file).then(buffer=>buffer.subarray(0,8))],[137,80,78,71,13,10,26,10]);
  }
});

test('shop uses individual previews instead of letter badges',async()=>{
  const source=await readFile(`${root}/src/scenes/ShopScene.js`,'utf8');
  assert.match(source,/createItemPreview/);
  assert.match(source,/preview-kind/);
  assert.doesNotMatch(source,/item\.kind\[0\]/);
});
