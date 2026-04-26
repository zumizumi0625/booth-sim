import { useBoothStore, snap } from '../stores/useBoothStore'

const WALL_THICKNESS = 0.05
const FLOOR_COLOR = '#f3f3f3'
const WALL_COLOR = '#ffffff'

function FloorSurface({ size, onPlacingHover, onPlacingClick, onBackgroundClick }) {
  const { w, d } = size
  return (
    <mesh
      receiveShadow
      position={[0, 0, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      onPointerMove={(e) => onPlacingHover?.('floor', e)}
      onClick={(e) => onPlacingClick?.('floor', e, () => onBackgroundClick?.())}
    >
      <planeGeometry args={[w, d]} />
      <meshStandardMaterial color={FLOOR_COLOR} />
    </mesh>
  )
}

function Wall({ which, position, args, onPlacingHover, onPlacingClick }) {
  return (
    <mesh
      position={position}
      receiveShadow
      onPointerMove={(e) => onPlacingHover?.(`wall:${which}`, e)}
      onClick={(e) => onPlacingClick?.(`wall:${which}`, e)}
    >
      <boxGeometry args={args} />
      <meshStandardMaterial color={WALL_COLOR} />
    </mesh>
  )
}

export default function Booth({ onPlacingHover, onPlacingClick, onBackgroundClick }) {
  const layout = useBoothStore((s) => s.getCurrent())
  const size = useBoothStore((s) => s.getBoothSize())
  const { w, d, h } = size
  const walls = layout.walls

  return (
    <group>
      <FloorSurface
        size={size}
        onPlacingHover={onPlacingHover}
        onPlacingClick={onPlacingClick}
        onBackgroundClick={onBackgroundClick}
      />
      {walls.back && (
        <Wall
          which="back"
          position={[0, h / 2, -d / 2]}
          args={[w, h, WALL_THICKNESS]}
          onPlacingHover={onPlacingHover}
          onPlacingClick={onPlacingClick}
        />
      )}
      {walls.front && (
        <Wall
          which="front"
          position={[0, h / 2, d / 2]}
          args={[w, h, WALL_THICKNESS]}
          onPlacingHover={onPlacingHover}
          onPlacingClick={onPlacingClick}
        />
      )}
      {walls.left && (
        <Wall
          which="left"
          position={[-w / 2, h / 2, 0]}
          args={[WALL_THICKNESS, h, d]}
          onPlacingHover={onPlacingHover}
          onPlacingClick={onPlacingClick}
        />
      )}
      {walls.right && (
        <Wall
          which="right"
          position={[w / 2, h / 2, 0]}
          args={[WALL_THICKNESS, h, d]}
          onPlacingHover={onPlacingHover}
          onPlacingClick={onPlacingClick}
        />
      )}
    </group>
  )
}

export function clampToBooth(x, z, size) {
  const { w, d } = size
  const margin = 0.1
  return [
    Math.max(-w / 2 + margin, Math.min(w / 2 - margin, snap(x))),
    Math.max(-d / 2 + margin, Math.min(d / 2 - margin, snap(z))),
  ]
}
