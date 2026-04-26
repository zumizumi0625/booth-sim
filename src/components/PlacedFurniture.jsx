import { useRef } from 'react'
import { Edges } from '@react-three/drei'
import { useBoothStore, snap } from '../stores/useBoothStore'
import { FURNITURE_TYPES } from '../data/furniture'
import Furniture from './Furniture'
import { clampToBooth } from './Booth'

export default function PlacedFurniture({ item }) {
  const ref = useRef()
  const selectedId = useBoothStore((s) => s.selectedId)
  const select = useBoothStore((s) => s.select)
  const moveItem = useBoothStore((s) => s.moveItem)
  const size = useBoothStore((s) => s.getBoothSize())
  const isSelected = selectedId === item.id

  const def = FURNITURE_TYPES[item.type]
  if (!def) return null

  return (
    <group
      ref={ref}
      position={item.position}
      rotation={[0, item.rotationY ?? 0, 0]}
      onClick={(e) => {
        e.stopPropagation()
        select(item.id)
      }}
    >
      <Furniture type={item.type} />
      {isSelected && (
        <mesh position={[0, def.size.h / 2, 0]}>
          <boxGeometry args={[def.size.w + 0.05, def.size.h + 0.05, def.size.d + 0.05]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          <Edges color="#3b82f6" threshold={1} />
        </mesh>
      )}
    </group>
  )
}

export function dragMoveSelected(intersection, size, moveItem, selectedId, currentItem) {
  if (!selectedId || !currentItem) return
  const [sx, sz] = clampToBooth(intersection.x, intersection.z, size)
  moveItem(selectedId, [sx, currentItem.position[1] ?? 0, sz])
}
