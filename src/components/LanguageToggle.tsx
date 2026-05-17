import { useI18n } from '../i18n/context';
import type { Lang } from '../i18n/context';

const SELECTED =
  'bg-white dark:bg-neutral-700 shadow-sm font-medium border border-indigo-600 dark:border-indigo-400';
const UNSELECTED =
  'border border-transparent text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100';

export function LanguageToggle() {
  const { lang, setLang, t } = useI18n();

  const button = (target: Lang, label: string) => (
    <button
      type="button"
      onClick={() => setLang(target)}
      aria-pressed={lang === target}
      className={'px-3 py-1 rounded ' + (lang === target ? SELECTED : UNSELECTED)}
    >
      {label}
    </button>
  );

  return (
    <div className="inline-flex gap-1 rounded-md bg-neutral-100 dark:bg-neutral-800 p-1 text-sm">
      {button('ja', t.languageJa)}
      {button('en', t.languageEn)}
    </div>
  );
}
