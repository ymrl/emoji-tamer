import { useId } from 'react';
import { useI18n } from '../i18n/context';
import type { Thresholds } from '../types/detection';
import { DEFAULT_THRESHOLDS } from '../types/detection';

interface ThresholdPanelProps {
  value: Thresholds;
  onChange: (next: Thresholds) => void;
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
  fractionDigits?: number;
}

function Slider({ label, value, min, max, step, onChange, fractionDigits = 2 }: SliderProps) {
  const id = useId();
  return (
    <div className="block">
      <div className="flex items-center justify-between text-xs mb-0.5">
        <label htmlFor={id}>{label}</label>
        <span aria-hidden="true" className="font-mono text-neutral-600 dark:text-neutral-300">
          {value.toFixed(fractionDigits)}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-indigo-500"
      />
    </div>
  );
}

export function ThresholdPanel({ value, onChange }: ThresholdPanelProps) {
  const { t } = useI18n();
  const setGeneral = (patch: Partial<Thresholds['general']>) =>
    onChange({ ...value, general: { ...value.general, ...patch } });
  const setRed = (patch: Partial<Thresholds['red']>) =>
    onChange({ ...value, red: { ...value.red, ...patch } });
  const setMotion = (patch: Partial<Thresholds['motion']>) =>
    onChange({ ...value, motion: { ...value.motion, ...patch } });

  return (
    <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 bg-white dark:bg-neutral-900 space-y-4 text-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">{t.thresholds}</h2>
        <button
          type="button"
          onClick={() => onChange(DEFAULT_THRESHOLDS)}
          className="text-xs text-indigo-600 hover:underline"
        >
          {t.resetThresholds}
        </button>
      </div>

      <fieldset className="space-y-2">
        <legend className="font-medium text-xs uppercase tracking-wide text-neutral-500">
          {t.generalFlash}
        </legend>
        <Slider
          label={t.thresholdGeneralLumDelta}
          value={value.general.lumDelta}
          min={0.05}
          max={0.5}
          step={0.01}
          onChange={(n) => setGeneral({ lumDelta: n })}
        />
        <Slider
          label={t.thresholdGeneralDarker}
          value={value.general.darkerMax}
          min={0.5}
          max={1}
          step={0.01}
          onChange={(n) => setGeneral({ darkerMax: n })}
        />
        <Slider
          label={t.thresholdGeneralArea}
          value={value.general.areaPct}
          min={1}
          max={100}
          step={1}
          fractionDigits={0}
          onChange={(n) => setGeneral({ areaPct: n })}
        />
        <Slider
          label={t.thresholdGeneralHz}
          value={value.general.hz}
          min={1}
          max={15}
          step={0.5}
          fractionDigits={1}
          onChange={(n) => setGeneral({ hz: n })}
        />
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="font-medium text-xs uppercase tracking-wide text-neutral-500">
          {t.redFlash}
        </legend>
        <Slider
          label={t.thresholdRedArea}
          value={value.red.areaPct}
          min={1}
          max={100}
          step={1}
          fractionDigits={0}
          onChange={(n) => setRed({ areaPct: n })}
        />
        <Slider
          label={t.thresholdRedHz}
          value={value.red.hz}
          min={1}
          max={15}
          step={0.5}
          fractionDigits={1}
          onChange={(n) => setRed({ hz: n })}
        />
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="font-medium text-xs uppercase tracking-wide text-neutral-500">
          {t.motion}
        </legend>
        <Slider
          label={t.thresholdMotionPixel}
          value={value.motion.pixelDeltaPct}
          min={1}
          max={50}
          step={1}
          fractionDigits={0}
          onChange={(n) => setMotion({ pixelDeltaPct: n })}
        />
        <Slider
          label={t.thresholdMotionArea}
          value={value.motion.areaPct}
          min={1}
          max={100}
          step={1}
          fractionDigits={0}
          onChange={(n) => setMotion({ areaPct: n })}
        />
        <Slider
          label={t.thresholdMotionWindow}
          value={value.motion.windowMs}
          min={20}
          max={1000}
          step={10}
          fractionDigits={0}
          onChange={(n) => setMotion({ windowMs: n })}
        />
        <Slider
          label={t.thresholdMotionHz}
          value={value.motion.hz}
          min={1}
          max={30}
          step={0.5}
          fractionDigits={1}
          onChange={(n) => setMotion({ hz: n })}
        />
      </fieldset>
    </div>
  );
}
