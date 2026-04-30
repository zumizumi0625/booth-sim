// 家具プリセット。size はデフォルト値、ranges は palette の slider レンジ (min, max, step)
// 阿部さん 2026-04-29 レビューを反映: 色を実物寄せ、配置前にスライダーで寸法調整可
export const FURNITURE_TYPES = {
  desk: {
    label: '机',
    size: { w: 1.2, d: 0.6, h: 0.7 },
    color: '#e7e2d7', // 折りたたみ机の白系天板
    ranges: {
      w: [0.6, 2.4, 0.05],
      d: [0.4, 1.2, 0.05],
      h: [0.55, 1.0, 0.05],
    },
    shape: 'desk',
  },
  longDesk: {
    label: '長机',
    size: { w: 1.8, d: 0.6, h: 0.7 },
    color: '#e7e2d7',
    ranges: {
      w: [1.2, 3.0, 0.05],
      d: [0.4, 1.2, 0.05],
      h: [0.55, 1.0, 0.05],
    },
    shape: 'desk',
  },
  roundDesk: {
    label: '丸机',
    size: { w: 0.9, d: 0.9, h: 0.7 },
    color: '#e7e2d7',
    ranges: {
      w: [0.5, 1.6, 0.05],
      d: [0.5, 1.6, 0.05], // w=d で円柱化
      h: [0.55, 1.0, 0.05],
    },
    shape: 'roundDesk',
  },
  chair: {
    label: '椅子（パイプ椅子）',
    size: { w: 0.45, d: 0.45, h: 0.8 },
    color: '#bdbdbd', // パイプ椅子のクロムシルバー
    ranges: {
      w: [0.35, 0.65, 0.02],
      d: [0.35, 0.65, 0.02],
      h: [0.7, 1.0, 0.02],
    },
    shape: 'chair',
  },
  partition: {
    label: 'パーティション',
    size: { w: 0.9, d: 0.04, h: 1.8 },
    color: '#e8e8e8',
    ranges: {
      w: [0.6, 2.4, 0.05],
      d: [0.02, 0.1, 0.005],
      h: [1.2, 2.4, 0.05],
    },
    shape: 'panel',
  },
  signStand: {
    label: 'サインスタンド',
    size: { w: 0.6, d: 0.05, h: 1.5 },
    color: '#9a9a9a',
    ranges: {
      w: [0.4, 1.2, 0.05],
      d: [0.02, 0.1, 0.005],
      h: [1.0, 2.4, 0.05],
    },
    shape: 'panel',
  },
}
