import { useEffect, useState } from 'react'
import { useBoothStore } from '../stores/useBoothStore'
import { FURNITURE_TYPES } from '../data/furniture'

export default function FurniturePaletteSection({ onCloseRequest }) {
  const enterPlacing = useBoothStore((s) => s.enterPlacing)
  const cancelPlacing = useBoothStore((s) => s.cancelPlacing)
  const setPendingDimsOverride = useBoothStore((s) => s.setPendingDimsOverride)
  const mode = useBoothStore((s) => s.mode)
  const placingKind = useBoothStore((s) => s.placingKind)
  const placingType = useBoothStore((s) => s.placingType)

  // 各家具種別の現在のスライダー値（独立に保持して切替時にリセットしない）
  const [dimsByType, setDimsByType] = useState(() => {
    const init = {}
    for (const [key, def] of Object.entries(FURNITURE_TYPES)) {
      init[key] = { ...def.size }
    }
    return init
  })

  const isActive = (key) =>
    mode === 'placing' && placingKind === 'furniture' && placingType === key

  // active な家具のスライダー値が変わったら pendingDimsOverride を更新
  useEffect(() => {
    if (mode === 'placing' && placingKind === 'furniture' && placingType) {
      setPendingDimsOverride(dimsByType[placingType])
    }
  }, [dimsByType, mode, placingKind, placingType, setPendingDimsOverride])

  const startPlacing = (key) => {
    if (isActive(key)) {
      cancelPlacing()
    } else {
      // 入る瞬間の dims を override にセット
      setPendingDimsOverride(dimsByType[key])
      enterPlacing('furniture', key)
      onCloseRequest?.()
    }
  }

  const updateDim = (key, axis, value) => {
    setDimsByType((prev) => {
      const next = { ...prev[key], [axis]: value }
      // 丸机は w=d を強制
      if (key === 'roundDesk' && (axis === 'w' || axis === 'd')) {
        next.w = value
        next.d = value
      }
      return { ...prev, [key]: next }
    })
  }

  return (
    <section>
      <h2>家具を置く</h2>
      <p className="hint-note" style={{ marginBottom: 8 }}>
        ボタンで配置モードへ。下のスライダーで寸法を調整するとプレビューに即反映。
      </p>
      <div className="palette-list">
        {Object.entries(FURNITURE_TYPES).map(([key, def]) => {
          const active = isActive(key)
          const dims = dimsByType[key]
          const ranges = def.ranges ?? {
            w: [0.1, 3, 0.05],
            d: [0.1, 3, 0.05],
            h: [0.1, 3, 0.05],
          }
          return (
            <div key={key} className={'palette-item' + (active ? ' active' : '')}>
              <button
                className={'palette-btn' + (active ? ' active' : '')}
                onClick={() => startPlacing(key)}
              >
                <span className="palette-label">{def.label}</span>
                <span className="palette-dim">
                  {Math.round(dims.w * 100)}×{Math.round(dims.d * 100)}×
                  {Math.round(dims.h * 100)}cm
                </span>
              </button>
              {active && (
                <div className="palette-sliders">
                  {[
                    ['W', 'w'],
                    ['D', 'd'],
                    ['H', 'h'],
                  ].map(([label, axis]) => {
                    const [min, max, step] = ranges[axis]
                    return (
                      <div key={axis} className="custom-row">
                        <span className="custom-label">{label}</span>
                        <input
                          type="range"
                          min={min}
                          max={max}
                          step={step}
                          value={dims[axis]}
                          onChange={(e) =>
                            updateDim(key, axis, Number(e.target.value))
                          }
                          className="custom-slider"
                          // 丸机の D は同期するので非表示
                          disabled={key === 'roundDesk' && axis === 'd'}
                        />
                        <input
                          type="number"
                          min={min}
                          max={max}
                          step={step}
                          value={dims[axis]}
                          onChange={(e) =>
                            updateDim(key, axis, Number(e.target.value))
                          }
                          className="custom-number"
                          disabled={key === 'roundDesk' && axis === 'd'}
                        />
                        <span className="custom-unit">m</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
