import { create } from "zustand"
import type { EditorProject, Layer } from "../types/editor"

interface EditorState {
  project: EditorProject | null
  layers: Layer[]
  selectedLayerId: string | null
  currentTime: number
  isPlaying: boolean
  zoom: number

  // Actions
  setProject: (project: EditorProject) => void
  addLayer: (layer: Layer) => void
  updateLayer: (id: string, updates: Partial<Layer>) => void
  removeLayer: (id: string) => void
  selectLayer: (id: string | null) => void
  setCurrentTime: (time: number) => void
  setIsPlaying: (playing: boolean) => void
  setZoom: (zoom: number) => void
}

export const useEditorStore = create<EditorState>((set) => ({
  project: null,
  layers: [],
  selectedLayerId: null,
  currentTime: 0,
  isPlaying: false,
  zoom: 1,

  setProject: (project) => set({ project }),

  addLayer: (layer) => set((state) => ({ layers: [...state.layers, layer] })),

  updateLayer: (id, updates) =>
    set((state) => ({
      layers: state.layers.map((layer) => (layer.id === id ? { ...layer, ...updates } : layer)),
    })),

  removeLayer: (id) =>
    set((state) => ({
      layers: state.layers.filter((layer) => layer.id !== id),
      selectedLayerId: state.selectedLayerId === id ? null : state.selectedLayerId,
    })),

  selectLayer: (id) => set({ selectedLayerId: id }),

  setCurrentTime: (time) => set({ currentTime: time }),

  setIsPlaying: (playing) => set({ isPlaying: playing }),

  setZoom: (zoom) => set({ zoom }),
}))
