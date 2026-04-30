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

  // 円柱
  const [radius, setRadius] = useState(0.15)
  const [length, setLength] = useState(0.6)
  const [axis, setAxis] = useState('y')
  // 直方体
  const [boxW, setBoxW] = useState(0.3)
  const [boxD, setBoxD] = useState(0.3)
  const [boxH, setBoxH] = useState(0.3)
  // 人物
  const [personHeight, setPersonHeight] = useState(1.7)
  const [personGender, setPersonGender] = useState('male')
  // ロールアップバナー
  const [bannerW, setBannerW] = useState(0.85)
  const [bannerH, setBannerH] = useState(2.0)
  const [hasStand, setHasStand] = useState(true)

  const isActive = (t) =>
    mode === 'placing' && placingKind === 'primitive' && placingType === t

  useEffect(() => {
    if (isActive('cylinder')) setPendingPrim({ radius, length, axis })
  }, [radius, length, axis, mode, placingKind, placingType, setPendingPrim])
  useEffect(() => {
    if (isActive('box')) setPendingPrim({ w: boxW, d: boxD, h: boxH })
  }, [boxW, boxD, boxH, mode, placingKind, placingType, setPendingPrim])
  useEffect(() => {
    const t = personGender === 'male' ? 'personMale' : 'personFemale'
    if (isActive(t)) setPendingPrim({ height: personHeight })
  }, [personHeight, personGender, mode, placingKind, placingType, setPendingPrim])
  useEffect(() => {
    if (isActive('rollupBanner'))
      setPendingPrim({ w: bannerW, h: bannerH, hasStand })
  }, [bannerW, bannerH, hasStand, mode, placingKind, placingType, setPendingPrim])

  const startCylinder = () => {
    if (isActive('cylinder')) cancelPlacing()
    else {
      enterPlacing('primitive', 'cylinder', { radius, length, axis })
      onCloseRequest?.()
    }
  }
  const startBox = () => {
    if (isActive('box')) cancelPlacing()
    else {
      enterPlacing('primitive', 'box', { w: boxW, d: boxD, h: boxH })
      onCloseRequest?.()
    }
  }
  const startPerson = () => {
    const t = personGender === 'male' ? 'personMale' : 'personFemale'
    if (isActive(t)) cancelPlacing()
    else {
      enterPlacing('primitive', t, { height: personHeight })
      onCloseRequest?.()
    }
  }
  const startBanner = () => {
    if (isActive('rollupBanner')) cancelPlacing()
    else {
      enterPlacing('primitive', 'rollupBanner', { w: bannerW, h: bannerH, hasStand })
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
          ['person', '人物'],
          ['banner', 'バナー'],
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
            className={'palette-btn' + (isActive('cylinder') ? ' active' : '')}
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
            className={'palette-btn' + (isActive('box') ? ' active' : '')}
            onClick={startBox}
          >
            <span className="palette-label">▢ 直方体を置く</span>
            <span className="palette-dim">
              {Math.round(boxW * 100)}×{Math.round(boxD * 100)}×{Math.round(boxH * 100)}cm
            </span>
          </button>
        </div>
      )}

      {tab === 'person' && (
        <div className="primitive-block">
          <div className="orientation-row">
            <span className="orientation-label">性別</span>
            {[
              ['male', '男性'],
              ['female', '女性'],
            ].map(([key, label]) => (
              <label key={key} className="orientation-pill">
                <input
                  type="radio"
                  name="person-gender"
                  checked={personGender === key}
                  onChange={() => {
                    setPersonGender(key)
                    setPersonHeight(key === 'male' ? 1.7 : 1.55)
                  }}
                />
                {label}
              </label>
            ))}
          </div>
          <NumRow
            label="身長"
            value={personHeight}
            onChange={setPersonHeight}
            min={1.2}
            max={2.0}
            step={0.01}
          />
          <button
            className={
              'palette-btn' +
              (isActive('personMale') || isActive('personFemale') ? ' active' : '')
            }
            onClick={startPerson}
          >
            <span className="palette-label">🚶 人物を置く</span>
            <span className="palette-dim">
              {personGender === 'male' ? '男性' : '女性'} {Math.round(personHeight * 100)}cm
            </span>
          </button>
        </div>
      )}

      {tab === 'banner' && (
        <div className="primitive-block">
          <NumRow label="W (幅)" value={bannerW} onChange={setBannerW} min={0.4} max={1.5} step={0.05} />
          <NumRow label="H (高さ)" value={bannerH} onChange={setBannerH} min={1.2} max={2.4} step={0.05} />
          <label className="preset-row">
            <input
              type="checkbox"
              checked={hasStand}
              onChange={(e) => setHasStand(e.target.checked)}
            />
            X 字台座あり
          </label>
          <button
            className={'palette-btn' + (isActive('rollupBanner') ? ' active' : '')}
            onClick={startBanner}
          >
            <span className="palette-label">▮ ロールアップバナー</span>
            <span className="palette-dim">
              {Math.round(bannerW * 100)}×{Math.round(bannerH * 100)}cm
              {hasStand ? ' (台座付)' : ''}
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
