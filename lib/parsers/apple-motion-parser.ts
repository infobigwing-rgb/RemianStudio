import type { Project, Layer } from "../types"

export class AppleMotionParser {
  async parse(fileContent: string): Promise<any> {
    // Apple Motion projects (.motn) are binary bundles
    // Parse as JSON export or extract from plist structure
    try {
      // Try parsing as JSON first
      const data = JSON.parse(fileContent)
      return this.parseJSON(data)
    } catch {
      // Motion files need special handling - would require plist parser
      throw new Error("Apple Motion projects require export to JSON format for web import")
    }
  }

  private parseJSON(data: any): any {
    return {
      version: data.version || "Unknown",
      project: {
        name: data.projectName || "Untitled Motion Project",
        width: data.width || 1920,
        height: data.height || 1080,
        frameRate: data.frameRate || 30,
        duration: data.duration || 10,
        layers: this.extractLayers(data.layers || []),
      },
    }
  }

  private extractLayers(layers: any[]): any[] {
    return layers.map((layer) => ({
      name: layer.name,
      type: this.mapLayerType(layer.type),
      startTime: layer.startTime || 0,
      duration: layer.duration || 1,
      opacity: layer.opacity || 1,
      position: layer.position || [0, 0],
      scale: layer.scale || [1, 1],
      rotation: layer.rotation || 0,
      behaviors: layer.behaviors || [],
      particles: layer.particles,
      text: layer.text,
    }))
  }

  private mapLayerType(motionType: string): Layer["type"] {
    const mapping: Record<string, Layer["type"]> = {
      video: "video",
      image: "image",
      text: "text",
      shape: "shape",
      group: "video",
      particle: "video",
      generator: "video",
    }
    return mapping[motionType] || "video"
  }

  convertToProject(motionProject: any): Project {
    const project = motionProject.project

    const layers: Layer[] = project.layers.map((layer: any, index: number) => ({
      id: `motion-layer-${index}`,
      type: layer.type,
      name: layer.name,
      startTime: layer.startTime,
      duration: layer.duration,
      track: index,
      properties: {
        x: layer.position[0],
        y: layer.position[1],
        width: project.width,
        height: project.height,
        opacity: layer.opacity,
        rotation: layer.rotation,
        scale: layer.scale[0],
      },
    }))

    return {
      id: `motion-${Date.now()}`,
      name: project.name,
      duration: project.duration,
      layers,
      resolution: { width: project.width, height: project.height },
    }
  }
}
