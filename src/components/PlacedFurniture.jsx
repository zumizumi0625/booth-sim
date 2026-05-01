import { useRef, useState } from 'react'
import * as THREE from 'three'
import { Edges } from '@react-three/drei'
import { useBoothStore, snap } from '../stores/useBoothStore'
import { FURNITURE_TYPES } from '../data/furniture'
import { PRIMITIVES } from '../data/primitives'
import Furniture, { getPrimitiveBBox } from './Furniture'
import { clampToBooth } from './Booth'

// drag 用の平面はアイテムの現在 y で構築する（机上に置いたものを動かしても床に落ちないように）

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

  const isPrimitive = !!PRIMITIVES[item.type]
  const def = FURNITURE_TYPES[item.type] ?? PRIMITIVES[item.type]
  if (!def) return null
  // 家具なら dimsOverride、プリミティブなら params から bbox を計算
  const bbox = isPrimitive
    ? getPrimitiveBBox(item.type, item.params ?? def.defaultParams)
    : (item.dimsOverride ?? def.size)

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
    // アイテムの現在 y で水平面を作る（机上の物が床に落ちない）
    const planeY = item.position[1] ?? 0
    const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -planeY)
    if (!e.ray.intersectPlane(dragPlane, target)) return
    const [sx, sz] = clampToBooth(target.x, target.z, size)
    moveItem(item.id, [sx, planeY, sz])
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
      <Furniture
        type={item.type}
        sizeOverride={item.dimsOverride ?? null}
        params={item.params ?? null}
      />
      {isSelected && (
        <mesh position={[0, bbox.h / 2, 0]}>
          <boxGeometry args={[bbox.w + 0.05, bbox.h + 0.05, bbox.d + 0.05]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          <Edges color="#3b82f6" threshold={1} />
        </mesh>
      )}
    </group>
  )
}
