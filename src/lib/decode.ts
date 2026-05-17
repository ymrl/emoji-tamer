import UPNG from 'upng-js';
import { compositeGif } from './composite';
import type { AnimatedImage, Frame, SourceFormat } from '../types/emoji';

export interface DecodeInput {
  buffer: ArrayBuffer;
  mimeType: string;
}

function sourceFormatFromMime(mime: string): SourceFormat | null {
  const m = mime.toLowerCase();
  if (m.includes('gif')) return 'gif';
  if (m.includes('png') || m.includes('apng')) return 'apng';
  if (m.includes('webp')) return 'webp';
  return null;
}

interface ImageDecoderResultLike {
  image: { displayWidth: number; displayHeight: number; duration?: number | null; copyTo(dest: ArrayBufferView): Promise<unknown> };
  complete?: boolean;
}

interface ImageDecoderLike {
  tracks: { selectedTrack?: { frameCount: number; repetitionCount?: number } | null };
  decode(opts: { frameIndex: number }): Promise<ImageDecoderResultLike>;
  close(): void;
}

interface ImageDecoderCtor {
  new (init: { data: ArrayBuffer | ReadableStream<Uint8Array>; type: string }): ImageDecoderLike;
  isTypeSupported(mime: string): Promise<boolean>;
}

function hasImageDecoder(): boolean {
  return typeof (globalThis as unknown as { ImageDecoder?: unknown }).ImageDecoder === 'function';
}

async function decodeWithImageDecoder(
  buffer: ArrayBuffer,
  mime: string,
  fmt: SourceFormat
): Promise<AnimatedImage> {
  const Ctor = (globalThis as unknown as { ImageDecoder: ImageDecoderCtor }).ImageDecoder;
  if (!(await Ctor.isTypeSupported(mime))) {
    throw new Error(`ImageDecoder cannot decode ${mime}`);
  }
  const decoder = new Ctor({ data: buffer, type: mime });
  try {
    const probe = await decoder.decode({ frameIndex: 0 });
    const width = probe.image.displayWidth;
    const height = probe.image.displayHeight;

    let frameCount = decoder.tracks.selectedTrack?.frameCount ?? 1;
    const frames: Frame[] = [];

    for (let i = 0; i < frameCount; i++) {
      const result = i === 0 ? probe : await decoder.decode({ frameIndex: i });
      const buf = new Uint8ClampedArray(width * height * 4);
      await result.image.copyTo(buf);
      const durationUs = result.image.duration ?? 0;
      const delayMs = Math.max(20, Math.round(durationUs / 1000) || 100);
      frames.push({ data: buf, delayMs });

      if (result.complete === false && frameCount > 1) {
        // Some browsers report frameCount lazily — bail when it shrinks unexpectedly
        frameCount = decoder.tracks.selectedTrack?.frameCount ?? frameCount;
      }
    }

    return {
      width,
      height,
      frames,
      sourceFormat: fmt,
      loop: decoder.tracks.selectedTrack?.repetitionCount ?? 0,
    };
  } finally {
    decoder.close();
  }
}

function decodeApngFallback(buffer: ArrayBuffer): AnimatedImage {
  const decoded = UPNG.decode(buffer);
  const rgbaFrames = UPNG.toRGBA8(decoded);
  const width = decoded.width;
  const height = decoded.height;
  const frames: Frame[] = rgbaFrames.map((buf, i) => ({
    data: new Uint8ClampedArray(buf),
    delayMs: Math.max(20, decoded.frames[i]?.delay ?? 100),
  }));
  return { width, height, frames, sourceFormat: 'apng', loop: 0 };
}

export async function decodeAnimated(input: DecodeInput): Promise<AnimatedImage> {
  const fmt = sourceFormatFromMime(input.mimeType);
  if (!fmt) throw new Error('Unsupported MIME type');

  if (hasImageDecoder()) {
    try {
      return await decodeWithImageDecoder(input.buffer, input.mimeType, fmt);
    } catch (err) {
      if (fmt === 'webp') throw err;
      // fall through to format-specific fallback
    }
  }

  if (fmt === 'gif') return compositeGif(input.buffer);
  if (fmt === 'apng') return decodeApngFallback(input.buffer);
  throw new Error('WebP decoding requires WebCodecs ImageDecoder, which this environment lacks');
}
