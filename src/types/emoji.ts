export type SourceFormat = 'gif' | 'apng' | 'webp';
export type OutputFormat = 'gif' | 'apng';

export interface Frame {
  data: Uint8ClampedArray;
  delayMs: number;
}

export interface AnimatedImage {
  width: number;
  height: number;
  frames: Frame[];
  sourceFormat: SourceFormat;
  loop: number;
}
