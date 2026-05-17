import type { AnimatedImage, Frame } from '../../types/emoji';

export function decimate(image: AnimatedImage, keepEvery: number): AnimatedImage {
  const step = Math.max(1, Math.floor(keepEvery));
  if (step === 1 || image.frames.length <= 1) return image;

  const out: Frame[] = [];
  let acc = 0;
  for (let i = 0; i < image.frames.length; i++) {
    const f = image.frames[i];
    if (i % step === 0) {
      out.push({ data: f.data, delayMs: Math.max(20, f.delayMs + acc) });
      acc = 0;
    } else {
      acc += f.delayMs;
    }
  }
  if (acc > 0 && out.length > 0) {
    out[out.length - 1] = {
      data: out[out.length - 1].data,
      delayMs: out[out.length - 1].delayMs + acc,
    };
  }
  return { ...image, frames: out };
}
