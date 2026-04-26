import { useRef } from 'react'
import Scene from './components/Scene'
import Sidebar from './components/Sidebar'
import ViewButtons from './components/ViewButtons'
import CaptureButton from './components/CaptureButton'
import KeyboardHandler from './components/KeyboardHandler'
import './App.css'

export default function App() {
  const captureRef = useRef({})

  return (
    <div className="app">
      <header className="app-header">
        <h1>booth-sim</h1>
        <span className="app-subtitle">3D Booth Simulator</span>
        <div className="header-actions">
          <CaptureButton captureRef={captureRef} />
        </div>
      </header>
      <Sidebar />
      <main className="scene-wrap">
        <Scene captureRef={captureRef} />
        <ViewButtons />
      </main>
      <KeyboardHandler />
    </div>
  )
}
