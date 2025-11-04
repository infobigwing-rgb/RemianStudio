import type { PremiereProject, Project, Layer, Effect } from "../types"
import { XMLParser } from "fast-xml-parser"

export class PremiereParser {
  private parser: XMLParser

  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
    })
  }

  async parse(fileContent: string): Promise<PremiereProject> {
    const parsed = this.parser.parse(fileContent)

    // Navigate Premiere Pro XML structure
    const projectData = parsed.PremiereData || parsed.xmeml

    return {
      version: projectData["@_Version"] || "Unknown",
      sequences: this.extractSequences(projectData),
      bins: this.extractBins(projectData),
    }
  }

  private extractSequences(data: any): any[] {
    const sequences = []
    const seqData = data.Project?.Children?.Sequence || data.sequence || []
    const seqArray = Array.isArray(seqData) ? seqData : [seqData]

    for (const seq of seqArray) {
      if (!seq) continue

      sequences.push({
        name: seq["@_name"] || seq.name || "Untitled Sequence",
        frameRate: Number.parseFloat(seq.rate?.timebase || "30"),
        width: Number.parseInt(seq.media?.video?.format?.samplecharacteristics?.width || "1920"),
        height: Number.parseInt(seq.media?.video?.format?.samplecharacteristics?.height || "1080"),
        tracks: this.extractTracks(seq),
      })
    }

    return sequences
  }

  private extractTracks(sequence: any): any[] {
    const tracks = []
    const videoTracks = sequence.media?.video?.track || []
    const audioTracks = sequence.media?.audio?.track || []

    const vTracks = Array.isArray(videoTracks) ? videoTracks : [videoTracks]
    const aTracks = Array.isArray(audioTracks) ? audioTracks : [audioTracks]

    for (const track of vTracks) {
      if (!track) continue
      tracks.push({
        type: "video" as const,
        clips: this.extractClips(track),
      })
    }

    for (const track of aTracks) {
      if (!track) continue
      tracks.push({
        type: "audio" as const,
        clips: this.extractClips(track),
      })
    }

    return tracks
  }

  private extractClips(track: any): any[] {
    const clips = []
    const clipData = track.clipitem || []
    const clipArray = Array.isArray(clipData) ? clipData : [clipData]

    for (const clip of clipArray) {
      if (!clip) continue

      clips.push({
        name: clip["@_name"] || clip.name || "Untitled Clip",
        start: this.parseTime(clip.start),
        end: this.parseTime(clip.end),
        in: this.parseTime(clip.in),
        out: this.parseTime(clip.out),
        mediaPath: clip.file?.pathurl || clip.file?.["@_id"],
        effects: this.extractEffects(clip.filter),
        transitions: this.extractTransitions(clip),
      })
    }

    return clips
  }

  private extractEffects(filterData: any): any[] {
    if (!filterData) return []
    const filters = Array.isArray(filterData) ? filterData : [filterData]

    return filters.map((filter) => ({
      name: filter.effect?.name || "Unknown Effect",
      enabled: filter.enabled !== "FALSE",
      parameters: this.extractParameters(filter.effect?.parameter),
    }))
  }

  private extractTransitions(clip: any): any[] {
    const transitions = []

    if (clip.transitionIn) {
      transitions.push({
        type: "in",
        effect: clip.transitionIn.effect?.name || "Cross Dissolve",
        duration: this.parseTime(clip.transitionIn.duration),
      })
    }

    if (clip.transitionOut) {
      transitions.push({
        type: "out",
        effect: clip.transitionOut.effect?.name || "Cross Dissolve",
        duration: this.parseTime(clip.transitionOut.duration),
      })
    }

    return transitions
  }

  private extractParameters(params: any): Record<string, any> {
    if (!params) return {}
    const paramArray = Array.isArray(params) ? params : [params]

    const result: Record<string, any> = {}
    for (const param of paramArray) {
      if (param.name && param.value !== undefined) {
        result[param.name] = param.value
      }
    }

    return result
  }

  private extractBins(data: any): any[] {
    // Extract project bins/folders
    return []
  }

  private parseTime(timeStr: any): number {
    if (typeof timeStr === "number") return timeStr
    if (!timeStr) return 0

    // Handle various time formats (frames, seconds, timecode)
    const num = Number.parseFloat(timeStr)
    return isNaN(num) ? 0 : num / 30 // Convert frames to seconds (assuming 30fps)
  }

  convertToProject(premiereProject: PremiereProject): Project {
    const sequence = premiereProject.sequences[0]
    if (!sequence) {
      throw new Error("No sequences found in Premiere project")
    }

    const layers: Layer[] = []
    let trackIndex = 0

    for (const track of sequence.tracks) {
      for (const clip of track.clips) {
        const layer: Layer = {
          id: `${track.type}-${clip.name}-${clip.start}`,
          type: track.type === "video" ? "video" : "audio",
          name: clip.name,
          startTime: clip.start,
          duration: clip.end - clip.start,
          track: trackIndex,
          source: clip.mediaPath,
          properties: {
            x: 0,
            y: 0,
            width: sequence.width,
            height: sequence.height,
            opacity: 1,
            rotation: 0,
          },
          effects: this.convertEffects(clip.effects),
          transition: this.convertTransition(clip.transitions[0]),
        }

        layers.push(layer)
      }
      trackIndex++
    }

    return {
      id: `premiere-${Date.now()}`,
      name: sequence.name,
      duration: Math.max(...layers.map((l) => l.startTime + l.duration), 30),
      layers,
      resolution: { width: sequence.width, height: sequence.height },
    }
  }

  private convertEffects(effects: any[]): Effect[] {
    return effects.map((effect, index) => ({
      id: `effect-${index}`,
      type: this.mapEffectType(effect.name),
      name: effect.name,
      enabled: effect.enabled,
      parameters: effect.parameters,
    }))
  }

  private convertTransition(transition: any): Layer["transition"] | undefined {
    if (!transition) return undefined

    return {
      type: this.mapTransitionType(transition.effect),
      duration: transition.duration,
      easing: "easeInOut",
    }
  }

  private mapEffectType(premiereName: string): string {
    const mapping: Record<string, string> = {
      "Lumetri Color": "colorGrade",
      "Gaussian Blur": "blur",
      "Brightness & Contrast": "brightnessContrast",
      "Hue/Saturation": "hueSaturation",
      Sharpen: "sharpen",
      Glow: "glow",
    }

    return mapping[premiereName] || "custom"
  }

  private mapTransitionType(premiereName: string): Layer["transition"]["type"] {
    const mapping: Record<string, Layer["transition"]["type"]> = {
      "Cross Dissolve": "crossDissolve",
      "Dip to Black": "dipToBlack",
      Wipe: "wipe",
      Slide: "slide",
      Zoom: "zoom",
    }

    return mapping[premiereName] || "fade"
  }
}
