export function canCompleteLevel({ remainingBoard, trayCount, busy, alreadyEmitted = false }) {
  return Number(remainingBoard) === 0
    && Number(trayCount) === 0
    && !busy
    && !alreadyEmitted;
}
