import { useState } from 'react'
import { captureAll } from '../lib/capture'
import { useBoothStore } from '../stores/useBoothStore'

export default function CaptureButton({ captureRef }) {
  const layout = useBoothStore((s) => s.getCurrent())
  const size = useBoothStore((s) => s.getBoothSize())
  const [busy, setBusy] = useState(false)

  const onClick = async () => {
    if (busy || !captureRef.current?.gl) return
    setBusy(true)
    try {
      await captureAll(captureRef.current, size, layout.name)
    } catch (err) {
      console.error(err)
      alert('Capture 失敗: ' + err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button className="capture-btn" onClick={onClick} disabled={busy}>
      {busy ? 'Capturing...' : '📷 Capture (ZIP+PDF)'}
    </button>
  )
}
