import type { Dict } from './ja';

export const en: Dict = {
  appTitle: 'Emoji Tamer',
  appTagline: 'Tame intense emoji animations',
  language: 'Language',
  languageJa: '日本語',
  languageEn: 'English',

  selectFile: 'Choose a file',
  dropzoneIdle: 'Drag & drop animated emoji',
  dropzoneOr: 'or click to choose a file',
  dropzoneActive: 'Drop it here',

  panelOriginal: 'Original',
  panelTransforms: 'Adjust the image',
  detection: 'Detection',
  thresholds: 'Detection thresholds',
  pass: 'Within limits',
  fail: 'Over limits',
  playAnimation: 'Play animation',
  pauseAnimation: 'Pause animation',
  luminanceGraphLabel: 'Mean luminance graph',

  generalFlash: 'General flash',
  redFlash: 'Red flash',
  motion: 'Motion',
  hzSuffix: '/sec',

  thresholdGeneralLumDelta: 'Luminance change (ΔY)',
  thresholdGeneralDarker: 'Darker side max (Y)',
  thresholdGeneralArea: 'Affected area (%)',
  thresholdGeneralHz: 'Allowed Hz',
  thresholdRedArea: 'Affected area (%)',
  thresholdRedHz: 'Allowed Hz',
  thresholdMotionPixel: 'Pixel delta (%)',
  thresholdMotionArea: 'Affected area (%)',
  thresholdMotionHz: 'Allowed Hz',
  resetThresholds: 'Reset to defaults',

  meanLuminance: 'Per-frame mean luminance',
  frameIndex: 'Frame',
  frameList: 'Frames',

  transformSlowdown: 'Slow down speed',
  transformDecimate: 'Skip frames',
  transformBrightness: 'Reduce brightness',
  transformSaturation: 'Reduce saturation',

  transformParamSlowdown: 'Factor',
  transformParamDecimate: 'Keep 1 of N',
  transformParamBrightness: 'Brightness factor',
  transformParamSaturation: 'Saturation factor',

  apply: 'Apply',
  recompute: 'Recompute detection',
  download: 'Download',

  processing: 'Processing…',
  decodeError: 'Could not decode this file. Only GIF, APNG, or animated WebP are supported.',
  noAnimation: 'No animation detected. Speed and frame-skip adjustments are disabled.',
  largeImageWarning: 'Large image (over 1024 px). Processing may be slow.',

  allTransformsFail: 'None of the adjustments brought the image within limits. Try combining methods or relaxing thresholds.',
  notYetTriedBanner: 'The original exceeds the limits. Use the buttons below to try adjustments.',
  emptyHint: 'Load a file to get started.',

  framesLabel: 'Frames',
  sizeLabel: 'Size',
  durationLabel: 'Total duration',
  sourceFormatLabel: 'Source format',
};
