declare module 'gifenc' {
  export interface GifPaletteOptions {
    format?: 'rgb444' | 'rgb565' | 'rgba4444';
    clearAlpha?: boolean;
    clearAlphaThreshold?: number;
    clearAlphaColor?: number;
    oneBitAlpha?: boolean | number;
  }

  export function quantize(
    rgba: Uint8ClampedArray | Uint8Array,
    maxColors: number,
    options?: GifPaletteOptions
  ): number[][];

  export function applyPalette(
    rgba: Uint8ClampedArray | Uint8Array,
    palette: number[][],
    format?: 'rgb444' | 'rgb565' | 'rgba4444'
  ): Uint8Array;

  export interface GifFrameOptions {
    palette?: number[][];
    delay?: number;
    transparent?: boolean;
    transparentIndex?: number;
    repeat?: number;
    dispose?: number;
    first?: boolean;
    colorDepth?: number;
  }

  export interface GifEncoderInstance {
    writeFrame(
      index: Uint8Array,
      width: number,
      height: number,
      opts?: GifFrameOptions
    ): void;
    finish(): void;
    bytes(): Uint8Array;
    bytesView(): Uint8Array;
    reset(): void;
    readonly buffer: ArrayBuffer;
  }

  export function GIFEncoder(opts?: { initialCapacity?: number; auto?: boolean }): GifEncoderInstance;
}

declare module 'upng-js' {
  export interface DecodedImage {
    width: number;
    height: number;
    depth: number;
    ctype: number;
    frames: Array<{
      rect: { x: number; y: number; width: number; height: number };
      delay: number;
      dispose: number;
      blend: number;
    }>;
    tabs: Record<string, unknown>;
    data: Uint8Array;
  }

  export function decode(buffer: ArrayBuffer | Uint8Array): DecodedImage;
  export function toRGBA8(decoded: DecodedImage): ArrayBuffer[];
  export function encode(
    bufs: ArrayBuffer[],
    width: number,
    height: number,
    colors: number,
    delays?: number[]
  ): ArrayBuffer;

  const UPNG: {
    decode: typeof decode;
    toRGBA8: typeof toRGBA8;
    encode: typeof encode;
  };
  export default UPNG;
}
