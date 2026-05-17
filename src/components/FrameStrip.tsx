import { useEffect, useMemo, useRef } from 'react';
import { useI18n } from '../i18n/context';
import type { AnimatedImage, Frame } from '../types/emoji';
import type { FlashEvent, FlashKind } from '../types/detection';

interface FrameStripProps {
  image: AnimatedImage;
  events?: FlashEvent[];
  thumbSize?: number;
}

interface FrameThumbProps {
  frame: Frame;
  index: number;
  width: number;
  height: number;
  thumbSize: number;
  kinds: ReadonlySet<FlashKind>;
}

const KIND_ORDER: FlashKind[] = ['general', 'red', 'motion'];
const KIND_COLOR: Record<FlashKind, string> = {
  general: '#6366f1',
  red: '#ef4444',
  motion: '#f59e0b',
};

function FrameThumb({ frame, index, width, height, thumbSize, kinds }: FrameThumbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { t } = useI18n();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const imageData = new ImageData(new Uint8ClampedArray(frame.data), width, height);
    ctx.putImageData(imageData, 0, 0);
  }, [frame, width, height]);

  const kindLabel: Record<FlashKind, string> = {
    general: t.generalFlash,
    red: t.redFlash,
    motion: t.motion,
  };

  return (
    <div className="flex-none flex flex-col items-center gap-1">
      <canvas
        ref={canvasRef}
        style={{
          width: thumbSize,
          height: thumbSize,
          imageRendering: 'pixelated',
          background:
            'conic-gradient(from 45deg, #e5e7eb 0% 25%, #f3f4f6 25% 50%, #e5e7eb 50% 75%, #f3f4f6 75% 100%)',
          backgroundSize: '8px 8px',
        }}
        className="rounded border border-neutral-200 dark:border-neutral-800"
      />
      <div className="flex gap-1">
        {KIND_ORDER.map((kind) => {
          const active = kinds.has(kind);
          return (
            <span
              key={kind}
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: KIND_COLOR[kind],
                opacity: active ? 1 : 0.15,
              }}
            >
              {active && <span className="sr-only">{kindLabel[kind]}</span>}
            </span>
          );
        })}
      </div>
      <span className="text-[10px] font-mono text-neutral-500 leading-tight whitespace-nowrap">
        #{index} · {Math.max(20, frame.delayMs)}ms
      </span>
    </div>
  );
}

const EMPTY_SET: ReadonlySet<FlashKind> = new Set();

export function FrameStrip({ image, events, thumbSize = 64 }: FrameStripProps) {
  const kindsByFrame = useMemo(() => {
    const map = new Map<number, Set<FlashKind>>();
    if (events) {
      for (const e of events) {
        let set = map.get(e.frameIndex);
        if (!set) {
          set = new Set();
          map.set(e.frameIndex, set);
        }
        set.add(e.kind);
      }
    }
    return map;
  }, [events]);

  return (
    <div className="flex flex-nowrap gap-2 overflow-x-auto pb-2">
      {image.frames.map((frame, i) => (
        <FrameThumb
          key={i}
          frame={frame}
          index={i}
          width={image.width}
          height={image.height}
          thumbSize={thumbSize}
          kinds={kindsByFrame.get(i) ?? EMPTY_SET}
        />
      ))}
    </div>
  );
}
