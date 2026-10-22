export function quadraticBezierPoint(startX, startY, controlX, controlY, endX, endY, t) {
  const u = 1 - t;
  return {
    x: u * u * startX + 2 * u * t * controlX + t * t * endX,
    y: u * u * startY + 2 * u * t * controlY + t * t * endY
  };
}
