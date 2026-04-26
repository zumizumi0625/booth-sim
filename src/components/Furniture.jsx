import { FURNITURE_TYPES } from '../data/furniture'

function Desk({ size, color }) {
  const { w, d, h } = size
  const topThickness = 0.04
  const legThickness = 0.04
  const legY = (h - topThickness) / 2
  const legHalfX = w / 2 - legThickness
  const legHalfZ = d / 2 - legThickness
  return (
    <group>
      <mesh position={[0, h - topThickness / 2, 0]}>
        <boxGeometry args={[w, topThickness, d]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {[
        [-legHalfX, legY, -legHalfZ],
        [legHalfX, legY, -legHalfZ],
        [-legHalfX, legY, legHalfZ],
        [legHalfX, legY, legHalfZ],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[legThickness, h - topThickness, legThickness]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
    </group>
  )
}

function Chair({ size, color }) {
  const { w, d, h } = size
  const seatH = 0.45
  const seatThickness = 0.04
  const legT = 0.03
  const backH = h - seatH
  return (
    <group>
      <mesh position={[0, seatH - seatThickness / 2, 0]}>
        <boxGeometry args={[w, seatThickness, d]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, seatH + backH / 2, -d / 2 + 0.03]}>
        <boxGeometry args={[w, backH, 0.04]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {[
        [-(w / 2 - legT), (seatH - seatThickness) / 2, -(d / 2 - legT)],
        [w / 2 - legT, (seatH - seatThickness) / 2, -(d / 2 - legT)],
        [-(w / 2 - legT), (seatH - seatThickness) / 2, d / 2 - legT],
        [w / 2 - legT, (seatH - seatThickness) / 2, d / 2 - legT],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[legT, seatH - seatThickness, legT]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
    </group>
  )
}

function FlatPanel({ size, color }) {
  const { w, d, h } = size
  return (
    <mesh position={[0, h / 2, 0]}>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

export default function Furniture({ type, position = [0, 0, 0], rotationY = 0 }) {
  const def = FURNITURE_TYPES[type]
  if (!def) return null
  const { size, color } = def

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
    <group position={position} rotation={[0, rotationY, 0]}>
      <Inner size={size} color={color} />
    </group>
  )
}
