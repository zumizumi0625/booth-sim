import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const PRESETS = {
  small: { label: '小 3×3×2.5m', size: { w: 3, d: 3, h: 2.5 } },
  medium: { label: '中 6×3×2.7m', size: { w: 6, d: 3, h: 2.7 } },
  large: { label: '大 9×3×3m', size: { w: 9, d: 3, h: 3 } },
}

const SNAP = 0.25

const newId = () => Math.random().toString(36).slice(2, 10)

const blankLayout = (id, name) => ({
  id,
  name,
  presetKey: 'medium',
  customSize: null,
  walls: { back: true, left: true, right: true, front: false },
  items: [],
  images: [],
})

const seedLayout = blankLayout('default', 'デフォルト')

export const useBoothStore = create(
  persist(
    (set, get) => ({
      layouts: [seedLayout],
      currentLayoutId: 'default',

      mode: 'idle',
      placingType: null,
      placingKind: null,
      pendingImage: null,
      selectedId: null,

      getCurrent: () => {
        const { layouts, currentLayoutId } = get()
        return layouts.find((l) => l.id === currentLayoutId) ?? layouts[0]
      },

      getBoothSize: () => {
        const layout = get().getCurrent()
        if (layout.customSize) return layout.customSize
        return PRESETS[layout.presetKey].size
      },

      updateCurrent: (updater) =>
        set((state) => ({
          layouts: state.layouts.map((l) =>
            l.id === state.currentLayoutId ? { ...l, ...updater(l) } : l,
          ),
        })),

      setPresetKey: (key) =>
        get().updateCurrent(() => ({ presetKey: key, customSize: null })),

      setCustomSize: (size) =>
        get().updateCurrent(() => ({ customSize: size, presetKey: 'custom' })),

      toggleWall: (which) =>
        get().updateCurrent((l) => ({ walls: { ...l.walls, [which]: !l.walls[which] } })),

      enterPlacing: (kind, type, payload = null) =>
        set({
          mode: 'placing',
          placingKind: kind,
          placingType: type,
          pendingImage: payload,
          selectedId: null,
        }),

      cancelPlacing: () =>
        set({ mode: 'idle', placingKind: null, placingType: null, pendingImage: null }),

      placeFurniture: (position, rotationY = 0) => {
        const { placingType } = get()
        if (!placingType) return
        const id = newId()
        get().updateCurrent((l) => ({
          items: [...l.items, { id, type: placingType, position, rotationY }],
        }))
        set({ mode: 'idle', placingType: null, placingKind: null, selectedId: id })
      },

      placeImage: (placement) => {
        const { pendingImage } = get()
        if (!pendingImage) return
        const id = newId()
        get().updateCurrent((l) => ({
          images: [
            ...l.images,
            {
              id,
              src: pendingImage.src,
              naturalAspect: pendingImage.naturalAspect,
              widthMeters: pendingImage.widthMeters,
              ...placement,
            },
          ],
        }))
        set({
          mode: 'idle',
          placingType: null,
          placingKind: null,
          pendingImage: null,
          selectedId: id,
        })
      },

      select: (id) => set({ selectedId: id }),
      deselect: () => set({ selectedId: null }),

      moveItem: (id, position) =>
        get().updateCurrent((l) => ({
          items: l.items.map((it) => (it.id === id ? { ...it, position } : it)),
        })),

      rotateSelected90: () => {
        const { selectedId } = get()
        if (!selectedId) return
        get().updateCurrent((l) => ({
          items: l.items.map((it) =>
            it.id === selectedId ? { ...it, rotationY: (it.rotationY ?? 0) + Math.PI / 2 } : it,
          ),
          images: l.images.map((im) =>
            im.id === selectedId ? { ...im, rotationOnSurface: ((im.rotationOnSurface ?? 0) + Math.PI / 2) } : im,
          ),
        }))
      },

      deleteSelected: () => {
        const { selectedId } = get()
        if (!selectedId) return
        get().updateCurrent((l) => ({
          items: l.items.filter((it) => it.id !== selectedId),
          images: l.images.filter((im) => im.id !== selectedId),
        }))
        set({ selectedId: null })
      },

      moveImage: (id, patch) =>
        get().updateCurrent((l) => ({
          images: l.images.map((im) => (im.id === id ? { ...im, ...patch } : im)),
        })),

      addLayout: () => {
        const id = newId()
        const layout = blankLayout(id, '無題のレイアウト')
        set((s) => ({ layouts: [...s.layouts, layout], currentLayoutId: id }))
      },

      duplicateLayout: () => {
        const cur = get().getCurrent()
        if (!cur) return
        const id = newId()
        set((s) => ({
          layouts: [...s.layouts, { ...cur, id, name: `${cur.name} (コピー)` }],
          currentLayoutId: id,
        }))
      },

      removeLayout: (id) => {
        set((s) => {
          const layouts = s.layouts.filter((l) => l.id !== id)
          if (layouts.length === 0) {
            const seed = blankLayout(newId(), 'デフォルト')
            return { layouts: [seed], currentLayoutId: seed.id }
          }
          return {
            layouts,
            currentLayoutId: id === s.currentLayoutId ? layouts[0].id : s.currentLayoutId,
          }
        })
      },

      renameLayout: (name) =>
        get().updateCurrent(() => ({ name })),

      switchLayout: (id) => set({ currentLayoutId: id, selectedId: null }),

      importLayouts: (data) => {
        if (!data || !Array.isArray(data.layouts)) return false
        const safe = data.layouts.map((l) => ({
          ...blankLayout(newId(), l.name ?? '読み込み'),
          ...l,
          id: newId(),
        }))
        set((s) => ({
          layouts: [...s.layouts, ...safe],
          currentLayoutId: safe[0]?.id ?? s.currentLayoutId,
        }))
        return true
      },

      exportLayouts: () => {
        const { layouts } = get()
        return { version: 1, exportedAt: new Date().toISOString(), layouts }
      },
    }),
    {
      name: 'booth-sim:v1',
      partialize: (state) => ({
        layouts: state.layouts,
        currentLayoutId: state.currentLayoutId,
      }),
    },
  ),
)

export { PRESETS, SNAP }

export const snap = (v) => Math.round(v / SNAP) * SNAP
