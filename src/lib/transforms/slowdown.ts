import type { AnimatedImage } from '../../types/emoji';

const GIF_MAX_DELAY_MS = 655350;

export function slowdown(image: AnimatedImage, factor: number): AnimatedImage {
  if (factor <= 0) factor = 1;
  return {
    ...image,
    frames: image.frames.map((f) => ({
      data: f.data,
      delayMs: Math.min(GIF_MAX_DELAY_MS, Math.max(20, Math.round(f.delayMs * factor))),
    })),
  };
}
