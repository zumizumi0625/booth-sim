import { useEffect } from 'react'
import { useBoothStore, snap } from '../stores/useBoothStore'

const STEP = 0.25

export default function KeyboardHandler() {
  const rotate = useBoothStore((s) => s.rotateSelected90)
  const remove = useBoothStore((s) => s.deleteSelected)
  const deselect = useBoothStore((s) => s.deselect)
  const cancelPlacing = useBoothStore((s) => s.cancelPlacing)
  const moveItem = useBoothStore((s) => s.moveItem)
  const moveImage = useBoothStore((s) => s.moveImage)
  const mode = useBoothStore((s) => s.mode)

  useEffect(() => {
    const handler = (e) => {
      if (e.target?.tagName === 'INPUT' || e.target?.tagName === 'TEXTAREA') return

      const state = useBoothStore.getState()
      const selectedId = state.selectedId
      const layout = state.getCurrent()

      if (e.key === 'r' || e.key === 'R') {
        rotate()
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        remove()
      } else if (e.key === 'Escape') {
        if (mode === 'placing') cancelPlacing()
        else deselect()
      } else if (selectedId && (e.key.startsWith('Arrow'))) {
        e.preventDefault()
        const item = layout.items.find((i) => i.id === selectedId)
        const image = layout.images.find((i) => i.id === selectedId)
        let dx = 0
        let dz = 0
        if (e.key === 'ArrowLeft') dx = -STEP
        else if (e.key === 'ArrowRight') dx = STEP
        else if (e.key === 'ArrowUp') dz = -STEP
        else if (e.key === 'ArrowDown') dz = STEP
        if (item) {
          moveItem(selectedId, [
            snap(item.position[0] + dx),
            item.position[1] ?? 0,
            snap(item.position[2] + dz),
          ])
        } else if (image) {
          // 床に貼ってある画像のみ XZ で動かす
          moveImage(selectedId, {
            position: [
              image.position[0] + dx,
              image.position[1],
              image.position[2] + dz,
            ],
          })
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [rotate, remove, deselect, cancelPlacing, moveItem, moveImage, mode])

  return null
}
