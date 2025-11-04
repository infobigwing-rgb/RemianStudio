export interface MediaAsset {
  id: string
  name: string
  type: "video" | "image" | "audio"
  url: string
  thumbnailUrl?: string
  size: number
  duration?: number
  width?: number
  height?: number
  format: string
  uploadedAt: Date
  tags: string[]
  folderId?: string
  hasProxy?: boolean
  proxyUrl?: string
}

export interface MediaFolder {
  id: string
  name: string
  parentId?: string
  createdAt: Date
}

export interface UploadProgress {
  fileId: string
  fileName: string
  progress: number
  status: "uploading" | "processing" | "complete" | "error"
  error?: string
}

export interface CloudStorage {
  provider: "google-drive" | "dropbox" | "onedrive"
  connected: boolean
  email?: string
  quota?: {
    used: number
    total: number
  }
}
