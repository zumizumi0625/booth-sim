import { useMemo, useEffect } from 'react'
import { useBoothStore, snap } from '../stores/useBoothStore'
import { createSignTexture } from '../lib/textTexture'

const WALL_THICKNESS = 0.05
const WALL_COLOR = '#ffffff'
const HEADER_SIGN_HEIGHT = 0.6 // 600mm 固定（業界標準）
const HEADER_SIGN_DEFAULT_BG = '#1f2a44' // ダーク系（画像背景の宇宙感に合う標準色）

function FloorSurface({ size, color, onPlacingHover, onPlacingClick, onBackgroundClick }) {
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
      <meshStandardMaterial color={color || '#f3f3f3'} />
    </mesh>
  )
}

/**
 * ブース外周の地面: ブース外にもアイテムを置けるように、より広い raycast 用 plane.
 * 透明だが raycast 対象なので、ロールアップバナー等を booth 外側に置ける。
 * y = -0.005 で booth floor の下に置き、booth 内ではブース floor が優先的にヒットする。
 */
function OuterGround({ onPlacingHover, onPlacingClick, onBackgroundClick }) {
  return (
    <mesh
      position={[0, -0.005, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      onPointerMove={(e) => onPlacingHover?.('floor', e)}
      onClick={(e) => onPlacingClick?.('floor', e, () => onBackgroundClick?.())}
    >
      <planeGeometry args={[40, 40]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
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

function HeaderSign({ size, text, textColor, bgColor, onPlacingHover, onPlacingClick }) {
  const { w, d, h } = size
  const effectiveBg = bgColor || HEADER_SIGN_DEFAULT_BG

  // 文字が入っている場合のみ CanvasTexture を生成。寸法やテキストが変わるたびに
  // 再生成し、古いテクスチャは dispose する。
  const texture = useMemo(() => {
    if (!text || !text.trim()) return null
    return createSignTexture({
      text,
      color: textColor || '#ffffff',
      bg: effectiveBg,
      widthM: w,
      heightM: HEADER_SIGN_HEIGHT,
    })
  }, [text, textColor, effectiveBg, w])

  useEffect(() => {
    return () => {
      texture?.dispose?.()
    }
  }, [texture])

  // 正面（z = +d/2）にブース幅一杯、天井から下 600mm の帯
  // 正面の壁とのZ-fight回避のためわずかに外側へ
  // image 配置時は wall:front 扱い（既存の壁画像配置パイプラインを流用）
  return (
    <group position={[0, h - HEADER_SIGN_HEIGHT / 2, d / 2 + WALL_THICKNESS]}>
      {/* 看板本体（背景色）。boxGeometry をベタ塗りで残し、表面に文字 plane を載せる */}
      <mesh
        receiveShadow
        castShadow
        onPointerMove={(e) => onPlacingHover?.('wall:front', e)}
        onClick={(e) => onPlacingClick?.('wall:front', e)}
      >
        <boxGeometry args={[w, HEADER_SIGN_HEIGHT, WALL_THICKNESS]} />
        <meshStandardMaterial color={effectiveBg} />
      </mesh>
      {/* 文字テクスチャ。看板の手前にわずかに浮かせて Z-fight 回避 */}
      {texture && (
        <mesh position={[0, 0, WALL_THICKNESS / 2 + 0.002]}>
          <planeGeometry args={[w, HEADER_SIGN_HEIGHT]} />
          <meshBasicMaterial map={texture} transparent />
        </mesh>
      )}
    </group>
  )
}

export default function Booth({ onPlacingHover, onPlacingClick, onBackgroundClick }) {
  const layout = useBoothStore((s) => s.getCurrent())
  const size = useBoothStore((s) => s.getBoothSize())
  const { w, d, h } = size
  const walls = layout.walls

  return (
    <group>
      <OuterGround
        onPlacingHover={onPlacingHover}
        onPlacingClick={onPlacingClick}
        onBackgroundClick={onBackgroundClick}
      />
      <FloorSurface
        size={size}
        color={layout.floorColor}
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
      {(layout.headerSign ?? true) && (
        <HeaderSign
          size={size}
          text={layout.headerSignText ?? ''}
          textColor={layout.headerSignTextColor ?? '#ffffff'}
          bgColor={layout.headerSignBgColor ?? HEADER_SIGN_DEFAULT_BG}
          onPlacingHover={onPlacingHover}
          onPlacingClick={onPlacingClick}
        />
      )}
    </group>
  )
}

// ブース外側にもアイテムを置けるよう、外周バウンドは 40m 四方相当に緩和
const OUTER_HALF = 19.5

export function clampToBooth(x, z, _size) {
  return [
    Math.max(-OUTER_HALF, Math.min(OUTER_HALF, snap(x))),
    Math.max(-OUTER_HALF, Math.min(OUTER_HALF, snap(z))),
  ]
}
