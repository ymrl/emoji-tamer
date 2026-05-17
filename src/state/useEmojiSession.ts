import { useCallback, useEffect, useReducer, useRef } from 'react';
import type { AnimatedImage } from '../types/emoji';
import type { DetectionResult, Thresholds } from '../types/detection';
import { DEFAULT_THRESHOLDS } from '../types/detection';
import type { TransformKind, TransformOptions } from '../types/transform';
import { DEFAULT_TRANSFORM_OPTIONS } from '../types/transform';
import { getPipeline, terminatePipeline } from '../workers/pipelineClient';

const OUTPUT_FORMAT = 'gif' as const;

export interface TransformResultEntry {
  kind: TransformKind;
  opts: TransformOptions;
  image: AnimatedImage;
  detection: DetectionResult;
  blobUrl: string;
}

interface SessionState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;
  sessionId: string | null;
  originalImage: AnimatedImage | null;
  originalDetection: DetectionResult | null;
  thresholds: Thresholds;
  results: TransformResultEntry[];
  transformParams: Record<TransformKind, TransformOptions>;
  inFlightTransforms: Set<TransformKind>;
  fileName: string | null;
}

type Action =
  | { type: 'start-load' }
  | { type: 'load-success'; sessionId: string; image: AnimatedImage; detection: DetectionResult; fileName: string }
  | { type: 'load-error'; message: string }
  | { type: 'set-thresholds'; thresholds: Thresholds }
  | { type: 'update-detection'; detection: DetectionResult }
  | { type: 'transform-start'; kind: TransformKind }
  | { type: 'transform-success'; entry: TransformResultEntry }
  | { type: 'transform-error'; kind: TransformKind; message: string }
  | { type: 'set-transform-param'; opts: TransformOptions }
  | { type: 'reset' };

function initialState(): SessionState {
  return {
    status: 'idle',
    errorMessage: null,
    sessionId: null,
    originalImage: null,
    originalDetection: null,
    thresholds: DEFAULT_THRESHOLDS,
    results: [],
    transformParams: { ...DEFAULT_TRANSFORM_OPTIONS },
    inFlightTransforms: new Set(),
    fileName: null,
  };
}

function reducer(state: SessionState, action: Action): SessionState {
  switch (action.type) {
    case 'start-load':
      return { ...initialState(), thresholds: state.thresholds, status: 'loading' };
    case 'load-success':
      return {
        ...state,
        status: 'ready',
        errorMessage: null,
        sessionId: action.sessionId,
        originalImage: action.image,
        originalDetection: action.detection,
        results: [],
        fileName: action.fileName,
      };
    case 'load-error':
      return { ...state, status: 'error', errorMessage: action.message };
    case 'set-thresholds':
      return { ...state, thresholds: action.thresholds };
    case 'update-detection':
      return { ...state, originalDetection: action.detection };
    case 'transform-start': {
      const next = new Set(state.inFlightTransforms);
      next.add(action.kind);
      return { ...state, inFlightTransforms: next };
    }
    case 'transform-success': {
      const next = new Set(state.inFlightTransforms);
      next.delete(action.entry.kind);
      for (const r of state.results) {
        if (r.kind === action.entry.kind) URL.revokeObjectURL(r.blobUrl);
      }
      const stripped = state.results.filter((r) => r.kind !== action.entry.kind);
      return {
        ...state,
        inFlightTransforms: next,
        results: [...stripped, action.entry],
      };
    }
    case 'transform-error': {
      const next = new Set(state.inFlightTransforms);
      next.delete(action.kind);
      return { ...state, inFlightTransforms: next, errorMessage: action.message };
    }
    case 'set-transform-param':
      return {
        ...state,
        transformParams: { ...state.transformParams, [action.opts.kind]: action.opts },
      };
    case 'reset':
      state.results.forEach((r) => URL.revokeObjectURL(r.blobUrl));
      return { ...initialState(), thresholds: state.thresholds };
  }
}

export function useEmojiSession() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    return () => {
      stateRef.current.results.forEach((r) => URL.revokeObjectURL(r.blobUrl));
      terminatePipeline();
    };
  }, []);

  const loadFile = useCallback(async (file: File) => {
    dispatch({ type: 'start-load' });
    try {
      const buffer = await file.arrayBuffer();
      const mime = file.type || guessMimeFromName(file.name);
      const pipeline = getPipeline();
      const result = await pipeline.decodeAndDetect(buffer, mime, stateRef.current.thresholds);
      dispatch({
        type: 'load-success',
        sessionId: result.sessionId,
        image: result.image,
        detection: result.detection,
        fileName: file.name,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      dispatch({ type: 'load-error', message });
    }
  }, []);

  const applyThresholds = useCallback(async (next: Thresholds) => {
    dispatch({ type: 'set-thresholds', thresholds: next });
    const { sessionId } = stateRef.current;
    if (!sessionId) return;
    try {
      const pipeline = getPipeline();
      const detection = await pipeline.redetect(sessionId, next);
      dispatch({ type: 'update-detection', detection });
    } catch {
      // ignore — UI will show stale numbers
    }
  }, []);

  const setTransformParam = useCallback((opts: TransformOptions) => {
    dispatch({ type: 'set-transform-param', opts });
  }, []);

  const runTransform = useCallback(async (kind: TransformKind) => {
    const current = stateRef.current;
    if (!current.sessionId) return;
    const opts = current.transformParams[kind];
    dispatch({ type: 'transform-start', kind });
    try {
      const pipeline = getPipeline();
      const result = await pipeline.transformAndDetect(
        current.sessionId,
        opts,
        OUTPUT_FORMAT,
        current.thresholds
      );
      const blobUrl = URL.createObjectURL(result.blob);
      dispatch({
        type: 'transform-success',
        entry: {
          kind,
          opts,
          image: result.image,
          detection: result.detection,
          blobUrl,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      dispatch({ type: 'transform-error', kind, message });
    }
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'reset' });
  }, []);

  return {
    state,
    loadFile,
    applyThresholds,
    setTransformParam,
    runTransform,
    reset,
  };
}

function guessMimeFromName(name: string): string {
  const lower = name.toLowerCase();
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.png') || lower.endsWith('.apng')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'application/octet-stream';
}
