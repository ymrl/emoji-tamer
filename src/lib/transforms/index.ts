import type { AnimatedImage } from '../../types/emoji';
import type { TransformOptions } from '../../types/transform';
import { slowdown } from './slowdown';
import { decimate } from './decimate';
import { brightness } from './brightness';
import { saturation } from './saturation';

export function applyTransform(image: AnimatedImage, opts: TransformOptions): AnimatedImage {
  switch (opts.kind) {
    case 'slowdown':
      return slowdown(image, opts.factor);
    case 'decimate':
      return decimate(image, opts.keepEvery);
    case 'brightness':
      return brightness(image, opts.factor);
    case 'saturation':
      return saturation(image, opts.factor);
  }
}
