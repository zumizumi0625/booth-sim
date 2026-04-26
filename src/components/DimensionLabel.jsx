import { Html } from '@react-three/drei'

export default function DimensionLabel({ position, text }) {
  return (
    <Html position={position} distanceFactor={8} center style={{ pointerEvents: 'none' }}>
      <div
        style={{
          background: 'rgba(15,23,42,0.85)',
          color: '#fff',
          padding: '4px 8px',
          borderRadius: 4,
          fontSize: 12,
          whiteSpace: 'nowrap',
          fontFamily: 'system-ui, sans-serif',
          pointerEvents: 'none',
        }}
      >
        {text}
      </div>
    </Html>
  )
}
