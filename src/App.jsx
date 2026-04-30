import { useEffect, useRef, useState } from 'react'
import Scene from './components/Scene'
import Sidebar from './components/Sidebar'
import ViewButtons from './components/ViewButtons'
import CaptureButton from './components/CaptureButton'
import KeyboardHandler from './components/KeyboardHandler'
import ModeToggle from './components/ModeToggle'
import ToneToggle from './components/ToneToggle'
import MeasureToggle from './components/MeasureToggle'
import './App.css'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false,
  )
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return isMobile
}

export default function App() {
  const captureRef = useRef({})
  const isMobile = useIsMobile()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className={`app${isMobile ? ' app--mobile' : ''}${sidebarOpen ? ' sidebar-open' : ''}`}>
      <header className="app-header">
        {isMobile && (
          <button
            type="button"
            className="hamburger"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="サイドバー切替"
          >
            {sidebarOpen ? '✕' : '☰'}
          </button>
        )}
        <h1>booth-sim</h1>
        {!isMobile && <span className="app-subtitle">3D Booth Simulator</span>}
        <div className="header-actions">
          <ModeToggle />
          <MeasureToggle />
          <ToneToggle />
          <CaptureButton captureRef={captureRef} />
        </div>
      </header>
      <Sidebar onCloseRequest={() => isMobile && setSidebarOpen(false)} />
      {isMobile && sidebarOpen && (
        <button
          type="button"
          className="sidebar-scrim"
          onClick={() => setSidebarOpen(false)}
          aria-label="サイドバーを閉じる"
        />
      )}
      <main className="scene-wrap">
        <Scene captureRef={captureRef} />
        <ViewButtons />
      </main>
      <KeyboardHandler />
    </div>
  )
}
