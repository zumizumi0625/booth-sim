import { useState } from 'react'
import Scene from './components/Scene'
import './App.css'

const PRESETS = {
  small: { label: '小 3×3×2.5m', size: { w: 3, d: 3, h: 2.5 } },
  medium: { label: '中 6×3×2.7m', size: { w: 6, d: 3, h: 2.7 } },
  large: { label: '大 9×3×3m', size: { w: 9, d: 3, h: 3 } },
}

export default function App() {
  const [presetKey, setPresetKey] = useState('medium')
  const [walls, setWalls] = useState({ back: true, left: true, right: true, front: false })

  const booth = {
    size: PRESETS[presetKey].size,
    walls,
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>booth-sim</h1>
        <span className="app-subtitle">3D Booth Simulator (Day 1 MVP)</span>
      </header>
      <aside className="sidebar">
        <section>
          <h2>ブースサイズ</h2>
          <div className="preset-list">
            {Object.entries(PRESETS).map(([key, p]) => (
              <label key={key} className="preset-row">
                <input
                  type="radio"
                  name="preset"
                  checked={presetKey === key}
                  onChange={() => setPresetKey(key)}
                />
                {p.label}
              </label>
            ))}
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
                  checked={walls[k]}
                  onChange={(e) => setWalls((w) => ({ ...w, [k]: e.target.checked }))}
                />
                {l}
              </label>
            ))}
          </div>
        </section>
        <section className="hint">
          <p>カメラ操作 (Day1):</p>
          <ul>
            <li>左ドラッグ: pan</li>
            <li>右ドラッグ: orbit</li>
            <li>スクロール: zoom</li>
          </ul>
          <p className="hint-note">※ Ctrl+drag orbit は次スプリントで対応</p>
        </section>
      </aside>
      <main className="scene-wrap">
        <Scene booth={booth} />
      </main>
    </div>
  )
}
