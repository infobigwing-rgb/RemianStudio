// Core editor types
export interface EditorProject {
  id: string
  name: string
  duration: number // in seconds
  resolution: "1080p" | "720p" | "4k"
  fps: 30 | 60
  createdAt: Date
  updatedAt: Date
}

export interface Layer {
  id: string
  type: "video" | "image" | "text" | "audio"
  name: string
  startTime: number
  duration: number
  track: number
  properties: LayerProperties
  effects?: Effect[]
  keyframes?: Keyframe[]
  transitionIn?: Transition
  transitionOut?: Transition
  isTemplate?: boolean
  templateVariableId?: string
}

export interface LayerProperties {
  x?: number
  y?: number
  width?: number
  height?: number
  opacity?: number
  rotation?: number
  scale?: number
  // Text specific
  text?: string
  fontSize?: number
  fontFamily?: string
  color?: string
  // Media specific
  src?: string
  volume?: number
}

export interface Effect {
  id: string
  type: "blur" | "brightness" | "contrast" | "saturate" | "transition"
  intensity: number
  enabled: boolean
}

export interface EnvatoAsset {
  id: string
  name: string
  thumbnailUrl: string
  previewUrl?: string
  type: "video-template" | "video" | "audio" | "image"
  price: number
  isPurchased: boolean
  author: string
  tags: string[]
}

// Template system types
export interface TemplateVariable {
  id: string
  name: string
  type: "text" | "image" | "video" | "color"
  defaultValue: string
  placeholder: string
  layerId: string
}

export interface Template {
  id: string
  name: string
  thumbnailUrl: string
  previewUrl?: string
  author: string
  tags: string[]
  price: number
  isPurchased: boolean
  duration: number
  resolution: "1080p" | "720p" | "4k"
  fps: 30 | 60
  variables: TemplateVariable[]
  layers: Layer[]
  composition?: TemplateComposition
}

export interface TemplateComposition {
  id: string
  name: string
  width: number
  height: number
  duration: number
  backgroundColor: string
  nestedCompositions?: TemplateComposition[]
}

// Keyframe types for animation
export interface Keyframe {
  id: string
  time: number
  property: string
  value: any
  easing: "linear" | "ease-in" | "ease-out" | "ease-in-out" | "bezier"
  bezierPoints?: [number, number, number, number]
}

// Transition types
export interface Transition {
  id: string
  type: "crossfade" | "wipe" | "slide" | "push" | "zoom" | "blur"
  duration: number
  direction?: "left" | "right" | "up" | "down"
  easing: "linear" | "ease-in" | "ease-out" | "ease-in-out"
}

export interface ExportSettings {
  resolution: "1080p" | "720p" | "4k"
  fps: 30 | 60
  format: "mp4" | "webm"
  quality: "low" | "medium" | "high"
}
