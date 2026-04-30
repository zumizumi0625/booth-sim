import { useBoothStore } from '../stores/useBoothStore'

export default function MeasureToggle() {
  const measureActive = useBoothStore((s) => s.measureActive)
  const toggleMeasure = useBoothStore((s) => s.toggleMeasure)
  const clearMeasure = useBoothStore((s) => s.clearMeasure)

  return (
    <div className="mode-toggle">
      <button
        className={measureActive ? 'active' : ''}
        onClick={toggleMeasure}
        title="2点クリックで距離を測る"
      >
        📏 計測
      </button>
      {measureActive && (
        <button onClick={clearMeasure} title="測定リセット">
          ⟲
        </button>
      )}
    </div>
  )
}
