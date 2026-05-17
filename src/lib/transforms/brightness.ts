import { clamp255 } from '../color';
import type { AnimatedImage } from '../../types/emoji';

export function brightness(image: AnimatedImage, factor: number): AnimatedImage {
  const f = Math.max(0, Math.min(1, factor));
  return {
    ...image,
    frames: image.frames.map((frame) => {
      const out = new Uint8ClampedArray(frame.data.length);
      for (let i = 0; i < frame.data.length; i += 4) {
        out[i] = clamp255(frame.data[i] * f);
        out[i + 1] = clamp255(frame.data[i + 1] * f);
        out[i + 2] = clamp255(frame.data[i + 2] * f);
        out[i + 3] = frame.data[i + 3];
      }
      return { data: out, delayMs: frame.delayMs };
    }),
  };
}
