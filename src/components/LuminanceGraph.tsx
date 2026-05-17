import { useMemo } from 'react';
import { useI18n } from '../i18n/context';

interface LuminanceGraphProps {
  values: number[];
  events?: { frameIndex: number; kind: 'general' | 'red' | 'motion' }[];
  height?: number;
  width?: number;
}

export function LuminanceGraph({
  values,
  events = [],
  height = 96,
  width = 360,
}: LuminanceGraphProps) {
  const { t } = useI18n();
  const path = useMemo(() => {
    if (values.length === 0) return '';
    if (values.length === 1) {
      const y = height - values[0] * height;
      return `M0,${y} L${width},${y}`;
    }
    return values
      .map((v, i) => {
        const x = (i / (values.length - 1)) * width;
        const y = height - v * height;
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');
  }, [values, width, height]);

  return (
    <div className="w-full">
      <p className="text-xs text-neutral-700 dark:text-neutral-300 mb-1">{t.meanLuminance}</p>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-24 bg-neutral-50 dark:bg-neutral-900 rounded border border-neutral-200 dark:border-neutral-800"
        preserveAspectRatio="none"
        role="img"
        aria-label={t.luminanceGraphLabel}
      >
        {events.map((e, i) => {
          const x = values.length <= 1 ? 0 : (e.frameIndex / (values.length - 1)) * width;
          const color =
            e.kind === 'red' ? '#ef4444' : e.kind === 'motion' ? '#f59e0b' : '#6366f1';
          return (
            <line
              key={`evt-${i}`}
              x1={x}
              x2={x}
              y1={0}
              y2={height}
              stroke={color}
              strokeOpacity={0.25}
              strokeWidth={1}
            />
          );
        })}
        <path d={path} stroke="#10b981" strokeWidth={1.5} fill="none" />
      </svg>
    </div>
  );
}
