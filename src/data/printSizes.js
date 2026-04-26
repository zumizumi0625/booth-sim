// short = 短辺, long = 長辺。アップロード画像の縦横比から自動でどちらが「幅」になるか判定。
export const PRINT_SIZES = {
  default60: { label: 'デフォルト幅60cm', short: 0.6, long: 0.6 },
  A0: { label: 'A0 (841×1189)', short: 0.841, long: 1.189 },
  A1: { label: 'A1 (594×841)', short: 0.594, long: 0.841 },
  A2: { label: 'A2 (420×594)', short: 0.42, long: 0.594 },
  A3: { label: 'A3 (297×420)', short: 0.297, long: 0.42 },
  B1: { label: 'B1 (728×1030)', short: 0.728, long: 1.03 },
  B2: { label: 'B2 (515×728)', short: 0.515, long: 0.728 },
}

export function widthFromPrint(key, naturalAspect) {
  const ps = PRINT_SIZES[key]
  if (!ps) return 0.6
  // naturalAspect = imgWidth / imgHeight
  // ランドスケープ (>1) なら 長辺が幅, ポートレート (<=1) なら 短辺が幅
  return naturalAspect > 1 ? ps.long : ps.short
}
