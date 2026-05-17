import { hslToRgb, rgbToHsl } from '../color';
import type { AnimatedImage } from '../../types/emoji';

export function saturation(image: AnimatedImage, factor: number): AnimatedImage {
  const f = Math.max(0, Math.min(1, factor));
  return {
    ...image,
    frames: image.frames.map((frame) => {
      const out = new Uint8ClampedArray(frame.data.length);
      for (let i = 0; i < frame.data.length; i += 4) {
        const r = frame.data[i];
        const g = frame.data[i + 1];
        const b = frame.data[i + 2];
        const a = frame.data[i + 3];
        const [h, s, l] = rgbToHsl(r, g, b);
        const [nr, ng, nb] = hslToRgb(h, s * f, l);
        out[i] = nr;
        out[i + 1] = ng;
        out[i + 2] = nb;
        out[i + 3] = a;
      }
      return { data: out, delayMs: frame.delayMs };
    }),
  };
}
