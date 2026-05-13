import * as THREE from 'three'

// 看板に文字を描画するための CanvasTexture を作る。
// w/h は物理寸法(m)。 internal は描画キャンバスサイズ(px)で、看板の比率に
// 合わせて生成。文字数や行数に応じてフォントサイズは auto-fit する。
//
// PADDING_RATIO: 看板の見える領域に対する余白率
// FONT_FAMILY: Noto Sans JP を優先、フォールバック CJK 系
const PADDING_RATIO = 0.06
const FONT_FAMILY =
  '"Noto Sans JP", "Hiragino Sans", "Yu Gothic", "Meiryo", system-ui, -apple-system, sans-serif'

export function createSignTexture({ text, color = '#ffffff', bg = '#1f2a44', widthM = 6, heightM = 0.6 }) {
  const lines = (text ?? '').split(/\r?\n/).slice(0, 3) // 3行まで
  // 物理比率を保ったキャンバス。横長想定で base 解像度を 2048 縛りに。
  const ratio = widthM / heightM
  const baseHeight = 256
  const W = Math.min(2048, Math.round(baseHeight * ratio))
  const H = baseHeight
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  // 背景
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // 文字エリア
  const padX = W * PADDING_RATIO
  const padY = H * PADDING_RATIO
  const areaW = W - padX * 2
  const areaH = H - padY * 2

  if (lines.length > 0 && lines.some((l) => l.trim().length > 0)) {
    // フォントサイズ自動計算: 行数で割って、最も長い行が areaW に収まるまで縮小
    const lineH = areaH / lines.length
    let fontSize = Math.floor(lineH * 0.85)
    ctx.font = `bold ${fontSize}px ${FONT_FAMILY}`
    let maxW = Math.max(...lines.map((l) => ctx.measureText(l || ' ').width))
    if (maxW > areaW && maxW > 0) {
      fontSize = Math.max(12, Math.floor(fontSize * (areaW / maxW)))
      ctx.font = `bold ${fontSize}px ${FONT_FAMILY}`
    }

    ctx.fillStyle = color
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const cx = W / 2
    lines.forEach((line, i) => {
      const cy = padY + lineH * (i + 0.5)
      ctx.fillText(line, cx, cy)
    })
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}
