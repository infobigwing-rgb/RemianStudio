import type { AfterEffectsProject, Project, Layer, Keyframe } from "../types"

export class AfterEffectsParser {
  async parse(fileContent: string): Promise<AfterEffectsProject> {
    // After Effects projects can be exported as JSON via scripting
    // or we parse the binary .aep format (complex, requires specialized library)

    try {
      // Try parsing as JSON first (from AE script export)
      const data = JSON.parse(fileContent)
      return this.parseJSON(data)
    } catch {
      // If not JSON, would need binary parser
      throw new Error("Binary .aep parsing requires After Effects scripting export to JSON")
    }
  }

  private parseJSON(data: any): AfterEffectsProject {
    return {
      version: data.version || "Unknown",
      compositions: this.extractCompositions(data.items),
      items: this.extractItems(data.items),
    }
  }

  private extractCompositions(items: any[]): any[] {
    return items
      .filter((item) => item.typeName === "Composition")
      .map((comp) => ({
        name: comp.name,
        width: comp.width,
        height: comp.height,
        duration: comp.duration,
        frameRate: comp.frameRate,
        layers: this.extractLayers(comp.layers),
      }))
  }

  private extractLayers(layers: any[]): any[] {
    if (!layers) return []

    return layers.map((layer) => ({
      name: layer.name,
      type: layer.matchName || "AVLayer",
      startTime: layer.startTime,
      inPoint: layer.inPoint,
      outPoint: layer.outPoint,
      transform: this.extractTransform(layer.transform),
      effects: layer.effects || [],
      masks: layer.masks || [],
      expressions: this.extractExpressions(layer),
    }))
  }

  private extractTransform(transform: any): any {
    if (!transform) {
      return {
        position: { value: [0, 0, 0] },
        scale: { value: [100, 100, 100] },
        rotation: { value: 0 },
        opacity: { value: 100 },
        anchorPoint: { value: [0, 0, 0] },
      }
    }

    return {
      position: this.extractProperty(transform.position),
      scale: this.extractProperty(transform.scale),
      rotation: this.extractProperty(transform.rotation),
      opacity: this.extractProperty(transform.opacity),
      anchorPoint: this.extractProperty(transform.anchorPoint),
    }
  }

  private extractProperty(prop: any): any {
    if (!prop) return { value: 0 }

    return {
      value: prop.value,
      keyframes: prop.keyframes || [],
    }
  }

  private extractExpressions(layer: any): Record<string, string> {
    const expressions: Record<string, string> = {}

    if (layer.transform) {
      for (const [key, value] of Object.entries(layer.transform)) {
        if (value && typeof value === "object" && (value as any).expression) {
          expressions[key] = (value as any).expression
        }
      }
    }

    return expressions
  }

  private extractItems(items: any[]): any[] {
    return items.map((item) => ({
      id: item.id,
      name: item.name,
      type: item.typeName === "Footage" ? "footage" : item.typeName === "Composition" ? "composition" : "folder",
      source: item.file?.fsName,
    }))
  }

  convertToProject(aeProject: AfterEffectsProject): Project {
    const comp = aeProject.compositions[0]
    if (!comp) {
      throw new Error("No compositions found in After Effects project")
    }

    const layers: Layer[] = comp.layers.map((aeLayer, index) => {
      const transform = aeLayer.transform
      const position = Array.isArray(transform.position.value) ? transform.position.value : [0, 0]
      const scale = Array.isArray(transform.scale.value) ? transform.scale.value : [100, 100]

      return {
        id: `ae-layer-${index}`,
        type: this.mapLayerType(aeLayer.type),
        name: aeLayer.name,
        startTime: aeLayer.inPoint,
        duration: aeLayer.outPoint - aeLayer.inPoint,
        track: index,
        properties: {
          x: position[0],
          y: position[1],
          width: comp.width,
          height: comp.height,
          opacity: (transform.opacity.value || 100) / 100,
          rotation: transform.rotation.value || 0,
          scale: scale[0] / 100,
          anchorX: transform.anchorPoint.value[0],
          anchorY: transform.anchorPoint.value[1],
        },
        keyframes: this.convertKeyframes(aeLayer.transform),
        effects: aeLayer.effects.map((effect: any, i: number) => ({
          id: `effect-${i}`,
          type: effect.matchName || "custom",
          name: effect.name,
          enabled: effect.enabled !== false,
          parameters: effect.parameters || {},
        })),
      }
    })

    return {
      id: `ae-${Date.now()}`,
      name: comp.name,
      duration: comp.duration,
      layers,
      resolution: { width: comp.width, height: comp.height },
    }
  }

  private mapLayerType(aeType: string): Layer["type"] {
    if (aeType.includes("Text")) return "text"
    if (aeType.includes("Shape")) return "shape"
    if (aeType.includes("Audio")) return "audio"
    return "video"
  }

  private convertKeyframes(transform: any): Keyframe[] {
    const keyframes: Keyframe[] = []

    for (const [property, data] of Object.entries(transform)) {
      if (data && typeof data === "object" && (data as any).keyframes) {
        for (const kf of (data as any).keyframes) {
          keyframes.push({
            property,
            time: kf.time,
            value: kf.value,
            easing: kf.easing || "linear",
            bezierControlPoints: kf.bezier,
          })
        }
      }
    }

    return keyframes
  }
}
