import { useState, useRef, useEffect } from 'react'
import { useBoothStore, PRESETS } from '../stores/useBoothStore'
import { FURNITURE_TYPES } from '../data/furniture'
import { PRINT_SIZES, widthFromPrint } from '../data/printSizes'
import SelectedItemEditor from './SelectedItemEditor'
import PrimitiveSection from './PrimitiveSection'
import FurniturePaletteSection from './FurniturePaletteSection'

export default function Sidebar({ onCloseRequest }) {
  const layout = useBoothStore((s) => s.getCurrent())
  const layouts = useBoothStore((s) => s.layouts)
  const setPresetKey = useBoothStore((s) => s.setPresetKey)
  const setCustomSize = useBoothStore((s) => s.setCustomSize)
  const toggleWall = useBoothStore((s) => s.toggleWall)
  const toggleHeaderSign = useBoothStore((s) => s.toggleHeaderSign)
  const setFloorColor = useBoothStore((s) => s.setFloorColor)
  const enterPlacing = useBoothStore((s) => s.enterPlacing)
  const cancelPlacing = useBoothStore((s) => s.cancelPlacing)
  const mode = useBoothStore((s) => s.mode)
  const placingType = useBoothStore((s) => s.placingType)

  const addLayout = useBoothStore((s) => s.addLayout)
  const duplicateLayout = useBoothStore((s) => s.duplicateLayout)
  const removeLayout = useBoothStore((s) => s.removeLayout)
  const renameLayout = useBoothStore((s) => s.renameLayout)
  const switchLayout = useBoothStore((s) => s.switchLayout)
  const exportLayouts = useBoothStore((s) => s.exportLayouts)
  const importLayouts = useBoothStore((s) => s.importLayouts)

  const [customW, setCustomW] = useState(layout.customSize?.w ?? 6)
  const [customD, setCustomD] = useState(layout.customSize?.d ?? 3)
  const [customH, setCustomH] = useState(layout.customSize?.h ?? 2.7)
  const [printKey, setPrintKey] = useState('default60')
  const [orientationMode, setOrientationMode] = useState('auto')
  const [customShortMm, setCustomShortMm] = useState(600)
  const [customLongMm, setCustomLongMm] = useState(900)
  const pendingImage = useBoothStore((s) => s.pendingImage)
  const setPendingImageWidth = useBoothStore((s) => s.setPendingImageWidth)

  // 印刷サイズ or 向きが変わったら、未配置の pendingImage の幅を更新
  useEffect(() => {
    if (pendingImage) {
      const newWidth =
        printKey === 'custom'
          ? widthFromCustom(customShortMm, customLongMm, pendingImage.naturalAspect, orientationMode)
          : widthFromPrint(printKey, pendingImage.naturalAspect, orientationMode)
      if (Math.abs(newWidth - pendingImage.widthMeters) > 0.001) {
        setPendingImageWidth(newWidth)
      }
    }
  }, [printKey, orientationMode, customShortMm, customLongMm, pendingImage, setPendingImageWidth])

  function widthFromCustom(shortMm, longMm, naturalAspect, mode) {
    const s = (shortMm || 0) / 1000
    const l = (longMm || 0) / 1000
    if (mode === 'portrait') return s
    if (mode === 'landscape') return l
    return naturalAspect > 1 ? l : s
  }
  const [renameValue, setRenameValue] = useState(layout.name)
  const fileRef = useRef(null)

  const onUploadFiles = async (files) => {
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue
      const dataUrl = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.readAsDataURL(file)
      })
      const img = await new Promise((resolve) => {
        const i = new Image()
        i.onload = () => resolve(i)
        i.src = dataUrl
      })
      const aspect = img.naturalWidth / img.naturalHeight
      const widthMeters =
        printKey === 'custom'
          ? widthFromCustom(customShortMm, customLongMm, aspect, orientationMode)
          : widthFromPrint(printKey, aspect, orientationMode)
      enterPlacing('image', null, { src: dataUrl, naturalAspect: aspect, widthMeters })
      onCloseRequest?.()
      // 1枚ずつ配置するので最初の1枚だけプレースキューに乗せる
      break
    }
  }

  const handleExport = () => {
    const data = exportLayouts()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `booth-sim-layouts-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    try {
      const data = JSON.parse(text)
      const ok = importLayouts(data)
      if (!ok) alert('インポート失敗: フォーマットを確認してください')
    } catch {
      alert('JSON パースエラー')
    }
  }

  return (
    <aside className="sidebar">
      <SelectedItemEditor />
      <section>
        <h2>レイアウト</h2>
        <div className="layout-row">
          <select
            value={layout.id}
            onChange={(e) => switchLayout(e.target.value)}
            className="layout-select"
          >
            {layouts.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
        <div className="btn-row">
          <button onClick={addLayout}>＋ 新規</button>
          <button onClick={duplicateLayout}>複製</button>
          <button
            onClick={() => {
              if (confirm(`「${layout.name}」を削除しますか？`)) removeLayout(layout.id)
            }}
          >
            削除
          </button>
        </div>
        <div className="layout-row">
          <input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={() => renameLayout(renameValue)}
            placeholder="レイアウト名"
            className="text-input"
          />
        </div>
        <div className="btn-row">
          <button onClick={handleExport}>📤 Export JSON</button>
          <label className="btn-as-label">
            📥 Import
            <input
              type="file"
              accept="application/json"
              style={{ display: 'none' }}
              onChange={handleImport}
            />
          </label>
        </div>
      </section>

      <section>
        <h2>ブースサイズ</h2>
        <div className="preset-list">
          {Object.entries(PRESETS).map(([key, p]) => (
            <label key={key} className="preset-row">
              <input
                type="radio"
                name="preset"
                checked={layout.presetKey === key && !layout.customSize}
                onChange={() => setPresetKey(key)}
              />
              {p.label}
            </label>
          ))}
          <label className="preset-row">
            <input
              type="radio"
              name="preset"
              checked={layout.presetKey === 'custom' || !!layout.customSize}
              onChange={() => setCustomSize({ w: customW, d: customD, h: customH })}
            />
            カスタム
          </label>
          {(layout.presetKey === 'custom' || !!layout.customSize) && (
            <div className="custom-list">
              {[
                ['W (幅)', customW, setCustomW, 1, 20, 0.1],
                ['D (奥行)', customD, setCustomD, 1, 20, 0.1],
                ['H (高さ)', customH, setCustomH, 2, 6, 0.1],
              ].map(([label, value, setter, min, max, step]) => (
                <div key={label} className="custom-row">
                  <span className="custom-label">{label}</span>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => {
                      const v = Number(e.target.value)
                      setter(v)
                      // スライダーは即時反映（連続的にプレビューが動く）
                      const next = { w: customW, d: customD, h: customH }
                      if (label.startsWith('W')) next.w = v
                      else if (label.startsWith('D')) next.d = v
                      else if (label.startsWith('H')) next.h = v
                      setCustomSize(next)
                    }}
                    className="custom-slider"
                  />
                  <input
                    type="number"
                    step={step}
                    min={min}
                    max={max}
                    value={value}
                    onChange={(e) => {
                      const v = Number(e.target.value)
                      setter(v)
                    }}
                    onBlur={() =>
                      setCustomSize({ w: customW, d: customD, h: customH })
                    }
                    className="custom-number"
                  />
                  <span className="custom-unit">m</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section>
        <h2>床の色</h2>
        <div className="palette-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
          {[
            ['#f3f3f3', 'グレー'],
            ['#e8d9c0', 'ベージュ'],
            ['#3a4a6b', 'ネイビー'],
            ['#2b6cb0', 'ブルー'],
            ['#1f1f1f', 'ブラック'],
          ].map(([col, label]) => (
            <button
              key={col}
              onClick={() => setFloorColor(col)}
              title={label}
              className="floor-color-swatch"
              style={{
                background: col,
                outline:
                  layout.floorColor === col ? '3px solid var(--color-active)' : 'none',
              }}
            />
          ))}
        </div>
        <input
          type="color"
          value={layout.floorColor || '#f3f3f3'}
          onChange={(e) => setFloorColor(e.target.value)}
          style={{ marginTop: 6, width: '100%', height: 28 }}
        />
      </section>

      <section>
        <h2>壁・看板</h2>
        <div className="wall-list">
          {[
            ['back', '背面'],
            ['left', '左'],
            ['right', '右'],
            ['front', '前面'],
          ].map(([k, l]) => (
            <label key={k} className="preset-row">
              <input
                type="checkbox"
                checked={layout.walls[k]}
                onChange={() => toggleWall(k)}
              />
              {l}
            </label>
          ))}
          <label className="preset-row">
            <input
              type="checkbox"
              checked={layout.headerSign ?? true}
              onChange={toggleHeaderSign}
            />
            正面看板（門・h=600mm）
          </label>
        </div>
      </section>

      <PrimitiveSection onCloseRequest={onCloseRequest} />

      <FurniturePaletteSection onCloseRequest={onCloseRequest} />

      {mode === 'placing' && (
        <section>
          <button className="cancel-place" onClick={cancelPlacing}>
            ✕ 配置キャンセル (Esc)
          </button>
        </section>
      )}

      <section>
        <h2>画像を貼る</h2>
        <label className="print-size">
          初期サイズ
          <select value={printKey} onChange={(e) => setPrintKey(e.target.value)}>
            {Object.entries(PRINT_SIZES).map(([key, p]) => (
              <option key={key} value={key}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        {printKey === 'custom' && (
          <div className="custom-list" style={{ marginBottom: 8 }}>
            <div className="custom-row">
              <span className="custom-label">短辺</span>
              <input
                type="range"
                min={50}
                max={2000}
                step={5}
                value={customShortMm}
                onChange={(e) => setCustomShortMm(Number(e.target.value))}
                className="custom-slider"
              />
              <input
                type="number"
                min={50}
                max={2000}
                step={1}
                value={customShortMm}
                onChange={(e) => setCustomShortMm(Number(e.target.value))}
                className="custom-number"
              />
              <span className="custom-unit">mm</span>
            </div>
            <div className="custom-row">
              <span className="custom-label">長辺</span>
              <input
                type="range"
                min={50}
                max={2000}
                step={5}
                value={customLongMm}
                onChange={(e) => setCustomLongMm(Number(e.target.value))}
                className="custom-slider"
              />
              <input
                type="number"
                min={50}
                max={2000}
                step={1}
                value={customLongMm}
                onChange={(e) => setCustomLongMm(Number(e.target.value))}
                className="custom-number"
              />
              <span className="custom-unit">mm</span>
            </div>
          </div>
        )}
        <div className="orientation-row">
          <span className="orientation-label">向き</span>
          {[
            ['auto', '自動'],
            ['portrait', '縦'],
            ['landscape', '横'],
          ].map(([key, label]) => (
            <label key={key} className="orientation-pill">
              <input
                type="radio"
                name="orientation"
                value={key}
                checked={orientationMode === key}
                onChange={() => setOrientationMode(key)}
              />
              {label}
            </label>
          ))}
        </div>
        <div
          className="dropzone"
          onDragOver={(e) => {
            e.preventDefault()
            e.dataTransfer.dropEffect = 'copy'
          }}
          onDrop={(e) => {
            e.preventDefault()
            onUploadFiles([...e.dataTransfer.files])
          }}
          onClick={() => fileRef.current?.click()}
        >
          ここに画像をドロップ or クリックで選択
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => onUploadFiles([...e.target.files])}
          />
        </div>
        <p className="hint-note">
          壁・床・家具上面のいずれかをクリックで配置
        </p>
      </section>

      <section className="hint">
        <p>モード切替（ヘッダー右上）:</p>
        <ul>
          <li><b>✏️ 編集</b>: クリックで選択、ドラッグで移動</li>
          <li><b>🎥 視点</b>: ドラッグでカメラ pan / 右ドラッグで orbit / scroll zoom</li>
        </ul>
        <p style={{ marginTop: 8 }}>共通:</p>
        <ul>
          <li><b>R</b> 90°回転 / <b>Delete</b> 削除 / <b>Esc</b> 解除</li>
          <li><b>矢印キー</b>: 25cm 微調整（壁画像は壁面に沿って移動）</li>
        </ul>
      </section>
    </aside>
  )
}
