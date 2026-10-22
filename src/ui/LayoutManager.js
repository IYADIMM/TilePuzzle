import { TILE_GEOMETRY } from '../game/TileGeometry.js';
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
    board: { left: ox + 28 * scale, right: ox + 512 * scale, top: oy + 166 * scale, bottom: oy + 675 * scale },
    tray: { ...point(270, 728), width: 382 * scale, slotGap: 82 * scale },
    boostersY: oy + 872 * scale,
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
  const s = Math.min(1.34, availableW / rawW, availableH / rawH);
  const tileW = g.faceWidth * s;
  const tileH = g.faceHeight * s;
  const stepX = g.gridStepX * s;
  const stepY = g.gridStepY * s;
  const layerX = g.layerOffsetX * s;
  const layerY = g.layerOffsetY * s;
  const contentW = maxCol * stepX + tileW + maxLayer * layerX;
  const contentH = maxRow * stepY + tileH + maxLayer * Math.abs(layerY);
  const originX = bounds.left + (availableW - contentW) / 2 + tileW / 2;
  const originY = bounds.top + (availableH - contentH) / 2 + tileH / 2 + maxLayer * Math.abs(layerY);
  return { s, tileW, tileH, stepX, stepY, layerX, layerY, originX, originY, faceAspect:TILE_GEOMETRY.aspectRatio };
}

export function tileScreenPosition(tile, projection) {
  return {
    x: projection.originX + tile.col * projection.stepX + tile.layer * projection.layerX,
    y: projection.originY + tile.row * projection.stepY + tile.layer * projection.layerY
  };
}
