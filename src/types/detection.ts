export interface GeneralFlashThresholds {
  lumDelta: number;
  darkerMax: number;
  areaPct: number;
  hz: number;
}

export interface RedFlashThresholds {
  areaPct: number;
  hz: number;
}

export interface MotionThresholds {
  pixelDeltaPct: number;
  areaPct: number;
  hz: number;
}

export interface Thresholds {
  general: GeneralFlashThresholds;
  red: RedFlashThresholds;
  motion: MotionThresholds;
}

export type FlashKind = 'general' | 'red' | 'motion';

export interface FlashEvent {
  kind: FlashKind;
  frameIndex: number;
  tMs: number;
}

export interface DetectionResult {
  generalHz: number;
  redHz: number;
  motionHz: number;
  generalPasses: boolean;
  redPasses: boolean;
  motionPasses: boolean;
  passes: boolean;
  events: FlashEvent[];
  meanLuminancePerFrame: number[];
}

export const DEFAULT_THRESHOLDS: Thresholds = {
  general: { lumDelta: 0.1, darkerMax: 0.8, areaPct: 25, hz: 3 },
  red: { areaPct: 25, hz: 3 },
  motion: { pixelDeltaPct: 10, areaPct: 30, hz: 5 },
};
