import { useEffect, useState } from 'react'
import * as THREE from 'three'
import { FURNITURE_TYPES } from '../data/furniture'
import Furniture from './Furniture'
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

export function FurniturePreview({ point }) {
  const placingType = useBoothStore((s) => s.placingType)
  const placingKind = useBoothStore((s) => s.placingKind)
  if (!point || !placingType || placingKind !== 'furniture') return null
  return (
    <Furniture type={placingType} position={point} opacity={0.45} />
  )
}

export function ImagePreview({ point, normal }) {
  const placingKind = useBoothStore((s) => s.placingKind)
  const pendingImage = useBoothStore((s) => s.pendingImage)
  const [tex, setTex] = useState(null)

  useEffect(() => {
    if (!pendingImage) return
    let cancel = false
    loadTex(pendingImage.src).then((t) => {
      if (!cancel) setTex(t)
    })
    return () => { cancel = true }
  }, [pendingImage])

  if (!point || placingKind !== 'image' || !pendingImage) return null
  const w = pendingImage.widthMeters
  const h = w / pendingImage.naturalAspect
  const n = new THREE.Vector3(...normal)
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), n)
  const eu = new THREE.Euler().setFromQuaternion(quat)
  const offset = 0.01
  const pos = [point[0] + n.x * offset, point[1] + n.y * offset, point[2] + n.z * offset]

  return (
    <mesh position={pos} rotation={[eu.x, eu.y, eu.z]}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial
        map={tex}
        transparent
        opacity={0.55}
        side={THREE.DoubleSide}
        toneMapped={false}
        depthWrite={false}
      />
    </mesh>
  )
}
