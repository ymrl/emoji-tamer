import { useMemo } from 'react';
import { Dropzone } from './components/Dropzone';
import { LanguageToggle } from './components/LanguageToggle';
import { OriginalPanel } from './components/OriginalPanel';
import { ThresholdPanel } from './components/ThresholdPanel';
import { TransformActions } from './components/TransformActions';
import { I18nProvider } from './i18n';
import { useI18n } from './i18n/context';
import { useEmojiSession } from './state/useEmojiSession';
import type { TransformResultEntry } from './state/useEmojiSession';
import { TRANSFORM_KINDS } from './types/transform';
import type { TransformKind } from './types/transform';

function AppShell() {
  const { t } = useI18n();
  const {
    state,
    loadFile,
    applyThresholds,
    setTransformParam,
    runTransform,
  } = useEmojiSession();

  const fileBase = useMemo(() => {
    if (!state.fileName) return 'emoji';
    const idx = state.fileName.lastIndexOf('.');
    return idx > 0 ? state.fileName.slice(0, idx) : state.fileName;
  }, [state.fileName]);

  const allFailed =
    state.results.length === TRANSFORM_KINDS.length && state.results.every((r) => !r.detection.passes);

  const resultsByKind = useMemo<Partial<Record<TransformKind, TransformResultEntry>>>(() => {
    const map: Partial<Record<TransformKind, TransformResultEntry>> = {};
    for (const r of state.results) map[r.kind] = r;
    return map;
  }, [state.results]);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight">{t.appTitle}</h1>
            <p className="text-xs text-neutral-500">{t.appTagline}</p>
          </div>
          <LanguageToggle />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 grid lg:grid-cols-[280px_minmax(0,1fr)] gap-6">
        <aside className="space-y-4">
          <h2 className="sr-only">{t.selectFile}</h2>
          <Dropzone busy={state.status === 'loading'} onFile={loadFile} />
          <ThresholdPanel value={state.thresholds} onChange={applyThresholds} />
        </aside>

        <section className="space-y-4 min-w-0">
          {state.status === 'idle' && (
            <p className="text-neutral-500 text-sm">{t.emptyHint}</p>
          )}
          {state.status === 'loading' && (
            <p className="text-neutral-500 text-sm">{t.processing}</p>
          )}
          {state.status === 'error' && state.errorMessage && (
            <div className="border border-rose-300 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-200 rounded-lg p-3 text-sm">
              {t.decodeError}
              <div className="mt-1 text-xs opacity-70 break-all">{state.errorMessage}</div>
            </div>
          )}

          {state.originalImage && state.originalDetection && (
            <>
              {state.originalImage.frames.length < 2 && (
                <div className="border border-amber-300 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 rounded-lg p-3 text-sm">
                  {t.noAnimation}
                </div>
              )}
              {Math.max(state.originalImage.width, state.originalImage.height) > 1024 && (
                <div className="border border-amber-300 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 rounded-lg p-3 text-sm">
                  {t.largeImageWarning}
                </div>
              )}
              {!state.originalDetection.passes && state.results.length === 0 && (
                <div className="border border-indigo-200 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-800 dark:text-indigo-200 rounded-lg p-3 text-sm">
                  {t.notYetTriedBanner}
                </div>
              )}
              {allFailed && (
                <div className="border border-rose-300 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-200 rounded-lg p-3 text-sm">
                  {t.allTransformsFail}
                </div>
              )}

              <OriginalPanel
                image={state.originalImage}
                detection={state.originalDetection}
                thresholds={state.thresholds}
                fileName={state.fileName}
              />

              <h2 className="text-base font-semibold pt-2">{t.panelTransforms}</h2>
              <TransformActions
                image={state.originalImage}
                params={state.transformParams}
                inFlight={state.inFlightTransforms}
                results={resultsByKind}
                thresholds={state.thresholds}
                fileBaseName={fileBase}
                onParamChange={setTransformParam}
                onApply={runTransform}
              />
            </>
          )}
        </section>
      </main>
    </div>
  );
}

function App() {
  return (
    <I18nProvider>
      <AppShell />
    </I18nProvider>
  );
}

export default App;
