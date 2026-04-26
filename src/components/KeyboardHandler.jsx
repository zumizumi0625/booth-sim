import { useEffect } from 'react'
import * as THREE from 'three'
import { useBoothStore, snap } from '../stores/useBoothStore'

const STEP = 0.25

function tangentBasis(normal) {
  if (Math.abs(normal[1]) > 0.9) {
    return [
      [1, 0, 0],
      [0, 0, -1],
    ]
  }
  const n = new THREE.Vector3(...normal)
  const up = new THREE.Vector3(0, 1, 0)
  const uV = new THREE.Vector3().crossVectors(up, n).normalize()
  return [
    [uV.x, uV.y, uV.z],
    [0, 1, 0],
  ]
}

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
      } else if (selectedId && e.key.startsWith('Arrow')) {
        e.preventDefault()
        const item = layout.items.find((i) => i.id === selectedId)
        const image = layout.images.find((i) => i.id === selectedId)
        let du = 0
        let dv = 0
        if (e.key === 'ArrowLeft') du = -STEP
        else if (e.key === 'ArrowRight') du = STEP
        else if (e.key === 'ArrowUp') dv = STEP
        else if (e.key === 'ArrowDown') dv = -STEP

        if (item) {
          // 家具は床上で XZ 平行移動（up arrow = -Z 奥）
          moveItem(selectedId, [
            snap(item.position[0] + du),
            item.position[1] ?? 0,
            snap(item.position[2] - dv),
          ])
        } else if (image) {
          // 画像は表面のタンジェント方向にだけ動かす（壁面に固定）
          const [uVec, vVec] = tangentBasis(image.normal)
          moveImage(selectedId, {
            position: [
              image.position[0] + uVec[0] * du + vVec[0] * dv,
              image.position[1] + uVec[1] * du + vVec[1] * dv,
              image.position[2] + uVec[2] * du + vVec[2] * dv,
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
