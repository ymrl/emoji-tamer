import { SRGB_TO_LINEAR_LUT, isSaturatedRedLinear } from './color';
import type { AnimatedImage } from '../types/emoji';
import type {
  DetectionResult,
  FlashEvent,
  Thresholds,
} from '../types/detection';

interface PerPixelState {
  lastExtremum: Float32Array;
  direction: Int8Array;
  extremumIsRed: Uint8Array;
}

function computeLuminanceArrays(image: AnimatedImage): {
  luminance: Float32Array[];
  redMask: Uint8Array[];
  meanLuminance: number[];
  rPm: Float32Array[];
  gPm: Float32Array[];
  bPm: Float32Array[];
} {
  const { frames, width, height } = image;
  const pixelCount = width * height;
  const luminance: Float32Array[] = [];
  const redMask: Uint8Array[] = [];
  const meanLuminance: number[] = [];
  const rPm: Float32Array[] = [];
  const gPm: Float32Array[] = [];
  const bPm: Float32Array[] = [];

  for (const frame of frames) {
    const Y = new Float32Array(pixelCount);
    const red = new Uint8Array(pixelCount);
    const rA = new Float32Array(pixelCount);
    const gA = new Float32Array(pixelCount);
    const bA = new Float32Array(pixelCount);
    const data = frame.data;
    let sumY = 0;
    let counted = 0;
    for (let p = 0; p < pixelCount; p++) {
      const idx = p * 4;
      const a = data[idx + 3];
      const rLin = SRGB_TO_LINEAR_LUT[data[idx]];
      const gLin = SRGB_TO_LINEAR_LUT[data[idx + 1]];
      const bLin = SRGB_TO_LINEAR_LUT[data[idx + 2]];
      const y = 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
      Y[p] = y;
      red[p] = isSaturatedRedLinear(rLin, gLin, bLin) ? 1 : 0;
      const af = a / 255;
      rA[p] = rLin * af;
      gA[p] = gLin * af;
      bA[p] = bLin * af;
      if (a > 0) {
        sumY += y;
        counted++;
      }
    }
    luminance.push(Y);
    redMask.push(red);
    meanLuminance.push(counted > 0 ? sumY / counted : 0);
    rPm.push(rA);
    gPm.push(gA);
    bPm.push(bA);
  }

  return { luminance, redMask, meanLuminance, rPm, gPm, bPm };
}

function detectFlashEdges(
  luminance: Float32Array[],
  redMask: Uint8Array[],
  pixelCount: number,
  lumDelta: number,
  darkerMax: number
): { generalContrib: number[]; redContrib: number[] } {
  const frameCount = luminance.length;
  const state: PerPixelState = {
    lastExtremum: new Float32Array(pixelCount),
    direction: new Int8Array(pixelCount),
    extremumIsRed: new Uint8Array(pixelCount),
  };
  if (frameCount > 0) {
    state.lastExtremum.set(luminance[0]);
    for (let p = 0; p < pixelCount; p++) {
      state.extremumIsRed[p] = redMask[0][p];
    }
  }

  const generalContrib: number[] = new Array(frameCount).fill(0);
  const redContrib: number[] = new Array(frameCount).fill(0);

  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < frameCount; i++) {
      if (pass === 0 && i === 0) continue;
      const f = i;
      const curY = luminance[f];
      const curRed = redMask[f];
      let gCount = 0;
      let rCount = 0;
      for (let p = 0; p < pixelCount; p++) {
        const y = curY[p];
        const prev = state.lastExtremum[p];
        const dir = state.direction[p];
        const diff = y - prev;
        let newDir = dir;
        if (diff > 0) newDir = 1;
        else if (diff < 0) newDir = -1;

        const reversed = dir !== 0 && newDir !== 0 && newDir !== dir;
        if (reversed) {
          const delta = Math.abs(prev - y);
          const darker = Math.min(prev, y);
          if (delta >= lumDelta && darker < darkerMax) {
            gCount++;
            if (state.extremumIsRed[p] === 1 || curRed[p] === 1) {
              rCount++;
            }
          }
          state.lastExtremum[p] = y;
          state.direction[p] = newDir;
          state.extremumIsRed[p] = curRed[p];
        } else if (newDir !== 0) {
          if (newDir === 1 && y > prev) {
            state.lastExtremum[p] = y;
            state.extremumIsRed[p] = curRed[p];
          } else if (newDir === -1 && y < prev) {
            state.lastExtremum[p] = y;
            state.extremumIsRed[p] = curRed[p];
          }
          state.direction[p] = newDir;
        }
      }
      if (pass === 1) {
        generalContrib[f] = gCount;
        redContrib[f] = rCount;
      }
    }
  }

  return { generalContrib, redContrib };
}

function detectMotionFrames(
  rPm: Float32Array[],
  gPm: Float32Array[],
  bPm: Float32Array[],
  pixelCount: number,
  pixelDeltaThreshold: number,
  tsMs: number[],
  loopMs: number,
  windowMs: number
): number[] {
  const frameCount = rPm.length;
  const motionContrib: number[] = new Array(frameCount).fill(0);
  for (let f = 0; f < frameCount; f++) {
    let target = tsMs[f] - windowMs;
    if (loopMs > 0) {
      target = ((target % loopMs) + loopMs) % loopMs;
    } else if (target < 0) {
      target = 0;
    }
    let g = 0;
    for (let i = frameCount - 1; i >= 0; i--) {
      if (tsMs[i] <= target) {
        g = i;
        break;
      }
    }
    if (g === f) g = (f - 1 + frameCount) % frameCount;
    const rCur = rPm[f];
    const gCur = gPm[f];
    const bCur = bPm[f];
    const rPrev = rPm[g];
    const gPrev = gPm[g];
    const bPrev = bPm[g];
    let count = 0;
    for (let p = 0; p < pixelCount; p++) {
      const dR = Math.abs(rCur[p] - rPrev[p]);
      const dG = Math.abs(gCur[p] - gPrev[p]);
      const dB = Math.abs(bCur[p] - bPrev[p]);
      const d = dR > dG ? (dR > dB ? dR : dB) : (dG > dB ? dG : dB);
      if (d >= pixelDeltaThreshold) count++;
    }
    motionContrib[f] = count;
  }
  return motionContrib;
}

function frameTimestampsMs(image: AnimatedImage): number[] {
  const ts: number[] = new Array(image.frames.length);
  let acc = 0;
  for (let i = 0; i < image.frames.length; i++) {
    ts[i] = acc;
    acc += Math.max(20, image.frames[i].delayMs);
  }
  return ts;
}

function eventsFromContrib(
  contrib: number[],
  pixelCount: number,
  areaPct: number,
  kind: 'general' | 'red' | 'motion',
  tsMs: number[]
): FlashEvent[] {
  const threshold = (areaPct / 100) * pixelCount;
  const events: FlashEvent[] = [];
  let active = contrib.length > 0 ? contrib[contrib.length - 1] >= threshold : false;
  for (let i = 0; i < contrib.length; i++) {
    const over = contrib[i] >= threshold;
    if (over && !active) {
      events.push({ kind, frameIndex: i, tMs: tsMs[i] });
      active = true;
    } else if (!over) {
      active = false;
    }
  }
  return events;
}

function motionEventsFromContrib(
  contrib: number[],
  pixelCount: number,
  areaPct: number,
  tsMs: number[],
  loopMs: number,
  windowMs: number
): FlashEvent[] {
  const threshold = (areaPct / 100) * pixelCount;
  const events: FlashEvent[] = [];
  if (contrib.length === 0 || loopMs <= 0 || windowMs <= 0) return events;
  for (let t = 0; t < loopMs; t += windowMs) {
    let f = 0;
    for (let i = tsMs.length - 1; i >= 0; i--) {
      if (tsMs[i] <= t) {
        f = i;
        break;
      }
    }
    if (contrib[f] >= threshold) {
      events.push({ kind: 'motion', frameIndex: f, tMs: t });
    }
  }
  return events;
}

function maxHzInSlidingWindow(events: FlashEvent[], loopMs: number, windowMs = 1000): number {
  if (events.length === 0) return 0;
  const times: number[] = [];
  if (loopMs > 0) {
    const tiles = Math.max(1, Math.ceil((windowMs + loopMs) / loopMs));
    for (let k = 0; k < tiles; k++) {
      for (const e of events) times.push(e.tMs + k * loopMs);
    }
  } else {
    for (const e of events) times.push(e.tMs);
  }
  let max = 0;
  let l = 0;
  for (let r = 0; r < times.length; r++) {
    while (times[r] - times[l] > windowMs) l++;
    const count = r - l + 1;
    if (count > max) max = count;
  }
  return max;
}

export function detectFlashes(image: AnimatedImage, thresholds: Thresholds): DetectionResult {
  const pixelCount = image.width * image.height;
  if (image.frames.length < 2) {
    return {
      generalHz: 0,
      redHz: 0,
      motionHz: 0,
      generalPasses: true,
      redPasses: true,
      motionPasses: true,
      passes: true,
      events: [],
      meanLuminancePerFrame:
        image.frames.length === 1 ? [computeLuminanceArrays(image).meanLuminance[0]] : [],
    };
  }

  const { luminance, redMask, meanLuminance, rPm, gPm, bPm } = computeLuminanceArrays(image);
  const tsMs = frameTimestampsMs(image);
  const lastIdx = image.frames.length - 1;
  const loopMs = tsMs[lastIdx] + Math.max(20, image.frames[lastIdx].delayMs);
  const motionWindowMs = Math.max(20, thresholds.motion.windowMs);
  const { generalContrib, redContrib } = detectFlashEdges(
    luminance,
    redMask,
    pixelCount,
    thresholds.general.lumDelta,
    thresholds.general.darkerMax
  );
  const motionContrib = detectMotionFrames(
    rPm,
    gPm,
    bPm,
    pixelCount,
    thresholds.motion.pixelDeltaPct / 100,
    tsMs,
    loopMs,
    motionWindowMs
  );

  const generalEvents = eventsFromContrib(
    generalContrib,
    pixelCount,
    thresholds.general.areaPct,
    'general',
    tsMs
  );
  const redEvents = eventsFromContrib(
    redContrib,
    pixelCount,
    thresholds.red.areaPct,
    'red',
    tsMs
  );
  const motionEvents = motionEventsFromContrib(
    motionContrib,
    pixelCount,
    thresholds.motion.areaPct,
    tsMs,
    loopMs,
    motionWindowMs
  );

  const generalHz = maxHzInSlidingWindow(generalEvents, loopMs);
  const redHz = maxHzInSlidingWindow(redEvents, loopMs);
  const motionHz = maxHzInSlidingWindow(motionEvents, loopMs);

  const generalPasses = generalHz <= thresholds.general.hz;
  const redPasses = redHz <= thresholds.red.hz;
  const motionPasses = motionHz <= thresholds.motion.hz;

  return {
    generalHz,
    redHz,
    motionHz,
    generalPasses,
    redPasses,
    motionPasses,
    passes: generalPasses && redPasses && motionPasses,
    events: [...generalEvents, ...redEvents, ...motionEvents].sort((a, b) => a.tMs - b.tMs),
    meanLuminancePerFrame: meanLuminance,
  };
}
