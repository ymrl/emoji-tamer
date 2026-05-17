import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n/context';
import type { AnimatedImage } from '../types/emoji';

interface EmojiPreviewProps {
  image: AnimatedImage;
  size?: number;
  className?: string;
}

export function EmojiPreview({ image, size = 128, className }: EmojiPreviewProps) {
  const { t } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playing, setPlaying] = useState(false);
  const hasAnimation = image.frames.length > 1;

  useEffect(() => {
    setPlaying(false);
  }, [image]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawFrame = (i: number) => {
      const frame = image.frames[i];
      const imageData = new ImageData(
        new Uint8ClampedArray(frame.data),
        image.width,
        image.height
      );
      ctx.putImageData(imageData, 0, 0);
    };

    drawFrame(0);

    if (!playing || !hasAnimation) return;

    let frameIndex = 0;
    let elapsed = 0;
    let lastTimestamp = performance.now();
    let rafId = 0;
    let cancelled = false;

    const step = (now: number) => {
      if (cancelled) return;
      const dt = now - lastTimestamp;
      lastTimestamp = now;
      elapsed += dt;
      const currentDelay = Math.max(20, image.frames[frameIndex].delayMs);
      if (elapsed >= currentDelay) {
        elapsed -= currentDelay;
        frameIndex = (frameIndex + 1) % image.frames.length;
        drawFrame(frameIndex);
      }
      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      drawFrame(0);
    };
  }, [image, playing, hasAnimation]);

  const buttonLabel = playing ? t.pauseAnimation : t.playAnimation;

  return (
    <button
      type="button"
      onClick={() => hasAnimation && setPlaying((p) => !p)}
      disabled={!hasAnimation}
      aria-pressed={hasAnimation ? playing : undefined}
      aria-label={hasAnimation ? buttonLabel : undefined}
      className={
        'relative inline-block p-0 border-0 bg-transparent ' +
        (hasAnimation
          ? 'cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500'
          : 'cursor-default')
      }
    >
      <canvas
        ref={canvasRef}
        style={{
          width: size,
          height: size,
          imageRendering: 'pixelated',
          background:
            'conic-gradient(from 45deg, #e5e7eb 0% 25%, #f3f4f6 25% 50%, #e5e7eb 50% 75%, #f3f4f6 75% 100%)',
          backgroundSize: '16px 16px',
        }}
        className={className}
      />
      {hasAnimation && !playing && (
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-black/55 text-white">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </span>
      )}
    </button>
  );
}
