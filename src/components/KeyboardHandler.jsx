import { useEffect } from 'react'
import { useBoothStore } from '../stores/useBoothStore'

export default function KeyboardHandler() {
  const rotate = useBoothStore((s) => s.rotateSelected90)
  const remove = useBoothStore((s) => s.deleteSelected)
  const deselect = useBoothStore((s) => s.deselect)
  const cancelPlacing = useBoothStore((s) => s.cancelPlacing)
  const mode = useBoothStore((s) => s.mode)

  useEffect(() => {
    const handler = (e) => {
      if (e.target?.tagName === 'INPUT' || e.target?.tagName === 'TEXTAREA') return
      if (e.key === 'r' || e.key === 'R') {
        rotate()
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        remove()
      } else if (e.key === 'Escape') {
        if (mode === 'placing') cancelPlacing()
        else deselect()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [rotate, remove, deselect, cancelPlacing, mode])

  return null
}
