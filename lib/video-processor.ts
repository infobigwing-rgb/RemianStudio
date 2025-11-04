import type { Layer, EditorProject, ExportSettings } from "./types/editor"

export interface ExportProgress {
  progress: number // 0-100
  currentFrame: number
  totalFrames: number
  status: "preparing" | "rendering" | "encoding" | "complete" | "error"
  message: string
}

export class VideoProcessor {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private mediaRecorder: MediaRecorder | null = null
  private chunks: Blob[] = []

  constructor(width: number, height: number) {
    this.canvas = document.createElement("canvas")
    this.canvas.width = width
    this.canvas.height = height
    this.ctx = this.canvas.getContext("2d")!
  }

  async renderFrame(layers: Layer[], time: number): Promise<void> {
    // Clear canvas
    this.ctx.fillStyle = "#000000"
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // Render each layer at the current time
    for (const layer of layers) {
      if (time >= layer.startTime && time < layer.startTime + layer.duration) {
        await this.renderLayer(layer, time)
      }
    }
  }

  private async renderLayer(layer: Layer, time: number): Promise<void> {
    const props = layer.properties

    this.ctx.save()
    this.ctx.globalAlpha = props.opacity || 1

    if (layer.type === "text" && props.text) {
      this.ctx.fillStyle = props.color || "#ffffff"
      this.ctx.font = `${props.fontSize || 32}px ${props.fontFamily || "Arial"}`
      this.ctx.fillText(props.text, props.x || 100, props.y || 100)
    } else if (layer.type === "image" && props.src) {
      // In a real implementation, you would load and cache images
      this.ctx.fillStyle = "#444444"
      this.ctx.fillRect(props.x || 0, props.y || 0, props.width || 200, props.height || 200)
    } else if (layer.type === "video" && props.src) {
      // In a real implementation, you would render video frames
      this.ctx.fillStyle = "#666666"
      this.ctx.fillRect(props.x || 0, props.y || 0, props.width || 400, props.height || 300)
    }

    this.ctx.restore()
  }

  async exportVideo(
    project: EditorProject,
    layers: Layer[],
    settings: ExportSettings,
    onProgress: (progress: ExportProgress) => void,
  ): Promise<Blob> {
    const fps = settings.fps
    const duration = project.duration
    const totalFrames = Math.floor(duration * fps)

    onProgress({
      progress: 0,
      currentFrame: 0,
      totalFrames,
      status: "preparing",
      message: "Preparing export...",
    })

    // Setup canvas stream
    const stream = this.canvas.captureStream(fps)

    // Setup MediaRecorder
    const mimeType = settings.format === "webm" ? "video/webm" : "video/webm"
    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: this.getVideoBitrate(settings.quality),
    })

    this.chunks = []
    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.chunks.push(e.data)
      }
    }

    // Start recording
    this.mediaRecorder.start()

    onProgress({
      progress: 5,
      currentFrame: 0,
      totalFrames,
      status: "rendering",
      message: "Rendering frames...",
    })

    // Render all frames
    for (let frame = 0; frame < totalFrames; frame++) {
      const time = frame / fps
      await this.renderFrame(layers, time)

      // Update progress
      const progress = 5 + Math.floor((frame / totalFrames) * 85)
      onProgress({
        progress,
        currentFrame: frame,
        totalFrames,
        status: "rendering",
        message: `Rendering frame ${frame + 1} of ${totalFrames}...`,
      })

      // Allow UI to update
      await new Promise((resolve) => setTimeout(resolve, 0))
    }

    onProgress({
      progress: 90,
      currentFrame: totalFrames,
      totalFrames,
      status: "encoding",
      message: "Encoding video...",
    })

    // Stop recording and wait for final data
    return new Promise((resolve, reject) => {
      this.mediaRecorder!.onstop = () => {
        const blob = new Blob(this.chunks, { type: mimeType })
        onProgress({
          progress: 100,
          currentFrame: totalFrames,
          totalFrames,
          status: "complete",
          message: "Export complete!",
        })
        resolve(blob)
      }

      this.mediaRecorder!.onerror = (error) => {
        onProgress({
          progress: 0,
          currentFrame: 0,
          totalFrames,
          status: "error",
          message: "Export failed",
        })
        reject(error)
      }

      // Stop after a delay to ensure all frames are captured
      setTimeout(
        () => {
          this.mediaRecorder!.stop()
        },
        duration * 1000 + 500,
      )
    })
  }

  private getVideoBitrate(quality: ExportSettings["quality"]): number {
    switch (quality) {
      case "low":
        return 2_500_000 // 2.5 Mbps
      case "medium":
        return 5_000_000 // 5 Mbps
      case "high":
        return 10_000_000 // 10 Mbps
      default:
        return 5_000_000
    }
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas
  }
}
