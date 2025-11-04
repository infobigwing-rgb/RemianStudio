import type { Project, Layer } from "../types"
import { XMLParser } from "fast-xml-parser"

export class DaVinciResolveParser {
  private parser: XMLParser

  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
    })
  }

  async parse(fileContent: string): Promise<any> {
    // DaVinci Resolve projects (.drp) are zip archives with XML
    // For web import, parse exported XML or JSON representation
    try {
      const parsed = this.parser.parse(fileContent)
      return this.parseXML(parsed)
    } catch {
      throw new Error("DaVinci Resolve project parsing requires project export")
    }
  }

  private parseXML(parsed: any): any {
    const project = parsed.project || parsed.DaVinciResolveProject

    return {
      version: project["@_version"] || "Unknown",
      name: project.name || "Untitled Resolve Project",
      mediaPool: this.extractMediaPool(project.mediaPool),
      timeline: this.extractTimeline(project.timeline),
    }
  }

  private extractMediaPool(pool: any): any[] {
    if (!pool) return []
    const clips = pool.clip || []
    const clipArray = Array.isArray(clips) ? clips : [clips]

    return clipArray.map((clip: any) => ({
      id: clip["@_id"],
      name: clip.name,
      duration: Number.parseFloat(clip.duration || "1"),
      width: Number.parseInt(clip.width || "1920"),
      height: Number.parseInt(clip.height || "1080"),
    }))
  }

  private extractTimeline(timeline: any): any {
    if (!timeline) return { clips: [] }

    const tracks = timeline.track || []
    const trackArray = Array.isArray(tracks) ? tracks : [tracks]

    return {
      name: timeline["@_name"] || "Timeline 1",
      width: timeline["@_width"] || 1920,
      height: timeline["@_height"] || 1080,
      frameRate: timeline["@_frameRate"] || 30,
      duration: timeline["@_duration"] || 30,
      clips: this.extractClips(trackArray),
    }
  }

  private extractClips(tracks: any[]): any[] {
    const clips = []

    for (const track of tracks) {
      if (!track) continue

      const trackClips = track.clip || []
      const clipArray = Array.isArray(trackClips) ? trackClips : [trackClips]

      for (const clip of clipArray) {
        if (!clip) continue

        clips.push({
          name: clip["@_name"] || "Untitled Clip",
          offset: Number.parseFloat(clip["@_offset"] || "0"),
          duration: Number.parseFloat(clip["@_duration"] || "1"),
          mediaId: clip["@_mediaId"],
          effects: this.extractFusionEffects(clip.fusion),
          grading: this.extractColorGrade(clip.colorGrade),
        })
      }
    }

    return clips
  }

  private extractFusionEffects(fusion: any): any[] {
    if (!fusion) return []
    // Fusion compositions would be simplified
    return []
  }

  private extractColorGrade(grade: any): any {
    if (!grade) return null

    return {
      lift: { r: 0, g: 0, b: 0 },
      gamma: { r: 1, g: 1, b: 1 },
      gain: { r: 1, g: 1, b: 1 },
    }
  }

  convertToProject(resolveProject: any): Project {
    const timeline = resolveProject.timeline

    const layers: Layer[] = timeline.clips.map((clip: any, index: number) => ({
      id: `resolve-clip-${index}`,
      type: "video" as const,
      name: clip.name,
      startTime: clip.offset,
      duration: clip.duration,
      track: index,
      properties: {
        x: 0,
        y: 0,
        width: timeline.width,
        height: timeline.height,
        opacity: 1,
        rotation: 0,
      },
    }))

    return {
      id: `resolve-${Date.now()}`,
      name: timeline.name,
      duration: timeline.duration,
      layers,
      resolution: { width: timeline.width, height: timeline.height },
    }
  }
}
