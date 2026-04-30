import { useBoothStore } from '../stores/useBoothStore'

const TONES = [
  ['mock', '🏛 モック'],
  ['kawaii', '🌞 明るい'],
  ['dark', '🌙 ダーク'],
]

export default function ToneToggle() {
  const visualTone = useBoothStore((s) => s.visualTone)
  const setVisualTone = useBoothStore((s) => s.setVisualTone)
  return (
    <div className="mode-toggle" title="ビジュアルトーン">
      {TONES.map(([k, label]) => (
        <button
          key={k}
          className={visualTone === k ? 'active' : ''}
          onClick={() => setVisualTone(k)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
