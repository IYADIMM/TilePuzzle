import { THEMES,iconTextureKey } from '../data/themes.js';
import { PREMIUM_MATERIALS,PREMIUM_TEXTURES } from './PremiumAssetManifest.js';

export const TILE_STYLE_VERSION=1;
export const TILE_STYLE_IDS=Object.freeze({ILLUSTRATED:'illustrated',CLASSIC:'classic'});
export const CLASSIC_FACE_IDS=Object.freeze([
  ...Array.from({length:9},(_,i)=>`circle-${i+1}`),
  ...Array.from({length:9},(_,i)=>`bamboo-${i+1}`),
  ...Array.from({length:9},(_,i)=>`character-${i+1}`),
  'wind-east','wind-south','wind-west','wind-north','dragon-red','dragon-green','dragon-white','flower-plum','flower-chrysanthemum'
]);
export const CLASSIC_RENDER_COUNT=72;
export const CLASSIC_ASSETS=Object.freeze(Array.from({length:CLASSIC_RENDER_COUNT},(_,index)=>({
  id:`classic-${String(index).padStart(3,'0')}`,
  key:`classic:${String(index).padStart(3,'0')}`,
  url:`/assets/premium/classic/classic-${String(index).padStart(3,'0')}.webp`,
  faceId:CLASSIC_FACE_IDS[index%CLASSIC_FACE_IDS.length],variant:Math.floor(index/CLASSIC_FACE_IDS.length)
})));

const KNOWN_TYPE_IDS=Object.freeze(THEMES.flatMap(theme=>theme.iconIds));
const KNOWN_INDEX=new Map(KNOWN_TYPE_IDS.map((id,index)=>[id,index]));

export const TILE_STYLES=Object.freeze([
  Object.freeze({id:TILE_STYLE_IDS.ILLUSTRATED,title:'Illustrated Garden',description:'72 painted treasures across twelve garden collections.'}),
  Object.freeze({id:TILE_STYLE_IDS.CLASSIC,title:'Classic Mahjong',description:'Crisp lacquer motifs on warm ivory ceramic.'})
]);

export function normalizeTileStyle(value){return value===TILE_STYLE_IDS.CLASSIC?TILE_STYLE_IDS.CLASSIC:TILE_STYLE_IDS.ILLUSTRATED;}
export function classicTextureKey(index){return CLASSIC_ASSETS[index]?.key||CLASSIC_ASSETS[0].key;}

export function createTileSkinResolver(styleId,typeIds=[]){
  const style=normalizeTileStyle(styleId),mapping=buildClassicMapping(typeIds);
  return Object.freeze({
    styleId:style,version:TILE_STYLE_VERSION,
    textureKey(typeId){return style===TILE_STYLE_IDS.CLASSIC?classicTextureKey(resolveClassicIndex(typeId,mapping)):iconTextureKey(typeId);},
    bodyTextureKey(materialId){return style===TILE_STYLE_IDS.CLASSIC?PREMIUM_TEXTURES.tileBody.key:(PREMIUM_MATERIALS[materialId]?.key||PREMIUM_TEXTURES.tileBody.key);},
    classicIndex(typeId){return resolveClassicIndex(typeId,mapping);}
  });
}

export function buildClassicMapping(typeIds=[]){
  const unique=[...new Set(typeIds.map(id=>String(id).trim().toLowerCase()).filter(Boolean))].sort();
  if(unique.length>CLASSIC_RENDER_COUNT)throw new Error(`Classic style supports ${CLASSIC_RENDER_COUNT} distinct live identities`);
  const used=new Set(),map=new Map();
  for(const id of unique){let index=KNOWN_INDEX.has(id)?KNOWN_INDEX.get(id):stableHash(id)%CLASSIC_RENDER_COUNT;while(used.has(index))index=(index+1)%CLASSIC_RENDER_COUNT;used.add(index);map.set(id,index);}
  return map;
}

function resolveClassicIndex(typeId,context){const id=String(typeId).trim().toLowerCase();return context.get(id)??KNOWN_INDEX.get(id)??stableHash(id)%CLASSIC_RENDER_COUNT;}
function stableHash(value){let hash=2166136261;for(const char of value){hash^=char.charCodeAt(0);hash=Math.imul(hash,16777619);}return hash>>>0;}
