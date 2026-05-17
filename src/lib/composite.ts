import { parseGIF, decompressFrames } from 'gifuct-js';
import type { Frame, AnimatedImage } from '../types/emoji';

export function compositeGif(buffer: ArrayBuffer): AnimatedImage {
  const parsed = parseGIF(buffer);
  const frames = decompressFrames(parsed, true);
  const width = parsed.lsd.width;
  const height = parsed.lsd.height;

  const composited: Frame[] = [];
  const canvasBuf = new Uint8ClampedArray(width * height * 4);

  for (const f of frames) {
    const { dims, patch, disposalType } = f;

    let savedBackup: Uint8ClampedArray | null = null;
    if (disposalType === 3) {
      savedBackup = new Uint8ClampedArray(canvasBuf);
    }

    const dx = dims.left;
    const dy = dims.top;
    const dw = dims.width;
    const dh = dims.height;
    for (let row = 0; row < dh; row++) {
      const dstY = dy + row;
      if (dstY < 0 || dstY >= height) continue;
      const dstRowStart = (dstY * width + dx) * 4;
      const srcRowStart = row * dw * 4;
      for (let col = 0; col < dw; col++) {
        const a = patch[srcRowStart + col * 4 + 3];
        if (a === 0) continue;
        const dstX = dx + col;
        if (dstX < 0 || dstX >= width) continue;
        const dstIdx = dstRowStart + col * 4;
        canvasBuf[dstIdx] = patch[srcRowStart + col * 4];
        canvasBuf[dstIdx + 1] = patch[srcRowStart + col * 4 + 1];
        canvasBuf[dstIdx + 2] = patch[srcRowStart + col * 4 + 2];
        canvasBuf[dstIdx + 3] = a;
      }
    }

    composited.push({
      data: new Uint8ClampedArray(canvasBuf),
      delayMs: Math.max(20, (f.delay ?? 0) * 10),
    });

    if (disposalType === 2) {
      for (let row = 0; row < dh; row++) {
        const dstY = dy + row;
        if (dstY < 0 || dstY >= height) continue;
        const dstRowStart = (dstY * width + dx) * 4;
        for (let col = 0; col < dw; col++) {
          const dstX = dx + col;
          if (dstX < 0 || dstX >= width) continue;
          const dstIdx = dstRowStart + col * 4;
          canvasBuf[dstIdx] = 0;
          canvasBuf[dstIdx + 1] = 0;
          canvasBuf[dstIdx + 2] = 0;
          canvasBuf[dstIdx + 3] = 0;
        }
      }
    } else if (disposalType === 3 && savedBackup) {
      canvasBuf.set(savedBackup);
    }
  }

  return {
    width,
    height,
    frames: composited,
    sourceFormat: 'gif',
    loop: 0,
  };
}
