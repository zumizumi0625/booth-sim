import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import Booth from './Booth'
import Furniture from './Furniture'

export default function Scene({ booth }) {
  const { w, d, h } = booth.size

  const isoDistance = Math.max(w, d) * 1.4
  const cameraPos = [isoDistance, isoDistance * 0.9, isoDistance]

  return (
    <Canvas
      shadows
      camera={{ position: cameraPos, fov: 45 }}
      style={{ background: '#e9ecef' }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={0.9}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      <Grid
        args={[20, 20]}
        cellSize={0.25}
        cellThickness={0.5}
        cellColor="#cccccc"
        sectionSize={1}
        sectionThickness={1}
        sectionColor="#999999"
        fadeDistance={20}
        fadeStrength={1}
        position={[0, 0.001, 0]}
      />

      <Booth size={booth.size} walls={booth.walls} />

      {/* Day1: 5種の家具を仮配置（後の sprint で配置 UX に置き換え） */}
      <Furniture type="longDesk" position={[-1.5, 0, -1]} />
      <Furniture type="chair" position={[-1.5, 0, -0.2]} rotationY={Math.PI} />
      <Furniture type="desk" position={[1, 0, -1]} />
      <Furniture type="partition" position={[0, 0, -d / 2 + 0.5]} />
      <Furniture type="signStand" position={[w / 2 - 0.4, 0, d / 2 - 0.4]} />

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.1}
        target={[0, h / 2, 0]}
        mouseButtons={{ LEFT: 2, MIDDLE: 1, RIGHT: 0 }}
      />
    </Canvas>
  )
}
