import type { MediaAsset, UploadProgress } from "../types/media"

export class UploadManager {
  private uploads: Map<string, UploadProgress> = new Map()
  private listeners: Set<(uploads: UploadProgress[]) => void> = new Set()

  /**
   * Upload files with progress tracking
   */
  async uploadFiles(files: File[]): Promise<MediaAsset[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file))
    return Promise.all(uploadPromises)
  }

  private async uploadFile(file: File): Promise<MediaAsset> {
    const fileId = `upload-${Date.now()}-${Math.random()}`

    const progress: UploadProgress = {
      fileId,
      fileName: file.name,
      progress: 0,
      status: "uploading",
    }

    this.uploads.set(fileId, progress)
    this.notifyListeners()

    try {
      // Validate file
      this.validateFile(file)

      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        progress.progress = i
        progress.status = i === 100 ? "processing" : "uploading"
        this.uploads.set(fileId, { ...progress })
        this.notifyListeners()
      }

      // Create media asset
      const asset: MediaAsset = {
        id: `asset-${Date.now()}`,
        name: file.name,
        type: this.getMediaType(file.type),
        url: URL.createObjectURL(file),
        size: file.size,
        format: file.type,
        uploadedAt: new Date(),
        tags: [],
      }

      // Generate thumbnail for videos
      if (asset.type === "video") {
        asset.thumbnailUrl = await this.generateVideoThumbnail(file)
        asset.duration = await this.getVideoDuration(file)
      }

      // Generate proxy for large files
      if (file.size > 100 * 1024 * 1024) {
        // > 100MB
        asset.hasProxy = true
        asset.proxyUrl = await this.generateProxy(file)
      }

      progress.status = "complete"
      this.uploads.set(fileId, { ...progress })
      this.notifyListeners()

      // Clean up after delay
      setTimeout(() => {
        this.uploads.delete(fileId)
        this.notifyListeners()
      }, 3000)

      return asset
    } catch (error) {
      progress.status = "error"
      progress.error = error instanceof Error ? error.message : "Upload failed"
      this.uploads.set(fileId, { ...progress })
      this.notifyListeners()
      throw error
    }
  }

  private validateFile(file: File) {
    const maxSize = 2 * 1024 * 1024 * 1024 // 2GB
    if (file.size > maxSize) {
      throw new Error("File size exceeds 2GB limit")
    }

    const allowedTypes = ["video/", "image/", "audio/"]
    if (!allowedTypes.some((type) => file.type.startsWith(type))) {
      throw new Error("Unsupported file type")
    }
  }

  private getMediaType(mimeType: string): MediaAsset["type"] {
    if (mimeType.startsWith("video/")) return "video"
    if (mimeType.startsWith("audio/")) return "audio"
    return "image"
  }

  private async generateVideoThumbnail(file: File): Promise<string> {
    return new Promise((resolve) => {
      const video = document.createElement("video")
      video.preload = "metadata"
      video.src = URL.createObjectURL(file)

      video.onloadedmetadata = () => {
        video.currentTime = 1 // Seek to 1 second

        video.onseeked = () => {
          const canvas = document.createElement("canvas")
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight

          const ctx = canvas.getContext("2d")
          ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)

          canvas.toBlob((blob) => {
            if (blob) {
              resolve(URL.createObjectURL(blob))
            } else {
              resolve("/placeholder.svg")
            }
          })
        }
      }
    })
  }

  private async getVideoDuration(file: File): Promise<number> {
    return new Promise((resolve) => {
      const video = document.createElement("video")
      video.preload = "metadata"
      video.src = URL.createObjectURL(file)

      video.onloadedmetadata = () => {
        resolve(video.duration)
      }
    })
  }

  private async generateProxy(file: File): Promise<string> {
    // In production, this would generate a lower-resolution proxy
    console.log("[v0] Generating proxy for large file:", file.name)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return URL.createObjectURL(file)
  }

  getUploads(): UploadProgress[] {
    return Array.from(this.uploads.values())
  }

  onUploadChange(callback: (uploads: UploadProgress[]) => void) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  private notifyListeners() {
    const uploads = this.getUploads()
    this.listeners.forEach((callback) => callback(uploads))
  }
}
