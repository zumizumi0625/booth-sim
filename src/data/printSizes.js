// short = 短辺, long = 長辺。アップロード画像の縦横比から自動でどちらが「幅」になるか判定。
export const PRINT_SIZES = {
  default60: { label: 'デフォルト幅60cm', short: 0.6, long: 0.6 },
  B0: { label: 'B0 (1030×1456)', short: 1.03, long: 1.456 },
  A0: { label: 'A0 (841×1189)', short: 0.841, long: 1.189 },
  B1: { label: 'B1 (728×1030)', short: 0.728, long: 1.03 },
  A1: { label: 'A1 (594×841)', short: 0.594, long: 0.841 },
  B2: { label: 'B2 (515×728)', short: 0.515, long: 0.728 },
  A2: { label: 'A2 (420×594)', short: 0.42, long: 0.594 },
  A3: { label: 'A3 (297×420)', short: 0.297, long: 0.42 },
  custom: { label: 'カスタム (mm 入力)', short: 0.6, long: 0.6, isCustom: true },
}

// orientationMode: 'auto' | 'portrait' | 'landscape'
//   auto      : naturalAspect でランドスケープ/ポートレートを自動判定
//   portrait  : 縦（短辺を幅にする）
//   landscape : 横（長辺を幅にする）
export function widthFromPrint(key, naturalAspect, orientationMode = 'auto') {
  const ps = PRINT_SIZES[key]
  if (!ps) return 0.6
  if (orientationMode === 'portrait') return ps.short
  if (orientationMode === 'landscape') return ps.long
  return naturalAspect > 1 ? ps.long : ps.short
}
