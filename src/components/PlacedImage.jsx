import { useEffect, useState } from 'react'
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
  const selectedId = useBoothStore((s) => s.selectedId)
  const select = useBoothStore((s) => s.select)
  const isSelected = selectedId === image.id

  useEffect(() => {
    let cancel = false
    loadTex(image.src).then((t) => {
      if (!cancel) setTex(t)
    })
    return () => {
      cancel = true
    }
  }, [image.src])

  const w = image.widthMeters
  const h = w / image.naturalAspect

  // surfaceNormal は画像が貼られている面の外向き法線。回転行列を組み立てる。
  const normal = new THREE.Vector3(...image.normal)
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal)
  const rotEuler = new THREE.Euler().setFromQuaternion(quat)

  // 表面に貼り付け、わずかに浮かす
  const offset = 0.005
  const pos = [
    image.position[0] + normal.x * offset,
    image.position[1] + normal.y * offset,
    image.position[2] + normal.z * offset,
  ]

  return (
    <group
      position={pos}
      rotation={[rotEuler.x, rotEuler.y, rotEuler.z]}
      onClick={(e) => {
        e.stopPropagation()
        select(image.id)
      }}
    >
      <mesh>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={tex} side={THREE.DoubleSide} toneMapped={false} />
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
