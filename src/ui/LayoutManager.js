import { TILE_GEOMETRY } from '../game/TileGeometry.js';
import { TILE_BODY_VISIBLE_BOUNDS,TRAY_ASSET_GEOMETRY } from '../art/PremiumAssetManifest.js';
export const DESIGN = Object.freeze({ width: 540, height: 960 });
export function applyDesignCamera(scene){const w=scene.scale.width,h=scene.scale.height,zoom=Math.min(w/DESIGN.width,h/DESIGN.height);scene.cameras.main.setZoom(zoom).centerOn(DESIGN.width/2,DESIGN.height/2).setBackgroundColor('#0a382f');return zoom;}

export function createLayout(width = DESIGN.width, height = DESIGN.height) {
  const scale = Math.min(width / DESIGN.width, height / DESIGN.height);
  const ox = (width - DESIGN.width * scale) / 2;
  const oy = (height - DESIGN.height * scale) / 2;
  const point = (x, y) => ({ x: ox + x * scale, y: oy + y * scale });
  return {
    width, height, scale, ox, oy, point,
    hud: { ...point(270, 52), top: oy + 18 * scale, bottom: oy + 145 * scale },
    board: { left: ox + 18 * scale, right: ox + 522 * scale, top: oy + 140 * scale, bottom: oy + 672 * scale },
    tray: { ...point(270, 766), width: 420 * scale, slotGap: 90 * scale },
    boostersY: oy + 885 * scale,
    safe: { left: ox, right: ox + DESIGN.width * scale, top: oy, bottom: oy + DESIGN.height * scale }
  };
}

export function projectBoard(tiles, bounds) {
  const maxCol = Math.max(...tiles.map(t => t.col), 1);
  const maxRow = Math.max(...tiles.map(t => t.row), 1);
  const maxLayer = Math.max(...tiles.map(t => t.layer), 0);
  const availableW = bounds.right - bounds.left;
  const availableH = bounds.bottom - bounds.top;
  const g=TILE_GEOMETRY;
  const rawW = maxCol * g.gridStepX + g.faceWidth + maxLayer * g.layerOffsetX;
  const rawH = maxRow * g.gridStepY + g.faceHeight + maxLayer * Math.abs(g.layerOffsetY);
  const s = Math.min(1.56, availableW / rawW);
  const sx=s;
  const tileW = g.faceWidth * s;
  const tileH = g.faceHeight * s;
  const stepX = g.gridStepX * s;
  const verticalFixed=tileH+maxLayer*Math.abs(g.layerOffsetY*s);
  const sy=Math.min(s,Math.max(.72,(availableH-verticalFixed)/Math.max(1,maxRow*g.gridStepY)));
  const stepY = g.gridStepY * sy;
  const layerX = g.layerOffsetX * s;
  const layerY = g.layerOffsetY * s;
  const contentW = maxCol * stepX + tileW + maxLayer * layerX;
  const contentH = maxRow * stepY + tileH + maxLayer * Math.abs(layerY);
  const originX = bounds.left + (availableW - contentW) / 2 + tileW / 2;
  const originY = bounds.top + (availableH - contentH) / 2 + tileH / 2 + maxLayer * Math.abs(layerY);
  return { s,sx,sy,tileW,tileH,stepX,stepY,layerX,layerY,originX,originY,faceAspect:tileW/tileH };
}

export function trayTileScale(layout,tileW,tileH){
  const slot=traySlotRect(layout,0),body=TILE_BODY_VISIBLE_BOUNDS;
  const visibleW=tileW*1.18*((body.right-body.left+1)/body.textureWidth);
  const visibleH=tileH*1.2*((body.bottom-body.top+1)/body.textureHeight);
  return Math.min(.9,slot.width/visibleW,slot.height/visibleH);
}

export function trayFrameRect(layout){
  const width=layout.tray.width+28,height=width*TRAY_ASSET_GEOMETRY.textureHeight/TRAY_ASSET_GEOMETRY.textureWidth;
  return{x:layout.tray.x-width/2,y:layout.tray.y-height/2,width,height};
}

export function traySlotRect(layout,index){
  const frame=trayFrameRect(layout),source=TRAY_ASSET_GEOMETRY.slotInteriors[Math.max(0,Math.min(3,index))],inset=TRAY_ASSET_GEOMETRY.safeInset;
  const sx=frame.width/TRAY_ASSET_GEOMETRY.textureWidth,sy=frame.height/TRAY_ASSET_GEOMETRY.textureHeight;
  return{x:frame.x+(source.left+inset.x)*sx,y:frame.y+(source.top+inset.y)*sy,width:(source.right-source.left-inset.x*2)*sx,height:(source.bottom-source.top-inset.y*2)*sy};
}

export function tileScreenPosition(tile, projection) {
  return {
    x: projection.originX + tile.col * projection.stepX + tile.layer * projection.layerX,
    y: projection.originY + tile.row * projection.stepY + tile.layer * projection.layerY
  };
}
