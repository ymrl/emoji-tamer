import { useI18n } from '../i18n/context';
import type { DetectionResult, Thresholds } from '../types/detection';

interface DetectionReportProps {
  detection: DetectionResult;
  thresholds: Thresholds;
  headingLevel?: 3 | 4;
}

function Badge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ' +
        (ok
          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
          : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200')
      }
    >
      <span
        className={'w-1.5 h-1.5 rounded-full ' + (ok ? 'bg-emerald-500' : 'bg-rose-500')}
      />
      {label}
    </span>
  );
}

export function DetectionReport({ detection, thresholds, headingLevel = 3 }: DetectionReportProps) {
  const { t } = useI18n();
  const Heading = headingLevel === 4 ? 'h4' : 'h3';

  const row = (
    label: string,
    measured: number,
    limit: number,
    passes: boolean
  ) => (
    <div className="flex items-center justify-between py-1 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
      <dt className="text-sm">{label}</dt>
      <dd className="flex items-center gap-3 m-0">
        <span className="text-sm font-mono">
          {measured.toFixed(1)} / {limit} {t.hzSuffix}
        </span>
        <Badge ok={passes} label={passes ? t.pass : t.fail} />
      </dd>
    </div>
  );

  return (
    <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 bg-white dark:bg-neutral-900">
      <div className="flex items-center justify-between mb-2">
        <Heading className="font-semibold text-sm">{t.detection}</Heading>
        <Badge ok={detection.passes} label={detection.passes ? t.pass : t.fail} />
      </div>
      <dl className="m-0">
        {row(t.generalFlash, detection.generalHz, thresholds.general.hz, detection.generalPasses)}
        {row(t.redFlash, detection.redHz, thresholds.red.hz, detection.redPasses)}
        {row(t.motion, detection.motionHz, thresholds.motion.hz, detection.motionPasses)}
      </dl>
    </div>
  );
}
