import { Results } from '@mediapipe/hands';
import { GestureType, Point } from '../types';

const WRIST = 0;
const THUMB_TIP = 4;
const INDEX_FINGER_TIP = 8;
const MIDDLE_FINGER_TIP = 12;
const RING_FINGER_TIP = 16;
const PINKY_TIP = 20;

const getDistance = (p1: any, p2: any) => {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};

export const detectGesture = (results: Results): { type: GestureType; pos: Point } => {
  if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
    return { type: 'NONE', pos: { x: 0, y: 0 } };
  }

  const landmarks = results.multiHandLandmarks[0];
  const indexTip = landmarks[INDEX_FINGER_TIP];
  const middleTip = landmarks[MIDDLE_FINGER_TIP];
  const thumbTip = landmarks[THUMB_TIP];
  const ringTip = landmarks[RING_FINGER_TIP];
  const pinkyTip = landmarks[PINKY_TIP];
  const wrist = landmarks[WRIST];

  // Position: flip X for mirror effect, index finger tip
  const pos: Point = { x: 1 - indexTip.x, y: indexTip.y };

  // Finger extension checks
  const isThumbExtended = getDistance(thumbTip, landmarks[2]) > 0.1;
  const isIndexExtended = getDistance(indexTip, wrist) > getDistance(landmarks[6], wrist) + 0.05;
  const isMiddleExtended = getDistance(middleTip, wrist) > getDistance(landmarks[10], wrist) + 0.05;
  const isRingExtended = getDistance(ringTip, wrist) > getDistance(landmarks[14], wrist) + 0.05;
  const isPinkyExtended = getDistance(pinkyTip, wrist) > getDistance(landmarks[18], wrist) + 0.05;

  const thumbIndexDist = getDistance(thumbTip, indexTip);
  const indexMiddleDist = getDistance(indexTip, middleTip);

  const fingersExtendedCount = [isIndexExtended, isMiddleExtended, isRingExtended, isPinkyExtended].filter(Boolean).length;

  // 1. PINCH: Thumb + Index tips very close
  if (thumbIndexDist < 0.06) {
    return { type: 'PINCH', pos };
  }

  // 4. SELECT: Index + Middle both extended and tips close together
  if (isIndexExtended && isMiddleExtended && !isRingExtended && !isPinkyExtended && indexMiddleDist < 0.07) {
    return { type: 'SELECT', pos };
  }

  // 5. DRAW: Only index finger extended
  if (isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended) {
    return { type: 'DRAW', pos };
  }

  return { type: 'NONE', pos };
};