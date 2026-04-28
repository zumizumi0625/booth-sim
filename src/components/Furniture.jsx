import { FURNITURE_TYPES } from '../data/furniture'
import { PRIMITIVES } from '../data/primitives'

function PrimitiveBox({ params, color, opacity = 1 }) {
  const { w, d, h } = params
  const transparent = opacity < 1
  return (
    <mesh position={[0, h / 2, 0]} castShadow>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial color={color} transparent={transparent} opacity={opacity} />
    </mesh>
  )
}

function Cylinder({ params, color, opacity = 1 }) {
  const { radius, length, axis = 'y' } = params
  const transparent = opacity < 1
  // 軸の向き: 'y' = 縦置き, 'x' = 横倒しX軸方向, 'z' = 横倒しZ軸方向
  const rotation =
    axis === 'x' ? [0, 0, Math.PI / 2] : axis === 'z' ? [Math.PI / 2, 0, 0] : [0, 0, 0]
  const yCenter = axis === 'y' ? length / 2 : radius
  return (
    <mesh position={[0, yCenter, 0]} rotation={rotation} castShadow>
      <cylinderGeometry args={[radius, radius, length, 32]} />
      <meshStandardMaterial color={color} transparent={transparent} opacity={opacity} />
    </mesh>
  )
}

export function getPrimitiveBBox(type, params) {
  if (type === 'cylinder') {
    const { radius, length, axis = 'y' } = params
    if (axis === 'y') return { w: 2 * radius, d: 2 * radius, h: length }
    if (axis === 'x') return { w: length, d: 2 * radius, h: 2 * radius }
    if (axis === 'z') return { w: 2 * radius, d: length, h: 2 * radius }
  }
  if (type === 'box') {
    return { w: params.w, d: params.d, h: params.h }
  }
  return { w: 0.5, d: 0.5, h: 0.5 }
}

function Desk({ size, color, opacity = 1 }) {
  const { w, d, h } = size
  const topThickness = 0.04
  const legThickness = 0.04
  const legY = (h - topThickness) / 2
  const legHalfX = w / 2 - legThickness
  const legHalfZ = d / 2 - legThickness
  const transparent = opacity < 1
  return (
    <group>
      <mesh position={[0, h - topThickness / 2, 0]} castShadow>
        <boxGeometry args={[w, topThickness, d]} />
        <meshStandardMaterial color={color} transparent={transparent} opacity={opacity} />
      </mesh>
      {[
        [-legHalfX, legY, -legHalfZ],
        [legHalfX, legY, -legHalfZ],
        [-legHalfX, legY, legHalfZ],
        [legHalfX, legY, legHalfZ],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <boxGeometry args={[legThickness, h - topThickness, legThickness]} />
          <meshStandardMaterial color={color} transparent={transparent} opacity={opacity} />
        </mesh>
      ))}
    </group>
  )
}

function Chair({ size, color, opacity = 1 }) {
  const { w, d, h } = size
  const seatH = 0.45
  const seatThickness = 0.04
  const legT = 0.03
  const backH = h - seatH
  const transparent = opacity < 1
  return (
    <group>
      <mesh position={[0, seatH - seatThickness / 2, 0]} castShadow>
        <boxGeometry args={[w, seatThickness, d]} />
        <meshStandardMaterial color={color} transparent={transparent} opacity={opacity} />
      </mesh>
      <mesh position={[0, seatH + backH / 2, -d / 2 + 0.03]} castShadow>
        <boxGeometry args={[w, backH, 0.04]} />
        <meshStandardMaterial color={color} transparent={transparent} opacity={opacity} />
      </mesh>
      {[
        [-(w / 2 - legT), (seatH - seatThickness) / 2, -(d / 2 - legT)],
        [w / 2 - legT, (seatH - seatThickness) / 2, -(d / 2 - legT)],
        [-(w / 2 - legT), (seatH - seatThickness) / 2, d / 2 - legT],
        [w / 2 - legT, (seatH - seatThickness) / 2, d / 2 - legT],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <boxGeometry args={[legT, seatH - seatThickness, legT]} />
          <meshStandardMaterial color={color} transparent={transparent} opacity={opacity} />
        </mesh>
      ))}
    </group>
  )
}

function FlatPanel({ size, color, opacity = 1 }) {
  const { w, d, h } = size
  return (
    <mesh position={[0, h / 2, 0]} castShadow>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial color={color} transparent={opacity < 1} opacity={opacity} />
    </mesh>
  )
}

export default function Furniture({
  type,
  position = [0, 0, 0],
  rotationY = 0,
  opacity = 1,
  onPointerDown,
  onPlacingHover,
  highlight = false,
  sizeOverride = null,
  params = null,
}) {
  // プリミティブ（円柱・直方体）
  if (PRIMITIVES[type]) {
    const def = PRIMITIVES[type]
    const renderColor = highlight ? '#3b82f6' : def.color
    const effectiveParams = params ?? def.defaultParams
    const PrimitiveComp = type === 'cylinder' ? Cylinder : PrimitiveBox
    return (
      <group
        position={position}
        rotation={[0, rotationY, 0]}
        onPointerDown={onPointerDown}
      >
        <PrimitiveComp params={effectiveParams} color={renderColor} opacity={opacity} />
      </group>
    )
  }

  const def = FURNITURE_TYPES[type]
  if (!def) return null
  const size = sizeOverride ?? def.size
  const { color } = def
  const renderColor = highlight ? '#3b82f6' : color

  let Inner
  switch (type) {
    case 'desk':
    case 'longDesk':
      Inner = Desk
      break
    case 'chair':
      Inner = Chair
      break
    case 'partition':
    case 'signStand':
      Inner = FlatPanel
      break
    default:
      return null
  }

  return (
    <group
      position={position}
      rotation={[0, rotationY, 0]}
      onPointerDown={onPointerDown}
      onPointerMove={(e) => {
        if (onPlacingHover) onPlacingHover('furnitureTop', e)
      }}
    >
      <Inner size={size} color={renderColor} opacity={opacity} />
      {/* 家具上面: 画像配置用に raycast 対象としても機能 */}
      <mesh position={[0, size.h + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <planeGeometry args={[size.w, size.d]} />
      </mesh>
    </group>
  )
}
