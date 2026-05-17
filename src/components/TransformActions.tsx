import { useId } from 'react';
import { useI18n } from '../i18n/context';
import type { AnimatedImage } from '../types/emoji';
import type { Thresholds } from '../types/detection';
import type { TransformKind, TransformOptions } from '../types/transform';
import { TRANSFORM_KINDS } from '../types/transform';
import type { TransformResultEntry } from '../state/useEmojiSession';
import { DetectionReport } from './DetectionReport';
import { EmojiPreview } from './EmojiPreview';
import { LuminanceGraph } from './LuminanceGraph';

interface TransformActionsProps {
  image: AnimatedImage;
  params: Record<TransformKind, TransformOptions>;
  inFlight: Set<TransformKind>;
  results: Partial<Record<TransformKind, TransformResultEntry>>;
  thresholds: Thresholds;
  fileBaseName: string;
  onParamChange: (opts: TransformOptions) => void;
  onApply: (kind: TransformKind) => void;
}

interface SliderConfig {
  min: number;
  max: number;
  step: number;
  fractionDigits: number;
  needsAnimation: boolean;
}

const SLIDER_CONFIG: Record<TransformKind, SliderConfig> = {
  slowdown: { min: 1.25, max: 8, step: 0.25, fractionDigits: 2, needsAnimation: true },
  decimate: { min: 2, max: 8, step: 1, fractionDigits: 0, needsAnimation: true },
  brightness: { min: 0.2, max: 1, step: 0.05, fractionDigits: 2, needsAnimation: false },
  saturation: { min: 0, max: 1, step: 0.05, fractionDigits: 2, needsAnimation: false },
};

function getValue(opts: TransformOptions): number {
  switch (opts.kind) {
    case 'slowdown':
      return opts.factor;
    case 'decimate':
      return opts.keepEvery;
    case 'brightness':
      return opts.factor;
    case 'saturation':
      return opts.factor;
  }
}

function makeOpts(kind: TransformKind, n: number): TransformOptions {
  switch (kind) {
    case 'slowdown':
      return { kind: 'slowdown', factor: n };
    case 'decimate':
      return { kind: 'decimate', keepEvery: Math.round(n) };
    case 'brightness':
      return { kind: 'brightness', factor: n };
    case 'saturation':
      return { kind: 'saturation', factor: n };
  }
}

function labelFor(kind: TransformKind, t: ReturnType<typeof useI18n>['t']): string {
  switch (kind) {
    case 'slowdown':
      return t.transformSlowdown;
    case 'decimate':
      return t.transformDecimate;
    case 'brightness':
      return t.transformBrightness;
    case 'saturation':
      return t.transformSaturation;
  }
}

function paramLabelFor(kind: TransformKind, t: ReturnType<typeof useI18n>['t']): string {
  switch (kind) {
    case 'slowdown':
      return t.transformParamSlowdown;
    case 'decimate':
      return t.transformParamDecimate;
    case 'brightness':
      return t.transformParamBrightness;
    case 'saturation':
      return t.transformParamSaturation;
  }
}

export function TransformActions({
  image,
  params,
  inFlight,
  results,
  thresholds,
  fileBaseName,
  onParamChange,
  onApply,
}: TransformActionsProps) {
  const { t } = useI18n();
  const baseId = useId();
  const isStatic = image.frames.length < 2;

  return (
    <div className="space-y-4">
      {TRANSFORM_KINDS.map((kind) => {
        const config = SLIDER_CONFIG[kind];
        const disabled = config.needsAnimation && isStatic;
        const busy = inFlight.has(kind);
        const result = results[kind];
        const value = getValue(params[kind]);
        const downloadName = result ? `${fileBaseName}-${kind}.gif` : '';
        const sliderId = `${baseId}-${kind}`;

        return (
          <section
            key={kind}
            className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 bg-white dark:bg-neutral-900 flex flex-col gap-3"
          >
            <h3 className="font-medium text-sm">{labelFor(kind, t)}</h3>
            <div>
              <div className="flex items-center justify-between text-xs mb-0.5">
                <label
                  htmlFor={sliderId}
                  className="text-neutral-700 dark:text-neutral-300"
                >
                  {paramLabelFor(kind, t)}
                </label>
                <span aria-hidden="true" className="font-mono">
                  {value.toFixed(config.fractionDigits)}
                </span>
              </div>
              <input
                id={sliderId}
                type="range"
                min={config.min}
                max={config.max}
                step={config.step}
                value={value}
                onChange={(e) => onParamChange(makeOpts(kind, parseFloat(e.target.value)))}
                className="w-full accent-indigo-500"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => onApply(kind)}
                disabled={disabled || busy}
                className="px-3 py-1.5 rounded bg-indigo-600 text-white text-xs disabled:bg-neutral-300 disabled:text-neutral-500 hover:bg-indigo-500"
              >
                {busy ? '…' : t.apply}
              </button>
            </div>

            {result && (
              <>
                <div className="flex flex-wrap gap-4 items-start">
                  <EmojiPreview image={result.image} size={128} />
                  <div className="flex-1 min-w-[240px] space-y-3">
                    <DetectionReport
                      detection={result.detection}
                      thresholds={thresholds}
                      headingLevel={4}
                    />
                    <LuminanceGraph
                      values={result.detection.meanLuminancePerFrame}
                      events={result.detection.events}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <a
                    href={result.blobUrl}
                    download={downloadName}
                    className="px-3 py-1.5 rounded bg-emerald-700 text-white text-xs hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
                  >
                    {t.download}
                  </a>
                </div>
              </>
            )}
          </section>
        );
      })}
    </div>
  );
}
