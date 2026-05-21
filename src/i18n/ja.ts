export const ja = {
  appTitle: 'Emoji Tamer',
  appTagline: '激しい絵文字アニメーションをおだやかに',
  language: '言語',
  languageJa: '日本語',
  languageEn: 'English',

  selectFile: 'ファイルを選択',
  dropzoneIdle: 'アニメーション絵文字をドラッグ＆ドロップ',
  dropzoneOr: 'またはクリックしてファイルを選択',
  dropzoneActive: 'ここにドロップ',

  panelOriginal: '元の画像',
  panelTransforms: '画像の調整',
  detection: '検出結果',
  thresholds: '検出しきい値',
  pass: '基準内',
  fail: '基準超え',
  playAnimation: 'アニメーションを再生',
  pauseAnimation: 'アニメーションを停止',
  luminanceGraphLabel: '平均輝度グラフ',

  generalFlash: '一般閃光',
  redFlash: '赤色閃光',
  motion: '動き',
  hzSuffix: '回/秒',

  thresholdGeneralLumDelta: '輝度変化量 (相対輝度Δ)',
  thresholdGeneralDarker: '暗い側の上限 (Y)',
  thresholdGeneralArea: '対象面積 (%)',
  thresholdGeneralHz: '許容 Hz',
  thresholdRedArea: '対象面積 (%)',
  thresholdRedHz: '許容 Hz',
  thresholdMotionPixel: '画素差 (%)',
  thresholdMotionArea: '対象面積 (%)',
  thresholdMotionWindow: '単位時間 (ms)',
  thresholdMotionHz: '許容 Hz',
  resetThresholds: '既定値にリセット',

  meanLuminance: 'フレーム別 平均輝度',
  frameIndex: 'フレーム',
  frameList: 'フレーム一覧',

  transformSlowdown: 'スピードを遅くする',
  transformDecimate: 'フレームを間引く',
  transformBrightness: '明るさを抑制する',
  transformSaturation: '彩度を下げる',

  transformParamSlowdown: '倍率',
  transformParamDecimate: 'N 枚に 1 枚を残す',
  transformParamBrightness: '明るさ係数',
  transformParamSaturation: '彩度係数',

  apply: '適用',
  recompute: '検出を再計算',
  download: 'ダウンロード',

  processing: '処理中…',
  decodeError: 'ファイルを読み込めませんでした。GIF / APNG / アニメ WebP のみ対応しています。',
  noAnimation: 'このファイルにはアニメーションがないため、スピード調整・フレーム間引きは適用できません。',
  largeImageWarning: '大きい画像 (1024px 超) です。処理に時間がかかる場合があります。',

  allTransformsFail: 'いずれの調整方法でも基準を満たせませんでした。複数の手法を組み合わせるか、しきい値を見直してください。',
  notYetTriedBanner: '基準を超えています。下のボタンで調整方法を試してください。',
  emptyHint: 'まずファイルを読み込んでください。',

  framesLabel: 'フレーム数',
  sizeLabel: 'サイズ',
  durationLabel: '総再生時間',
  sourceFormatLabel: '元の形式',
};

export type Dict = typeof ja;
