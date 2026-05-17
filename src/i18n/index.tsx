import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ja } from './ja';
import type { Dict } from './ja';
import { en } from './en';
import { I18nContext } from './context';
import type { I18nContextValue, Lang } from './context';

const DICTS: Record<Lang, Dict> = { ja, en };

function detectInitialLang(): Lang {
  if (typeof navigator === 'undefined') return 'ja';
  const stored =
    typeof localStorage !== 'undefined' ? localStorage.getItem('emoji-tamer-lang') : null;
  if (stored === 'ja' || stored === 'en') return stored;
  return navigator.language?.toLowerCase().startsWith('ja') ? 'ja' : 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectInitialLang);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const value = useMemo<I18nContextValue>(() => {
    const setLang = (l: Lang) => {
      setLangState(l);
      try {
        localStorage.setItem('emoji-tamer-lang', l);
      } catch {
        // ignore storage errors
      }
    };
    return { lang, setLang, t: DICTS[lang] };
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
