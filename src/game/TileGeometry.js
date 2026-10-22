export const TILE_GEOMETRY = Object.freeze({
  faceWidth: 56,
  faceHeight: 72,
  aspectRatio: 56 / 72,
  bodyThickness: 10,
  borderRadius: 12,
  bevel: 5,
  iconScale: .82,
  hitInset: 1.5,
  gridStepX: 30,
  gridStepY: 31,
  layerOffsetX: 4,
  layerOffsetY: -6,
  sideGapTolerance: 9,
  sideVerticalOverlapRatio: .48,
  coverTolerance: .5
});

export function logicalFaceRect(tile, geometry = TILE_GEOMETRY) {
  const x = tile.col * geometry.gridStepX + tile.layer * geometry.layerOffsetX;
  const y = tile.row * geometry.gridStepY + tile.layer * geometry.layerOffsetY;
  return {
    x, y,
    left: x - geometry.faceWidth / 2,
    right: x + geometry.faceWidth / 2,
    top: y - geometry.faceHeight / 2,
    bottom: y + geometry.faceHeight / 2,
    width: geometry.faceWidth,
    height: geometry.faceHeight
  };
}

export function overlapSize(a, b) {
  return {
    x: Math.min(a.right, b.right) - Math.max(a.left, b.left),
    y: Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
  };
}
