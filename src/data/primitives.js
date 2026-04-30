// プリミティブ定義: 円柱・直方体・人物・ロールアップバナー
// shape: render 切替の種別
export const PRIMITIVES = {
  cylinder: {
    label: '円柱',
    defaultParams: { radius: 0.15, length: 0.6, axis: 'y' },
    color: '#a5b4fc',
    shape: 'cylinder',
  },
  box: {
    label: '直方体',
    defaultParams: { w: 0.3, d: 0.3, h: 0.3 },
    color: '#fcd34d',
    shape: 'box',
  },
  personMale: {
    label: '人物（男性 170cm）',
    defaultParams: { height: 1.7 },
    color: '#94a3b8',
    shape: 'person',
  },
  personFemale: {
    label: '人物（女性 155cm）',
    defaultParams: { height: 1.55 },
    color: '#a5b4fc',
    shape: 'person',
  },
  rollupBanner: {
    label: 'ロールアップバナー',
    // 標準: 幅 850mm × 高さ 2000mm
    defaultParams: { w: 0.85, h: 2.0, hasStand: true },
    color: '#f1f5f9',
    shape: 'rollupBanner',
  },
}
