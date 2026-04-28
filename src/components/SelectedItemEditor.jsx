import { useBoothStore } from '../stores/useBoothStore'
import { FURNITURE_TYPES } from '../data/furniture'

const RANGES = {
  desk: { w: [0.6, 3, 0.05], d: [0.4, 1.5, 0.05], h: [0.5, 1.2, 0.05] },
  longDesk: { w: [1.2, 4, 0.05], d: [0.4, 1.5, 0.05], h: [0.5, 1.2, 0.05] },
  chair: { w: [0.3, 0.8, 0.02], d: [0.3, 0.8, 0.02], h: [0.6, 1.2, 0.02] },
  partition: { w: [0.5, 3, 0.05], d: [0.02, 0.1, 0.005], h: [1, 2.5, 0.05] },
  signStand: { w: [0.3, 1.2, 0.05], d: [0.02, 0.1, 0.005], h: [1, 2.5, 0.05] },
}

export default function SelectedItemEditor() {
  const selectedId = useBoothStore((s) => s.selectedId)
  const layout = useBoothStore((s) => s.getCurrent())
  const updateItemDims = useBoothStore((s) => s.updateItemDims)
  const clearItemDims = useBoothStore((s) => s.clearItemDims)

  if (!selectedId) return null
  const item = layout.items.find((it) => it.id === selectedId)
  if (!item) return null

  const def = FURNITURE_TYPES[item.type]
  if (!def) return null

  const ranges = RANGES[item.type] ?? { w: [0.2, 5, 0.05], d: [0.2, 5, 0.05], h: [0.2, 3, 0.05] }
  const current = item.dimsOverride ?? def.size
  const isOverride = !!item.dimsOverride

  const updateDim = (axis, value) => {
    const next = { ...current, [axis]: value }
    updateItemDims(item.id, next)
  }

  return (
    <section>
      <h2>選択中アイテム: {def.label}</h2>
      <div className="custom-list">
        {[
          ['W (幅)', 'w'],
          ['D (奥行)', 'd'],
          ['H (高さ)', 'h'],
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
                value={current[axis]}
                onChange={(e) => updateDim(axis, Number(e.target.value))}
                className="custom-slider"
              />
              <input
                type="number"
                min={min}
                max={max}
                step={step}
                value={current[axis]}
                onChange={(e) => updateDim(axis, Number(e.target.value))}
                className="custom-number"
              />
              <span className="custom-unit">m</span>
            </div>
          )
        })}
      </div>
      {isOverride && (
        <button
          onClick={() => clearItemDims(item.id)}
          className="reset-dims-btn"
        >
          ⟲ プリセット寸法に戻す
        </button>
      )}
    </section>
  )
}
