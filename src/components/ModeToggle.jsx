import { useBoothStore } from '../stores/useBoothStore'

export default function ModeToggle() {
  const cameraMode = useBoothStore((s) => s.cameraMode)
  const setCameraMode = useBoothStore((s) => s.setCameraMode)
  const deselect = useBoothStore((s) => s.deselect)
  const cancelPlacing = useBoothStore((s) => s.cancelPlacing)

  return (
    <div className="mode-toggle">
      <button
        className={cameraMode === 'edit' ? 'active' : ''}
        onClick={() => {
          setCameraMode('edit')
        }}
        title="アイテムを選択・ドラッグで動かす"
      >
        ✏️ 編集
      </button>
      <button
        className={cameraMode === 'view' ? 'active' : ''}
        onClick={() => {
          setCameraMode('view')
          cancelPlacing()
          deselect()
        }}
        title="ドラッグで視点を動かす"
      >
        🎥 視点
      </button>
    </div>
  )
}
