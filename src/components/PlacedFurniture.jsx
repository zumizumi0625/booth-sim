import { useRef, useState } from 'react'
import * as THREE from 'three'
import { Edges } from '@react-three/drei'
import { useBoothStore, snap } from '../stores/useBoothStore'
import { FURNITURE_TYPES } from '../data/furniture'
import Furniture from './Furniture'
import { clampToBooth } from './Booth'

const FLOOR_PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)

export default function PlacedFurniture({ item }) {
  const meshRef = useRef()
  const [dragging, setDragging] = useState(false)
  const selectedId = useBoothStore((s) => s.selectedId)
  const cameraMode = useBoothStore((s) => s.cameraMode)
  const placingMode = useBoothStore((s) => s.mode)
  const select = useBoothStore((s) => s.select)
  const moveItem = useBoothStore((s) => s.moveItem)
  const size = useBoothStore((s) => s.getBoothSize())
  const isSelected = selectedId === item.id

  const def = FURNITURE_TYPES[item.type]
  if (!def) return null

  const onPointerDown = (e) => {
    if (cameraMode !== 'edit') return
    if (placingMode === 'placing') return
    // タッチでは button が undefined / 0 のみ受ける
    if (e.button !== undefined && e.button !== 0) return
    e.stopPropagation()
    select(item.id)
    try {
      e.target.setPointerCapture(e.pointerId)
    } catch {}
    setDragging(true)
  }

  const onPointerMove = (e) => {
    if (!dragging) return
    e.stopPropagation()
    const target = new THREE.Vector3()
    if (!e.ray.intersectPlane(FLOOR_PLANE, target)) return
    const [sx, sz] = clampToBooth(target.x, target.z, size)
    moveItem(item.id, [sx, 0, sz])
  }

  const onPointerUp = (e) => {
    if (!dragging) return
    e.stopPropagation()
    try {
      e.target.releasePointerCapture(e.pointerId)
    } catch {}
    setDragging(false)
  }

  return (
    <group
      ref={meshRef}
      position={item.position}
      rotation={[0, item.rotationY ?? 0, 0]}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
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
