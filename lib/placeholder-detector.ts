import type { Layer } from "./types"

export interface Placeholder {
  id: string
  layerId: string
  name: string
  type: "text" | "image" | "video"
  originalValue?: string
  hint?: string
}

export class PlaceholderDetector {
  detectPlaceholders(layers: Layer[]): Placeholder[] {
    const placeholders: Placeholder[] = []

    layers.forEach((layer, index) => {
      if (layer.type === "text" && layer.content) {
        // Detect text placeholders with common patterns
        const textPlaceholders = this.detectTextPlaceholders(layer)
        placeholders.push(...textPlaceholders)
      }

      if (layer.type === "image" || layer.type === "video") {
        // Detect media placeholders
        if (this.isPlaceholder(layer)) {
          placeholders.push({
            id: `placeholder-${layer.id}`,
            layerId: layer.id,
            name: `Replace ${layer.type}: ${layer.name}`,
            type: layer.type as "image" | "video",
            originalValue: layer.source,
            hint: `Replace this ${layer.type} placeholder with your own content`,
          })
        }
      }
    })

    return placeholders
  }

  private detectTextPlaceholders(layer: Layer): Placeholder[] {
    const placeholders: Placeholder[] = []
    const content = layer.content || ""

    // Common placeholder patterns
    const patterns = [
      { regex: /\[.*?TEXT.*?\]/gi, type: "text", hint: "Click to edit text" },
      { regex: /{{.*?}}/gi, type: "text", hint: "Template variable" },
      { regex: /<.*?>/gi, type: "text", hint: "Click to edit text" },
      { regex: /YOUR.*?(TITLE|TEXT|HEADLINE)/gi, type: "text", hint: "Edit this placeholder" },
    ]

    for (const pattern of patterns) {
      let match
      while ((match = pattern.regex.exec(content)) !== null) {
        placeholders.push({
          id: `text-placeholder-${layer.id}-${placeholders.length}`,
          layerId: layer.id,
          name: `Text: ${match[0]}`,
          type: "text" as const,
          originalValue: match[0],
          hint: pattern.hint,
        })
      }
    }

    return placeholders
  }

  private isPlaceholder(layer: Layer): boolean {
    const source = layer.source || layer.name || ""
    const placeholderIndicators = ["placeholder", "sample", "template", "dummy", "default", "replace", "drop", "drag"]

    return placeholderIndicators.some(
      (indicator) => source.toLowerCase().includes(indicator) || layer.name.toLowerCase().includes(indicator),
    )
  }
}
