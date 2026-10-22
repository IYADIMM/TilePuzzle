import { isGameplayEvidenceValid } from './PerformanceRules.js';

export function canCompleteLevel({ remainingBoard, trayCount, busy, alreadyEmitted = false, evidence }) {
  return Number(remainingBoard) === 0
    && Number(trayCount) === 0
    && !busy
    && !alreadyEmitted
    && isGameplayEvidenceValid(evidence||{});
}
