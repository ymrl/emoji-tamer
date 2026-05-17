export type TransformKind = 'slowdown' | 'decimate' | 'brightness' | 'saturation';

export type TransformOptions =
  | { kind: 'slowdown'; factor: number }
  | { kind: 'decimate'; keepEvery: number }
  | { kind: 'brightness'; factor: number }
  | { kind: 'saturation'; factor: number };

export const TRANSFORM_KINDS: TransformKind[] = [
  'slowdown',
  'decimate',
  'brightness',
  'saturation',
];

export const DEFAULT_TRANSFORM_OPTIONS: Record<TransformKind, TransformOptions> = {
  slowdown: { kind: 'slowdown', factor: 2 },
  decimate: { kind: 'decimate', keepEvery: 2 },
  brightness: { kind: 'brightness', factor: 0.6 },
  saturation: { kind: 'saturation', factor: 0.4 },
};
