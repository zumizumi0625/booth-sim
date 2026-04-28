import { useEffect, useState } from 'react'
import { useBoothStore } from '../stores/useBoothStore'

export default function PrimitiveSection({ onCloseRequest }) {
  const enterPlacing = useBoothStore((s) => s.enterPlacing)
  const cancelPlacing = useBoothStore((s) => s.cancelPlacing)
  const setPendingPrim = useBoothStore((s) => s.setPendingPrimitiveParams)
  const mode = useBoothStore((s) => s.mode)
  const placingKind = useBoothStore((s) => s.placingKind)
  const placingType = useBoothStore((s) => s.placingType)

  const [radius, setRadius] = useState(0.15)
  const [length, setLength] = useState(0.6)
  const [axis, setAxis] = useState('y')

  const isActive =
    mode === 'placing' && placingKind === 'primitive' && placingType === 'cylinder'

  // パラメータ変更時に pending も更新
  useEffect(() => {
    if (isActive) setPendingPrim({ radius, length, axis })
  }, [radius, length, axis, isActive, setPendingPrim])

  return (
    <section>
      <h2>プリミティブ</h2>
      <div className="primitive-block">
        <div className="primitive-row">
          <span className="custom-label">半径 r</span>
          <input
            type="range"
            min={0.02}
            max={1}
            step={0.005}
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="custom-slider"
          />
          <input
            type="number"
            min={0.02}
            max={1}
            step={0.005}
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="custom-number"
          />
          <span className="custom-unit">m</span>
        </div>
        <div className="primitive-row">
          <span className="custom-label">長さ L</span>
          <input
            type="range"
            min={0.02}
            max={3}
            step={0.01}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="custom-slider"
          />
          <input
            type="number"
            min={0.02}
            max={3}
            step={0.01}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="custom-number"
          />
          <span className="custom-unit">m</span>
        </div>
        <div className="orientation-row">
          <span className="orientation-label">向き</span>
          {[
            ['y', '縦'],
            ['x', '横X'],
            ['z', '横Z'],
          ].map(([key, label]) => (
            <label key={key} className="orientation-pill">
              <input
                type="radio"
                name="cyl-axis"
                checked={axis === key}
                onChange={() => setAxis(key)}
              />
              {label}
            </label>
          ))}
        </div>
        <button
          className={'palette-btn' + (isActive ? ' active' : '')}
          onClick={() => {
            if (isActive) cancelPlacing()
            else {
              enterPlacing('primitive', 'cylinder', { radius, length, axis })
              onCloseRequest?.()
            }
          }}
        >
          <span className="palette-label">⏺ 円柱を置く</span>
          <span className="palette-dim">
            ⌀{Math.round(radius * 200)} × L{Math.round(length * 100)}cm
          </span>
        </button>
      </div>
    </section>
  )
}
