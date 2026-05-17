import { useI18n } from '../i18n/context';
import type { AnimatedImage } from '../types/emoji';
import type { DetectionResult, Thresholds } from '../types/detection';
import { DetectionReport } from './DetectionReport';
import { EmojiPreview } from './EmojiPreview';
import { FrameStrip } from './FrameStrip';
import { LuminanceGraph } from './LuminanceGraph';

interface OriginalPanelProps {
  image: AnimatedImage;
  detection: DetectionResult;
  thresholds: Thresholds;
  fileName: string | null;
}

function formatDuration(image: AnimatedImage): string {
  const totalMs = image.frames.reduce((acc, f) => acc + Math.max(20, f.delayMs), 0);
  return `${(totalMs / 1000).toFixed(2)} s`;
}

export function OriginalPanel({ image, detection, thresholds, fileName }: OriginalPanelProps) {
  const { t } = useI18n();
  return (
    <article className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 bg-white dark:bg-neutral-900 flex flex-col gap-3 min-w-0">
      <header className="flex items-center justify-between">
        <h2 className="font-semibold text-base">{t.panelOriginal}</h2>
        {fileName && (
          <span className="text-xs text-neutral-500 truncate max-w-[60%]" title={fileName}>
            {fileName}
          </span>
        )}
      </header>
      <div className="flex flex-wrap gap-4 items-start">
        <EmojiPreview image={image} size={128} />
        <dl className="text-xs grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
          <dt className="text-neutral-500">{t.sourceFormatLabel}</dt>
          <dd className="font-mono uppercase">{image.sourceFormat}</dd>
          <dt className="text-neutral-500">{t.sizeLabel}</dt>
          <dd className="font-mono">
            {image.width} × {image.height}
          </dd>
          <dt className="text-neutral-500">{t.framesLabel}</dt>
          <dd className="font-mono">{image.frames.length}</dd>
          <dt className="text-neutral-500">{t.durationLabel}</dt>
          <dd className="font-mono">{formatDuration(image)}</dd>
        </dl>
      </div>
      <div className="min-w-0">
        <p className="text-xs text-neutral-700 dark:text-neutral-300 mb-1">{t.frameList}</p>
        <FrameStrip image={image} events={detection.events} />
      </div>
      <DetectionReport detection={detection} thresholds={thresholds} />
      <LuminanceGraph
        values={detection.meanLuminancePerFrame}
        events={detection.events}
      />
    </article>
  );
}
