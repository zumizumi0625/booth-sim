const WALL_THICKNESS = 0.05
const FLOOR_COLOR = '#f3f3f3'
const WALL_COLOR = '#ffffff'

export default function Booth({ size, walls = { back: true, left: true, right: true, front: false } }) {
  const { w, d, h } = size

  return (
    <group>
      <mesh receiveShadow position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color={FLOOR_COLOR} />
      </mesh>

      {walls.back && (
        <mesh position={[0, h / 2, -d / 2]} receiveShadow>
          <boxGeometry args={[w, h, WALL_THICKNESS]} />
          <meshStandardMaterial color={WALL_COLOR} />
        </mesh>
      )}
      {walls.front && (
        <mesh position={[0, h / 2, d / 2]} receiveShadow>
          <boxGeometry args={[w, h, WALL_THICKNESS]} />
          <meshStandardMaterial color={WALL_COLOR} />
        </mesh>
      )}
      {walls.left && (
        <mesh position={[-w / 2, h / 2, 0]} receiveShadow>
          <boxGeometry args={[WALL_THICKNESS, h, d]} />
          <meshStandardMaterial color={WALL_COLOR} />
        </mesh>
      )}
      {walls.right && (
        <mesh position={[w / 2, h / 2, 0]} receiveShadow>
          <boxGeometry args={[WALL_THICKNESS, h, d]} />
          <meshStandardMaterial color={WALL_COLOR} />
        </mesh>
      )}
    </group>
  )
}
