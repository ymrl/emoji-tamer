import { GIFEncoder, quantize, applyPalette } from 'gifenc';
import UPNG from 'upng-js';
import type { AnimatedImage, OutputFormat } from '../types/emoji';

export interface EncodeResult {
  blob: Blob;
  format: OutputFormat;
}

function encodeGif(image: AnimatedImage): Blob {
  const enc = GIFEncoder();
  const { width, height, frames } = image;

  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    const rgba = new Uint8Array(frame.data.buffer, frame.data.byteOffset, frame.data.byteLength);
    const palette = quantize(rgba, 256, { format: 'rgba4444', oneBitAlpha: true });
    const indices = applyPalette(rgba, palette, 'rgba4444');
    const transparentIndex = findTransparentIndex(palette);
    enc.writeFrame(indices, width, height, {
      palette,
      delay: frame.delayMs,
      transparent: transparentIndex >= 0,
      transparentIndex: transparentIndex >= 0 ? transparentIndex : 0,
      repeat: 0,
      dispose: 2,
    });
  }
  enc.finish();
  return new Blob([enc.bytes() as BlobPart], { type: 'image/gif' });
}

function findTransparentIndex(palette: number[][]): number {
  for (let i = 0; i < palette.length; i++) {
    if ((palette[i][3] ?? 255) === 0) return i;
  }
  return -1;
}

function encodeApng(image: AnimatedImage): Blob {
  const buffers = image.frames.map((f) => {
    const u8 = new Uint8Array(f.data.byteLength);
    u8.set(f.data);
    return u8.buffer;
  });
  const delays = image.frames.map((f) => f.delayMs);
  const png = UPNG.encode(buffers, image.width, image.height, 0, delays);
  return new Blob([png as BlobPart], { type: 'image/apng' });
}

export function encode(image: AnimatedImage, format: OutputFormat): EncodeResult {
  if (format === 'gif') return { blob: encodeGif(image), format };
  return { blob: encodeApng(image), format };
}

export function defaultOutputFormat(image: AnimatedImage): OutputFormat {
  if (image.sourceFormat === 'gif') return 'gif';
  return 'apng';
}
