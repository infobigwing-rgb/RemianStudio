import type { FinalCutProject, Project, Layer } from "../types"
import { XMLParser } from "fast-xml-parser"

export class FinalCutParser {
  private parser: XMLParser

  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
    })
  }

  async parse(fileContent: string): Promise<FinalCutProject> {
    const parsed = this.parser.parse(fileContent)
    const fcpxml = parsed.fcpxml

    return {
      version: fcpxml["@_version"] || "1.0",
      events: this.extractEvents(fcpxml),
      resources: this.extractResources(fcpxml.resources),
    }
  }

  private extractEvents(fcpxml: any): any[] {
    const library = fcpxml.library
    if (!library) return []

    const events = library.event || []
    const eventArray = Array.isArray(events) ? events : [events]

    return eventArray.map((event) => ({
      name: event["@_name"] || "Untitled Event",
      projects: this.extractProjects(event.project),
    }))
  }

  private extractProjects(projectData: any): any[] {
    if (!projectData) return []
    const projects = Array.isArray(projectData) ? projectData : [projectData]

    return projects.map((project) => {
      const sequence = project.sequence
      const format = sequence?.["@_format"] || "r1"

      return {
        name: project["@_name"] || "Untitled Project",
        format: this.parseFormat(format),
        sequence: this.extractSequence(sequence),
      }
    })
  }

  private parseFormat(formatRef: string): any {
    // Default HD format
    return {
      width: 1920,
      height: 1080,
      frameRate: 30,
    }
  }

  private extractSequence(sequence: any): any {
    if (!sequence) {
      return { duration: "0s", clips: [] }
    }

    const spine = sequence.spine
    const clips = this.extractClips(spine)

    return {
      duration: sequence["@_duration"] || "30s",
      clips,
    }
  }

  private extractClips(spine: any): any[] {
    if (!spine) return []

    const clips = []
    const children = [
      ...(spine.clip ? (Array.isArray(spine.clip) ? spine.clip : [spine.clip]) : []),
      ...(spine.video ? (Array.isArray(spine.video) ? spine.video : [spine.video]) : []),
      ...(spine.audio ? (Array.isArray(spine.audio) ? spine.audio : [spine.audio]) : []),
      ...(spine.title ? (Array.isArray(spine.title) ? spine.title : [spine.title]) : []),
    ]

    for (const child of children) {
      clips.push({
        name: child["@_name"] || "Untitled Clip",
        offset: child["@_offset"] || "0s",
        duration: child["@_duration"] || "1s",
        start: child["@_start"] || "0s",
        ref: child["@_ref"],
        effects: this.extractEffects(child),
        transitions: this.extractTransitions(child),
      })
    }

    return clips
  }

  private extractEffects(clip: any): any[] {
    const effects = []

    if (clip.filter) {
      const filters = Array.isArray(clip.filter) ? clip.filter : [clip.filter]
      effects.push(
        ...filters.map((f: any) => ({
          type: "filter",
          name: f["@_name"],
          ref: f["@_ref"],
        })),
      )
    }

    return effects
  }

  private extractTransitions(clip: any): any[] {
    const transitions = []

    if (clip.transition) {
      const trans = Array.isArray(clip.transition) ? clip.transition : [clip.transition]
      transitions.push(
        ...trans.map((t: any) => ({
          name: t["@_name"],
          duration: t["@_duration"],
          offset: t["@_offset"],
        })),
      )
    }

    return transitions
  }

  private extractResources(resources: any): any[] {
    if (!resources) return []

    const items = []
    const formats = resources.format || []
    const assets = resources.asset || []

    const formatArray = Array.isArray(formats) ? formats : [formats]
    const assetArray = Array.isArray(assets) ? assets : [assets]

    for (const asset of assetArray) {
      if (!asset) continue

      items.push({
        id: asset["@_id"],
        name: asset["@_name"],
        src: asset["@_src"],
        format: asset["@_format"],
      })
    }

    return items
  }

  convertToProject(fcpProject: FinalCutProject): Project {
    const event = fcpProject.events[0]
    const project = event?.projects[0]

    if (!project) {
      throw new Error("No projects found in Final Cut Pro file")
    }

    const layers: Layer[] = project.sequence.clips.map((clip, index) => ({
      id: `fcp-clip-${index}`,
      type: this.determineClipType(clip),
      name: clip.name,
      startTime: this.parseTimecode(clip.offset),
      duration: this.parseTimecode(clip.duration),
      track: index,
      source: this.resolveResource(clip.ref, fcpProject.resources),
      properties: {
        x: 0,
        y: 0,
        width: project.format.width,
        height: project.format.height,
        opacity: 1,
        rotation: 0,
      },
      effects: clip.effects.map((effect: any, i: number) => ({
        id: `effect-${i}`,
        type: effect.type,
        name: effect.name,
        enabled: true,
        parameters: {},
      })),
      transition: clip.transitions[0]
        ? {
            type: "fade",
            duration: this.parseTimecode(clip.transitions[0].duration),
          }
        : undefined,
    }))

    return {
      id: `fcp-${Date.now()}`,
      name: project.name,
      duration: this.parseTimecode(project.sequence.duration),
      layers,
      resolution: { width: project.format.width, height: project.format.height },
    }
  }

  private determineClipType(clip: any): Layer["type"] {
    // Determine type based on clip properties or resource
    return "video"
  }

  private resolveResource(ref: string, resources: any[]): string | undefined {
    const resource = resources.find((r) => r.id === ref)
    return resource?.src
  }

  private parseTimecode(timecode: string): number {
    if (!timecode) return 0

    // Parse FCP timecode format (e.g., "10s", "5/30s", "1000/30000s")
    if (timecode.endsWith("s")) {
      const value = timecode.slice(0, -1)
      if (value.includes("/")) {
        const [num, den] = value.split("/").map(Number)
        return num / den
      }
      return Number.parseFloat(value)
    }

    return 0
  }
}
