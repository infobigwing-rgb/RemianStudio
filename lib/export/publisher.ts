import type { PublishJob, PublishTarget, PublishResult } from "../types/export"

export class Publisher {
  private jobs: Map<string, PublishJob> = new Map()

  async publish(exportId: string, exportUrl: string, targets: PublishTarget[]): Promise<PublishJob> {
    const job: PublishJob = {
      id: `publish-${Date.now()}`,
      exportId,
      targets,
      status: "pending",
      progress: 0,
      results: [],
    }

    this.jobs.set(job.id, job)

    // Start publishing
    this.processPublishJob(job, exportUrl)

    return job
  }

  private async processPublishJob(job: PublishJob, exportUrl: string) {
    job.status = "uploading"
    this.jobs.set(job.id, { ...job })

    const totalTargets = job.targets.length

    for (let i = 0; i < job.targets.length; i++) {
      const target = job.targets[i]

      try {
        console.log(`[v0] Publishing to ${target.platform}...`)

        // Simulate upload
        await new Promise((resolve) => setTimeout(resolve, 2000))

        const result: PublishResult = {
          platform: target.platform,
          status: "success",
          url: `https://${target.platform}.com/video/${Date.now()}`,
        }

        job.results.push(result)
        job.progress = ((i + 1) / totalTargets) * 100
        this.jobs.set(job.id, { ...job })
      } catch (error) {
        const result: PublishResult = {
          platform: target.platform,
          status: "error",
          error: error instanceof Error ? error.message : "Upload failed",
        }

        job.results.push(result)
        this.jobs.set(job.id, { ...job })
      }
    }

    job.status = job.results.every((r) => r.status === "success") ? "complete" : "error"
    this.jobs.set(job.id, { ...job })
  }

  getJob(jobId: string): PublishJob | null {
    return this.jobs.get(jobId) || null
  }
}
