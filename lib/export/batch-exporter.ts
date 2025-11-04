import type { BatchExportJob, PlatformPreset } from "../types/export"
import type { EditorProject, Layer } from "../types/editor"
import { VideoProcessor } from "../video-processor"

export class BatchExporter {
  private jobs: Map<string, BatchExportJob> = new Map()
  private listeners: Set<(jobs: BatchExportJob[]) => void> = new Set()

  async createBatchExport(
    project: EditorProject,
    layers: Layer[],
    presets: PlatformPreset[],
    name: string,
  ): Promise<BatchExportJob> {
    const job: BatchExportJob = {
      id: `batch-${Date.now()}`,
      name,
      presets,
      status: "pending",
      progress: 0,
      outputs: presets.map((preset) => ({
        id: `output-${Date.now()}-${preset.id}`,
        presetId: preset.id,
        presetName: preset.name,
        url: "",
        size: 0,
        duration: project.duration,
        status: "pending",
      })),
      createdAt: new Date(),
    }

    this.jobs.set(job.id, job)
    this.notifyListeners()

    // Start processing
    this.processBatchJob(job, project, layers)

    return job
  }

  private async processBatchJob(job: BatchExportJob, project: EditorProject, layers: Layer[]) {
    job.status = "processing"
    this.jobs.set(job.id, { ...job })
    this.notifyListeners()

    const totalOutputs = job.outputs.length

    for (let i = 0; i < job.outputs.length; i++) {
      const output = job.outputs[i]
      const preset = job.presets.find((p) => p.id === output.presetId)

      if (!preset) continue

      try {
        output.status = "rendering"
        this.jobs.set(job.id, { ...job })
        this.notifyListeners()

        // Get resolution dimensions
        const [width, height] = this.getResolutionDimensions(preset.resolution, preset.aspectRatio)

        // Create video processor
        const processor = new VideoProcessor(width, height)

        // Export video
        const blob = await processor.exportVideo(
          project,
          layers,
          {
            resolution: preset.resolution,
            fps: preset.fps,
            format: preset.format,
            quality: "high",
          },
          (progress) => {
            job.progress = ((i + progress.progress / 100) / totalOutputs) * 100
            this.jobs.set(job.id, { ...job })
            this.notifyListeners()
          },
        )

        // Create download URL
        output.url = URL.createObjectURL(blob)
        output.size = blob.size
        output.status = "complete"

        job.progress = ((i + 1) / totalOutputs) * 100
        this.jobs.set(job.id, { ...job })
        this.notifyListeners()
      } catch (error) {
        output.status = "error"
        output.error = error instanceof Error ? error.message : "Export failed"
        this.jobs.set(job.id, { ...job })
        this.notifyListeners()
      }
    }

    job.status = job.outputs.every((o) => o.status === "complete") ? "complete" : "error"
    this.jobs.set(job.id, { ...job })
    this.notifyListeners()
  }

  private getResolutionDimensions(resolution: string, aspectRatio: string): [number, number] {
    const resolutions: Record<string, Record<string, [number, number]>> = {
      "720p": {
        "16:9": [1280, 720],
        "9:16": [720, 1280],
        "1:1": [720, 720],
        "4:5": [720, 900],
      },
      "1080p": {
        "16:9": [1920, 1080],
        "9:16": [1080, 1920],
        "1:1": [1080, 1080],
        "4:5": [1080, 1350],
      },
      "4k": {
        "16:9": [3840, 2160],
        "9:16": [2160, 3840],
        "1:1": [2160, 2160],
        "4:5": [2160, 2700],
      },
    }

    return resolutions[resolution]?.[aspectRatio] || [1920, 1080]
  }

  getJob(jobId: string): BatchExportJob | null {
    return this.jobs.get(jobId) || null
  }

  getJobs(): BatchExportJob[] {
    return Array.from(this.jobs.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  onJobsChange(callback: (jobs: BatchExportJob[]) => void) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  private notifyListeners() {
    const jobs = this.getJobs()
    this.listeners.forEach((callback) => callback(jobs))
  }
}
