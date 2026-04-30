import { useEffect, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import * as THREE from 'three'
import Booth from './Booth'
import Furniture from './Furniture'
import PlacedFurniture from './PlacedFurniture'
import PlacedImage from './PlacedImage'
import { FurniturePreview, ImagePreview } from './PlacementPreview'
import DimensionLabel from './DimensionLabel'
import { useBoothStore, snap } from '../stores/useBoothStore'
import { FURNITURE_TYPES } from '../data/furniture'

function fitCamera(size) {
  const { w, d, h } = size
  const distance = Math.max(w, d, h) * 1.4 + 1
  return [distance, distance * 0.85, distance]
}

const VIEWS = {
  iso: (s) => ({
    position: [Math.max(s.w, s.d) * 1.4, Math.max(s.w, s.d) * 1.1, Math.max(s.w, s.d) * 1.4],
    target: [0, s.h / 2, 0],
  }),
  front: (s) => ({ position: [0, s.h / 2, s.d * 1.6], target: [0, s.h / 2, 0] }),
  back: (s) => ({ position: [0, s.h / 2, -s.d * 1.6], target: [0, s.h / 2, 0] }),
  left: (s) => ({ position: [-s.w * 1.6, s.h / 2, 0], target: [0, s.h / 2, 0] }),
  right: (s) => ({ position: [s.w * 1.6, s.h / 2, 0], target: [0, s.h / 2, 0] }),
  top: (s) => ({ position: [0, Math.max(s.w, s.d) * 1.6, 0.001], target: [0, 0, 0] }),
}

export { VIEWS }

function CameraSetter({ viewKey, size, controlsRef }) {
  const { camera } = useThree()
  useEffect(() => {
    if (!viewKey) return
    const v = VIEWS[viewKey]?.(size)
    if (!v) return
    camera.position.set(...v.position)
    camera.up.set(0, 1, 0)
    camera.lookAt(...v.target)
    if (controlsRef?.current) {
      controlsRef.current.target.set(...v.target)
      controlsRef.current.update()
    }
  }, [viewKey, size.w, size.d, size.h, camera, controlsRef])
  return null
}

export default function Scene({ captureRef }) {
  const layout = useBoothStore((s) => s.getCurrent())
  const size = useBoothStore((s) => s.getBoothSize())
  const mode = useBoothStore((s) => s.mode)
  const cameraMode = useBoothStore((s) => s.cameraMode)
  const placingKind = useBoothStore((s) => s.placingKind)
  const placeFurniture = useBoothStore((s) => s.placeFurniture)
  const placeImage = useBoothStore((s) => s.placeImage)
  const cancelPlacing = useBoothStore((s) => s.cancelPlacing)
  const deselect = useBoothStore((s) => s.deselect)
  const selectedId = useBoothStore((s) => s.selectedId)
  const moveItem = useBoothStore((s) => s.moveItem)

  const [hover, setHover] = useState({ point: null, normal: [0, 1, 0], surface: null })
  const [viewKey, setViewKey] = useState(null)
  const controlsRef = useRef()

  useEffect(() => {
    const handle = (e) => {
      // emit a custom view change request from outside
      if (e.detail?.view) setViewKey(e.detail.view + ':' + Math.random())
    }
    window.addEventListener('booth:setView', handle)
    return () => window.removeEventListener('booth:setView', handle)
  }, [])

  // Translate string-form viewKey "front:0.123" → just "front"
  const viewName = viewKey?.split(':')[0]

  const onSurfaceHover = (surfaceId, e) => {
    if (mode !== 'placing') return
    const point = [e.point.x, e.point.y, e.point.z]
    let normal = [0, 1, 0]
    if (surfaceId.startsWith('wall:')) {
      const which = surfaceId.split(':')[1]
      normal = {
        back: [0, 0, 1],
        front: [0, 0, -1],
        left: [1, 0, 0],
        right: [-1, 0, 0],
      }[which]
    } else if (surfaceId === 'furnitureTop') {
      normal = [0, 1, 0]
    }

    if ((placingKind === 'furniture' || placingKind === 'primitive') && surfaceId === 'floor') {
      const sx = snap(point[0])
      const sz = snap(point[2])
      setHover({ point: [sx, 0, sz], normal: [0, 1, 0], surface: surfaceId })
    } else if (placingKind === 'primitive' && surfaceId === 'furnitureTop') {
      // 円柱・直方体を家具の天板に置く（5cm スナップ、y は家具上面の高さ）
      const round5 = (v) => Math.round(v / 0.05) * 0.05
      setHover({
        point: [round5(point[0]), point[1], round5(point[2])],
        normal: [0, 1, 0],
        surface: 'furnitureTop',
      })
    } else if (placingKind === 'image') {
      // Image: snap on surface plane (rounded to 5cm for finesse)
      const round5 = (v) => Math.round(v / 0.05) * 0.05
      setHover({
        point: [round5(point[0]), round5(point[1]), round5(point[2])],
        normal,
        surface: surfaceId,
      })
    }
  }

  const onSurfaceClick = (surfaceId, e) => {
    // Measure tool: 床/壁/家具上面いずれもクリック可
    if (measureActive) {
      e.stopPropagation()
      setMeasurePoint([e.point.x, e.point.y, e.point.z])
      return
    }

    if (mode === 'placing') {
      e.stopPropagation()
      if (placingKind === 'furniture' || placingKind === 'primitive') {
        // 家具は床のみ。プリミティブは床と家具上面 OK
        if (placingKind === 'furniture' && surfaceId !== 'floor') return
        if (placingKind === 'primitive' && surfaceId !== 'floor' && surfaceId !== 'furnitureTop') return
        placeFurniture(hover.point ?? [snap(e.point.x), 0, snap(e.point.z)])
      } else if (placingKind === 'image') {
        placeImage({
          position: hover.point ?? [e.point.x, e.point.y, e.point.z],
          normal: hover.normal,
          surface: surfaceId,
          rotationOnSurface: 0,
        })
      }
      return
    }

    // 編集モードでドラッグできるので click-to-move は廃止。床クリックは deselect 用途のみ
    if (cameraMode === 'edit' && selectedId && surfaceId === 'floor') {
      deselect()
    }
  }

  const onCanvasMissed = () => {
    if (mode === 'placing') return
    deselect()
  }

  const onCanvasContextMenu = (e) => {
    e.preventDefault()
    if (mode === 'placing') cancelPlacing()
  }

  const cameraPos = fitCamera(size)
  const selectedItem = layout.items.find((i) => i.id === selectedId)
  const selectedImage = layout.images.find((i) => i.id === selectedId)
  const visualTone = useBoothStore((s) => s.visualTone)
  const measureActive = useBoothStore((s) => s.measureActive)
  const measureStart = useBoothStore((s) => s.measureStart)
  const measureEnd = useBoothStore((s) => s.measureEnd)
  const setMeasurePoint = useBoothStore((s) => s.setMeasurePoint)

  // Tone preset: 背景色 と light intensities
  const toneCfg = {
    mock: { bg: '#e9ecef', ambient: 0.65, directional: 0.9, hemi: 0.4 },
    dark: { bg: '#0f172a', ambient: 0.25, directional: 0.6, hemi: 0.15 },
    kawaii: { bg: '#fef9e7', ambient: 0.85, directional: 1.1, hemi: 0.5 },
  }[visualTone] ?? { bg: '#e9ecef', ambient: 0.65, directional: 0.9, hemi: 0.4 }

  return (
    <Canvas
      shadows
      camera={{ position: cameraPos, fov: 45 }}
      style={{ background: toneCfg.bg }}
      onPointerMissed={onCanvasMissed}
      onContextMenu={onCanvasContextMenu}
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      onCreated={({ gl, scene, camera }) => {
        if (captureRef) captureRef.current = { gl, scene, camera, controlsRef }
      }}
    >
      <ambientLight intensity={toneCfg.ambient} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={toneCfg.directional}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <hemisphereLight args={['#ffffff', '#cccccc', toneCfg.hemi]} />

      <Grid
        args={[40, 40]}
        cellSize={0.25}
        cellThickness={0.5}
        cellColor="#cccccc"
        sectionSize={1}
        sectionThickness={1}
        sectionColor="#999999"
        fadeDistance={30}
        fadeStrength={1}
        position={[0, 0.001, 0]}
      />

      <Booth
        onPlacingHover={onSurfaceHover}
        onPlacingClick={onSurfaceClick}
      />

      {layout.items.map((it) => (
        <PlacedFurnitureWithRaycast
          key={it.id}
          item={it}
          onSurfaceHover={onSurfaceHover}
          onSurfaceClick={onSurfaceClick}
        />
      ))}
      {layout.images.map((im) => (
        <PlacedImage key={im.id} image={im} />
      ))}

      <FurniturePreview point={hover.point} />
      <ImagePreview point={hover.point} normal={hover.normal} />

      {selectedItem && (() => {
        const effSize =
          selectedItem.dimsOverride ?? FURNITURE_TYPES[selectedItem.type]?.size
        return (
          <DimensionLabel
            position={[
              selectedItem.position[0],
              (effSize?.h ?? 1) + 0.3,
              selectedItem.position[2],
            ]}
            text={dimensionText(effSize)}
          />
        )
      })()}
      {selectedImage && (
        <DimensionLabel
          position={[
            selectedImage.position[0],
            selectedImage.position[1] + (selectedImage.widthMeters / selectedImage.naturalAspect) / 2 + 0.2,
            selectedImage.position[2],
          ]}
          text={`${cm(selectedImage.widthMeters)} × ${cm(selectedImage.widthMeters / selectedImage.naturalAspect)} cm`}
        />
      )}

      {measureActive && measureStart && (
        <MeasureMarker position={measureStart} color="#3b82f6" />
      )}
      {measureActive && measureEnd && (
        <MeasureMarker position={measureEnd} color="#3b82f6" />
      )}
      {measureActive && measureStart && measureEnd && (
        <MeasureSegment a={measureStart} b={measureEnd} />
      )}

      <CameraSetter viewKey={viewName} size={size} controlsRef={controlsRef} />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.1}
        target={[0, size.h / 2, 0]}
        mouseButtons={{ LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE }}
        touches={{ ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_ROTATE }}
        enabled={cameraMode === 'view' && mode !== 'placing'}
      />
    </Canvas>
  )
}

// 家具コンポーネントの上面も raycast 対象にしたいので、wrapper を用意
function PlacedFurnitureWithRaycast({ item, onSurfaceHover, onSurfaceClick }) {
  const def = FURNITURE_TYPES[item.type]
  const effectiveSize = item.dimsOverride ?? def?.size
  return (
    <group>
      <PlacedFurniture item={item} />
      {/* 家具上面を image 配置のターゲットに */}
      <FurnitureTopHitArea
        position={[
          item.position[0],
          (effectiveSize?.h ?? 0) + 0.001,
          item.position[2],
        ]}
        rotationY={item.rotationY ?? 0}
        size={effectiveSize}
        onSurfaceHover={onSurfaceHover}
        onSurfaceClick={onSurfaceClick}
      />
    </group>
  )
}

function FurnitureTopHitArea({ position, rotationY, size, onSurfaceHover, onSurfaceClick }) {
  const placingKind = useBoothStore((s) => s.placingKind)
  // 画像 or プリミティブの配置時のみ天板を raycast 対象にする
  if (!size || (placingKind !== 'image' && placingKind !== 'primitive')) return null
  return (
    <mesh
      position={position}
      rotation={[-Math.PI / 2, 0, rotationY]}
      onPointerMove={(e) => onSurfaceHover('furnitureTop', e)}
      onClick={(e) => onSurfaceClick('furnitureTop', e)}
    >
      <planeGeometry args={[size.w, size.d]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  )
}

function MeasureMarker({ position, color }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.04, 12, 8]} />
      <meshBasicMaterial color={color} />
    </mesh>
  )
}

function MeasureSegment({ a, b }) {
  const points = [
    new THREE.Vector3(...a),
    new THREE.Vector3(...b),
  ]
  const dist = points[0].distanceTo(points[1])
  const mid = points[0].clone().add(points[1]).multiplyScalar(0.5)
  return (
    <>
      <line>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([...a, ...b])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#3b82f6" linewidth={2} />
      </line>
      <DimensionLabel
        position={[mid.x, mid.y + 0.15, mid.z]}
        text={`${(dist * 100).toFixed(1)} cm`}
      />
    </>
  )
}

function dimensionText(size) {
  if (!size) return ''
  return `${cm(size.w)} × ${cm(size.d)} × ${cm(size.h)} cm`
}

function cm(m) {
  return Math.round(m * 100)
}
