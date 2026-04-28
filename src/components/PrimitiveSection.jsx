import { useEffect, useState } from 'react'
import { useBoothStore } from '../stores/useBoothStore'

export default function PrimitiveSection({ onCloseRequest }) {
  const enterPlacing = useBoothStore((s) => s.enterPlacing)
  const cancelPlacing = useBoothStore((s) => s.cancelPlacing)
  const setPendingPrim = useBoothStore((s) => s.setPendingPrimitiveParams)
  const mode = useBoothStore((s) => s.mode)
  const placingKind = useBoothStore((s) => s.placingKind)
  const placingType = useBoothStore((s) => s.placingType)

  const [tab, setTab] = useState('cylinder')

  // 円柱パラメータ
  const [radius, setRadius] = useState(0.15)
  const [length, setLength] = useState(0.6)
  const [axis, setAxis] = useState('y')

  // 直方体パラメータ
  const [boxW, setBoxW] = useState(0.3)
  const [boxD, setBoxD] = useState(0.3)
  const [boxH, setBoxH] = useState(0.3)

  const isActiveCyl =
    mode === 'placing' && placingKind === 'primitive' && placingType === 'cylinder'
  const isActiveBox =
    mode === 'placing' && placingKind === 'primitive' && placingType === 'box'

  useEffect(() => {
    if (isActiveCyl) setPendingPrim({ radius, length, axis })
  }, [radius, length, axis, isActiveCyl, setPendingPrim])

  useEffect(() => {
    if (isActiveBox) setPendingPrim({ w: boxW, d: boxD, h: boxH })
  }, [boxW, boxD, boxH, isActiveBox, setPendingPrim])

  const startCylinder = () => {
    if (isActiveCyl) cancelPlacing()
    else {
      enterPlacing('primitive', 'cylinder', { radius, length, axis })
      onCloseRequest?.()
    }
  }

  const startBox = () => {
    if (isActiveBox) cancelPlacing()
    else {
      enterPlacing('primitive', 'box', { w: boxW, d: boxD, h: boxH })
      onCloseRequest?.()
    }
  }

  return (
    <section>
      <h2>プリミティブ</h2>
      <div className="primitive-tabs">
        {[
          ['cylinder', '円柱'],
          ['box', '直方体'],
        ].map(([key, label]) => (
          <button
            key={key}
            className={'primitive-tab' + (tab === key ? ' active' : '')}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'cylinder' && (
        <div className="primitive-block">
          <NumRow label="半径 r" value={radius} onChange={setRadius} min={0.02} max={1} step={0.005} />
          <NumRow label="長さ L" value={length} onChange={setLength} min={0.02} max={3} step={0.01} />
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
            className={'palette-btn' + (isActiveCyl ? ' active' : '')}
            onClick={startCylinder}
          >
            <span className="palette-label">⏺ 円柱を置く</span>
            <span className="palette-dim">
              ⌀{Math.round(radius * 200)} × L{Math.round(length * 100)}cm
            </span>
          </button>
        </div>
      )}

      {tab === 'box' && (
        <div className="primitive-block">
          <NumRow label="W (幅)" value={boxW} onChange={setBoxW} min={0.02} max={3} step={0.01} />
          <NumRow label="D (奥行)" value={boxD} onChange={setBoxD} min={0.02} max={3} step={0.01} />
          <NumRow label="H (高さ)" value={boxH} onChange={setBoxH} min={0.02} max={3} step={0.01} />
          <button
            className={'palette-btn' + (isActiveBox ? ' active' : '')}
            onClick={startBox}
          >
            <span className="palette-label">▢ 直方体を置く</span>
            <span className="palette-dim">
              {Math.round(boxW * 100)}×{Math.round(boxD * 100)}×{Math.round(boxH * 100)}cm
            </span>
          </button>
        </div>
      )}
    </section>
  )
}

function NumRow({ label, value, onChange, min, max, step }) {
  return (
    <div className="primitive-row">
      <span className="custom-label">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="custom-slider"
      />
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="custom-number"
      />
      <span className="custom-unit">m</span>
    </div>
  )
}
