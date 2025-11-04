import { create } from "zustand"
import type { Project, Layer } from "./types"

interface EditorState {
  project: Project
  currentTime: number
  isPlaying: boolean
  selectedLayerId: string | null
  zoom: number

  setProject: (project: Project) => void
  addLayer: (layer: Layer) => void
  updateLayer: (id: string, updates: Partial<Layer>) => void
  removeLayer: (id: string) => void
  setCurrentTime: (time: number) => void
  setIsPlaying: (playing: boolean) => void
  setSelectedLayer: (id: string | null) => void
  setZoom: (zoom: number) => void
}

export const useEditorStore = create<EditorState>((set) => ({
  project: {
    id: "default",
    name: "Untitled Project",
    duration: 30,
    layers: [],
    resolution: { width: 1920, height: 1080 },
  },
  currentTime: 0,
  isPlaying: false,
  selectedLayerId: null,
  zoom: 1,

  setProject: (project) => set({ project }),

  addLayer: (layer) =>
    set((state) => ({
      project: {
        ...state.project,
        layers: [...state.project.layers, layer],
      },
    })),

  updateLayer: (id, updates) =>
    set((state) => ({
      project: {
        ...state.project,
        layers: state.project.layers.map((layer) => (layer.id === id ? { ...layer, ...updates } : layer)),
      },
    })),

  removeLayer: (id) =>
    set((state) => ({
      project: {
        ...state.project,
        layers: state.project.layers.filter((layer) => layer.id !== id),
      },
    })),

  setCurrentTime: (time) => set({ currentTime: time }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setSelectedLayer: (id) => set({ selectedLayerId: id }),
  setZoom: (zoom) => set({ zoom }),
}))
