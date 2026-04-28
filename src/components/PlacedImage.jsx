import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useBoothStore } from '../stores/useBoothStore'

function loadTex(src) {
  return new Promise((resolve) => {
    const loader = new THREE.TextureLoader()
    loader.load(src, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace
      resolve(tex)
    })
  })
}

export default function PlacedImage({ image }) {
  const [tex, setTex] = useState(null)
  const [dragging, setDragging] = useState(false)
  const selectedId = useBoothStore((s) => s.selectedId)
  const cameraMode = useBoothStore((s) => s.cameraMode)
  const placingMode = useBoothStore((s) => s.mode)
  const select = useBoothStore((s) => s.select)
  const moveImageOnSurface = useBoothStore((s) => s.moveImageOnSurface)
  const isSelected = selectedId === image.id

  useEffect(() => {
    let cancel = false
    let loaded = null
    loadTex(image.src).then((t) => {
      if (cancel) {
        t.dispose?.()
        return
      }
      loaded = t
      setTex(t)
    })
    return () => {
      cancel = true
      if (loaded) loaded.dispose?.()
    }
  }, [image.src])

  const w = image.widthMeters
  const h = w / image.naturalAspect

  const normal = new THREE.Vector3(...image.normal)
  const baseQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal)
  const surfaceRotQuat = new THREE.Quaternion().setFromAxisAngle(
    normal,
    image.rotationOnSurface ?? 0,
  )
  const finalQuat = surfaceRotQuat.multiply(baseQuat)
  const rotEuler = new THREE.Euler().setFromQuaternion(finalQuat)

  const offset = 0.005
  const renderPos = [
    image.position[0] + normal.x * offset,
    image.position[1] + normal.y * offset,
    image.position[2] + normal.z * offset,
  ]

  // ドラッグ用のサーフェス平面（画像が貼り付いている面そのもの）
  const surfacePlane = new THREE.Plane().setFromNormalAndCoplanarPoint(
    normal,
    new THREE.Vector3(...image.position),
  )

  const onPointerDown = (e) => {
    if (cameraMode !== 'edit') return
    if (placingMode === 'placing') return
    if (e.button !== undefined && e.button !== 0) return
    e.stopPropagation()
    select(image.id)
    try {
      e.target.setPointerCapture(e.pointerId)
    } catch {}
    setDragging(true)
  }

  const onPointerMove = (e) => {
    if (!dragging) return
    e.stopPropagation()
    const target = new THREE.Vector3()
    if (!e.ray.intersectPlane(surfacePlane, target)) return
    moveImageOnSurface(image.id, [target.x, target.y, target.z])
  }

  const onPointerUp = (e) => {
    if (!dragging) return
    e.stopPropagation()
    try {
      e.target.releasePointerCapture(e.pointerId)
    } catch {}
    setDragging(false)
  }

  // テクスチャ読み込み前は何も描画しない（白い面が一瞬出るのを防ぐ）
  if (!tex) return null

  return (
    <group
      position={renderPos}
      rotation={[rotEuler.x, rotEuler.y, rotEuler.z]}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <mesh key={image.src}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial
          map={tex}
          side={THREE.DoubleSide}
          toneMapped={false}
          transparent
        />
      </mesh>
      {isSelected && (
        <lineSegments>
          <edgesGeometry args={[new THREE.PlaneGeometry(w + 0.02, h + 0.02)]} />
          <lineBasicMaterial color="#3b82f6" />
        </lineSegments>
      )}
    </group>
  )
}
