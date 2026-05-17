import { useCallback, useRef, useState } from 'react';
import { useI18n } from '../i18n/context';

interface DropzoneProps {
  onFile: (file: File) => void;
  busy: boolean;
}

const ACCEPT = 'image/gif,image/png,image/apng,image/webp';

export function Dropzone({ onFile, busy }: DropzoneProps) {
  const { t } = useI18n();
  const [hover, setHover] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const pickFile = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const f = files[0];
      onFile(f);
    },
    [onFile]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setHover(true);
      }}
      onDragLeave={() => setHover(false)}
      onDrop={(e) => {
        e.preventDefault();
        setHover(false);
        pickFile(e.dataTransfer.files);
      }}
      className={
        'border-2 border-dashed rounded-xl p-8 min-h-[12rem] flex flex-col items-center justify-center text-center transition-colors cursor-pointer select-none ' +
        (hover
          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40'
          : 'border-neutral-300 dark:border-neutral-700 hover:border-indigo-400')
      }
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      aria-busy={busy}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => pickFile(e.target.files)}
      />
      <p className="font-semibold text-lg pointer-events-none">
        {hover ? t.dropzoneActive : t.dropzoneIdle}
      </p>
      <p className="text-sm text-neutral-500 mt-1 pointer-events-none">{t.dropzoneOr}</p>
    </div>
  );
}
