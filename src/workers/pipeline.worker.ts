/// <reference lib="webworker" />
import './windowShim';
import * as Comlink from 'comlink';
import { decodeAnimated } from '../lib/decode';
import { detectFlashes } from '../lib/detect';
import { applyTransform } from '../lib/transforms';
import { encode } from '../lib/encode';
import type { AnimatedImage, OutputFormat } from '../types/emoji';
import type { DetectionResult, Thresholds } from '../types/detection';
import type { TransformOptions } from '../types/transform';

interface SessionState {
  image: AnimatedImage;
}

const sessions = new Map<string, SessionState>();

function newId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export interface DecodeAndDetectResult {
  sessionId: string;
  image: AnimatedImage;
  detection: DetectionResult;
}

export interface TransformAndDetectResult {
  blob: Blob;
  image: AnimatedImage;
  detection: DetectionResult;
  outputFormat: OutputFormat;
}

const api = {
  async decodeAndDetect(
    buffer: ArrayBuffer,
    mimeType: string,
    thresholds: Thresholds
  ): Promise<DecodeAndDetectResult> {
    const image = await decodeAnimated({ buffer, mimeType });
    const detection = detectFlashes(image, thresholds);
    const sessionId = newId();
    sessions.set(sessionId, { image });
    return { sessionId, image, detection };
  },

  async redetect(sessionId: string, thresholds: Thresholds): Promise<DetectionResult> {
    const session = sessions.get(sessionId);
    if (!session) throw new Error(`Unknown session ${sessionId}`);
    return detectFlashes(session.image, thresholds);
  },

  async transformAndDetect(
    sessionId: string,
    opts: TransformOptions,
    outputFormat: OutputFormat,
    thresholds: Thresholds
  ): Promise<TransformAndDetectResult> {
    const session = sessions.get(sessionId);
    if (!session) throw new Error(`Unknown session ${sessionId}`);
    const transformed = applyTransform(session.image, opts);
    const detection = detectFlashes(transformed, thresholds);
    const { blob } = encode(transformed, outputFormat);
    return { blob, image: transformed, detection, outputFormat };
  },

  async release(sessionId: string): Promise<void> {
    sessions.delete(sessionId);
  },
};

export type PipelineAPI = typeof api;

Comlink.expose(api);
