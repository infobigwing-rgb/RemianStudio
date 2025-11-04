export interface Layer {
  id: string
  type: "video" | "image" | "text" | "audio" | "shape" | "adjustment"
  name: string
  startTime: number
  duration: number
  track: number
  source?: string
  content?: string
  properties: {
    x: number
    y: number
    width: number
    height: number
    opacity: number
    rotation: number
    scale?: number
    anchorX?: number
    anchorY?: number
  }
  transition?: {
    type: "fade" | "slide" | "crossDissolve" | "dipToBlack" | "wipe" | "zoom" | "blur"
    duration: number
    easing?: "linear" | "easeIn" | "easeOut" | "easeInOut"
  }
  effects?: Effect[]
  keyframes?: Keyframe[]
  blendMode?: BlendMode
  masks?: Mask[]
}

export interface Keyframe {
  id: string
  property: string
  time: number
  value: number | string | { x: number; y: number }
  easing?: "linear" | "easeIn" | "easeOut" | "easeInOut" | "bezier"
  bezierControlPoints?: [number, number, number, number]
}

export interface Effect {
  id: string
  type: string
  name: string
  enabled: boolean
  parameters: Record<string, any>
}

export interface Mask {
  id: string
  path: string // SVG path data
  mode: "add" | "subtract" | "intersect"
  feather: number
  opacity: number
  expansion: number
}

export type BlendMode =
  | "normal"
  | "multiply"
  | "screen"
  | "overlay"
  | "darken"
  | "lighten"
  | "colorDodge"
  | "colorBurn"
  | "hardLight"
  | "softLight"
  | "difference"
  | "exclusion"

export interface Project {
  id: string
  name: string
  duration: number
  layers: Layer[]
  resolution: { width: number; height: number }
}

export interface EnvatoAsset {
  id: string
  name: string
  thumbnail: string
  previewUrl?: string
  category: string
  tags: string[]
  isPurchased: boolean
  isElements?: boolean // Added flag for Elements subscription assets
  templateData?: {
    layers: Array<{
      name: string
      type: string
      isPlaceholder: boolean
    }>
    placeholders: Array<{
      id: string
      name: string
      type: "text" | "image" | "video"
      defaultValue?: string
    }>
  }
}

export interface ImportedProject {
  format: "premiere" | "afterEffects" | "finalCut"
  originalPath: string
  project: Project
  compatibilityReport: CompatibilityReport
  warnings: string[]
}

export interface CompatibilityReport {
  supportedFeatures: string[]
  limitedFeatures: Array<{ feature: string; note: string }>
  unsupportedFeatures: string[]
  conversionNotes: string[]
}

export interface PremiereProject {
  version: string
  sequences: PremiereSequence[]
  bins: PremiereBin[]
}

export interface PremiereSequence {
  name: string
  frameRate: number
  width: number
  height: number
  tracks: PremiereTrack[]
}

export interface PremiereTrack {
  type: "video" | "audio"
  clips: PremiereClip[]
}

export interface PremiereClip {
  name: string
  start: number
  end: number
  in: number
  out: number
  mediaPath?: string
  effects: any[]
  transitions: any[]
}

export interface PremiereBin {
  name: string
  items: any[]
}

export interface AfterEffectsProject {
  version: string
  compositions: AEComposition[]
  items: AEItem[]
}

export interface AEComposition {
  name: string
  width: number
  height: number
  duration: number
  frameRate: number
  layers: AELayer[]
}

export interface AELayer {
  name: string
  type: string
  startTime: number
  inPoint: number
  outPoint: number
  transform: AETransform
  effects: any[]
  masks: any[]
  expressions: Record<string, string>
}

export interface AETransform {
  position: { value: [number, number, number]; keyframes?: any[] }
  scale: { value: [number, number, number]; keyframes?: any[] }
  rotation: { value: number; keyframes?: any[] }
  opacity: { value: number; keyframes?: any[] }
  anchorPoint: { value: [number, number, number]; keyframes?: any[] }
}

export interface AEItem {
  id: string
  name: string
  type: "footage" | "composition" | "folder"
  source?: string
}

export interface FinalCutProject {
  version: string
  events: FCPEvent[]
  resources: FCPResource[]
}

export interface FCPEvent {
  name: string
  projects: FCPProject[]
}

export interface FCPProject {
  name: string
  format: { width: number; height: number; frameRate: number }
  sequence: FCPSequence
}

export interface FCPSequence {
  duration: string
  clips: FCPClip[]
}

export interface FCPClip {
  name: string
  offset: string
  duration: string
  start: string
  ref: string
  effects?: any[]
  transitions?: any[]
}

export interface FCPResource {
  id: string
  name: string
  src: string
  format?: any
}
