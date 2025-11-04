export interface PlatformPreset {
  id: string
  name: string
  platform: "youtube" | "instagram" | "tiktok" | "facebook" | "twitter" | "linkedin" | "custom"
  resolution: "1080p" | "720p" | "4k"
  aspectRatio: "16:9" | "9:16" | "1:1" | "4:5"
  fps: 30 | 60
  maxDuration?: number
  recommendedBitrate: number
  format: "mp4" | "webm" | "mov"
}

export interface BatchExportJob {
  id: string
  name: string
  presets: PlatformPreset[]
  status: "pending" | "processing" | "complete" | "error"
  progress: number
  outputs: ExportOutput[]
  createdAt: Date
}

export interface ExportOutput {
  id: string
  presetId: string
  presetName: string
  url: string
  size: number
  duration: number
  status: "pending" | "rendering" | "complete" | "error"
  error?: string
}

export interface PublishTarget {
  platform: PlatformPreset["platform"]
  connected: boolean
  accountName?: string
  accountId?: string
}

export interface PublishJob {
  id: string
  exportId: string
  targets: PublishTarget[]
  status: "pending" | "uploading" | "complete" | "error"
  progress: number
  results: PublishResult[]
}

export interface PublishResult {
  platform: PlatformPreset["platform"]
  status: "success" | "error"
  url?: string
  error?: string
}
