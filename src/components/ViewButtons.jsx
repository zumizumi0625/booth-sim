const VIEWS = [
  ['front', '正面'],
  ['back', '背面'],
  ['left', '左'],
  ['right', '右'],
  ['top', '上'],
  ['iso', '45°'],
]

export default function ViewButtons() {
  return (
    <div className="view-buttons">
      {VIEWS.map(([key, label]) => (
        <button
          key={key}
          onClick={() =>
            window.dispatchEvent(new CustomEvent('booth:setView', { detail: { view: key } }))
          }
        >
          {label}
        </button>
      ))}
    </div>
  )
}
