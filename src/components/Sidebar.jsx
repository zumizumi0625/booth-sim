import { useState, useRef, useEffect } from 'react'
import { useBoothStore, PRESETS } from '../stores/useBoothStore'
import { FURNITURE_TYPES } from '../data/furniture'
import { PRINT_SIZES, widthFromPrint } from '../data/printSizes'

export default function Sidebar() {
  const layout = useBoothStore((s) => s.getCurrent())
  const layouts = useBoothStore((s) => s.layouts)
  const setPresetKey = useBoothStore((s) => s.setPresetKey)
  const setCustomSize = useBoothStore((s) => s.setCustomSize)
  const toggleWall = useBoothStore((s) => s.toggleWall)
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
  const pendingImage = useBoothStore((s) => s.pendingImage)
  const setPendingImageWidth = useBoothStore((s) => s.setPendingImageWidth)

  // 印刷サイズ変更時に未配置の pendingImage の幅を更新
  useEffect(() => {
    if (pendingImage) {
      const newWidth = widthFromPrint(printKey, pendingImage.naturalAspect)
      if (Math.abs(newWidth - pendingImage.widthMeters) > 0.001) {
        setPendingImageWidth(newWidth)
      }
    }
  }, [printKey, pendingImage, setPendingImageWidth])
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
      const widthMeters = widthFromPrint(printKey, aspect)
      enterPlacing('image', null, { src: dataUrl, naturalAspect: aspect, widthMeters })
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
            <div className="custom-grid">
              {[
                ['W', customW, setCustomW],
                ['D', customD, setCustomD],
                ['H', customH, setCustomH],
              ].map(([label, value, setter]) => (
                <label key={label} className="custom-cell">
                  {label}
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="20"
                    value={value}
                    onChange={(e) => {
                      const v = Number(e.target.value)
                      setter(v)
                    }}
                    onBlur={() =>
                      setCustomSize({ w: customW, d: customD, h: customH })
                    }
                  />
                  m
                </label>
              ))}
            </div>
          )}
        </div>
      </section>

      <section>
        <h2>壁</h2>
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
        </div>
      </section>

      <section>
        <h2>家具を置く</h2>
        <div className="palette-grid">
          {Object.entries(FURNITURE_TYPES).map(([key, def]) => (
            <button
              key={key}
              className={
                'palette-btn' +
                (mode === 'placing' && placingType === key ? ' active' : '')
              }
              onClick={() => {
                if (mode === 'placing' && placingType === key) cancelPlacing()
                else enterPlacing('furniture', key)
              }}
            >
              <span className="palette-label">{def.label}</span>
              <span className="palette-dim">
                {Math.round(def.size.w * 100)}×{Math.round(def.size.d * 100)}×
                {Math.round(def.size.h * 100)}cm
              </span>
            </button>
          ))}
        </div>
        {mode === 'placing' && (
          <button className="cancel-place" onClick={cancelPlacing}>
            ✕ 配置キャンセル (Esc)
          </button>
        )}
      </section>

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
