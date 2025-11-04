import type { Template, Layer, TemplateVariable, TemplateComposition } from "./types/editor"

export class TemplateParser {
  /**
   * Parse an Envato template and extract layer structure
   */
  async parseTemplate(templateData: any): Promise<Template> {
    // In production, this would parse .aep, .prproj, or .mogrt files
    // For now, we'll create a structured template from mock data

    const template: Template = {
      id: templateData.id,
      name: templateData.name,
      thumbnailUrl: templateData.thumbnailUrl,
      previewUrl: templateData.previewUrl,
      author: templateData.author,
      tags: templateData.tags,
      price: templateData.price,
      isPurchased: templateData.isPurchased,
      duration: 10,
      resolution: "1080p",
      fps: 30,
      variables: [],
      layers: [],
    }

    // Extract template variables (placeholders)
    template.variables = this.extractVariables(templateData)

    // Extract layer hierarchy
    template.layers = this.extractLayers(templateData, template.variables)

    // Extract composition structure
    template.composition = this.extractComposition(templateData)

    return template
  }

  private extractVariables(templateData: any): TemplateVariable[] {
    // Mock variable extraction - in production, parse from template metadata
    return [
      {
        id: "var-1",
        name: "Title Text",
        type: "text",
        defaultValue: "Your Title Here",
        placeholder: "[TITLE]",
        layerId: "layer-text-1",
      },
      {
        id: "var-2",
        name: "Subtitle Text",
        type: "text",
        defaultValue: "Your Subtitle",
        placeholder: "[SUBTITLE]",
        layerId: "layer-text-2",
      },
      {
        id: "var-3",
        name: "Logo Image",
        type: "image",
        defaultValue: "",
        placeholder: "[LOGO]",
        layerId: "layer-image-1",
      },
      {
        id: "var-4",
        name: "Background Video",
        type: "video",
        defaultValue: "",
        placeholder: "[BG_VIDEO]",
        layerId: "layer-video-1",
      },
      {
        id: "var-5",
        name: "Brand Color",
        type: "color",
        defaultValue: "#3b82f6",
        placeholder: "[COLOR]",
        layerId: "layer-text-1",
      },
    ]
  }

  private extractLayers(templateData: any, variables: TemplateVariable[]): Layer[] {
    // Mock layer extraction with template variables
    return [
      {
        id: "layer-video-1",
        type: "video",
        name: "Background Video",
        startTime: 0,
        duration: 10,
        track: 0,
        isTemplate: true,
        templateVariableId: "var-4",
        properties: {
          x: 0,
          y: 0,
          width: 1920,
          height: 1080,
          opacity: 0.7,
        },
        keyframes: [
          {
            id: "kf-1",
            time: 0,
            property: "opacity",
            value: 0,
            easing: "ease-in",
          },
          {
            id: "kf-2",
            time: 1,
            property: "opacity",
            value: 0.7,
            easing: "ease-out",
          },
        ],
      },
      {
        id: "layer-image-1",
        type: "image",
        name: "Logo",
        startTime: 1,
        duration: 9,
        track: 1,
        isTemplate: true,
        templateVariableId: "var-3",
        properties: {
          x: 860,
          y: 100,
          width: 200,
          height: 200,
          opacity: 1,
        },
        transitionIn: {
          id: "trans-1",
          type: "zoom",
          duration: 0.5,
          easing: "ease-out",
        },
        keyframes: [
          {
            id: "kf-3",
            time: 1,
            property: "scale",
            value: 0.5,
            easing: "ease-out",
          },
          {
            id: "kf-4",
            time: 1.5,
            property: "scale",
            value: 1,
            easing: "ease-out",
          },
        ],
      },
      {
        id: "layer-text-1",
        type: "text",
        name: "Title",
        startTime: 2,
        duration: 8,
        track: 2,
        isTemplate: true,
        templateVariableId: "var-1",
        properties: {
          x: 960,
          y: 400,
          text: "[TITLE]",
          fontSize: 72,
          fontFamily: "Arial Black",
          color: "[COLOR]",
          opacity: 1,
        },
        transitionIn: {
          id: "trans-2",
          type: "slide",
          duration: 0.8,
          direction: "left",
          easing: "ease-out",
        },
        keyframes: [
          {
            id: "kf-5",
            time: 2,
            property: "x",
            value: 1500,
            easing: "ease-out",
          },
          {
            id: "kf-6",
            time: 2.8,
            property: "x",
            value: 960,
            easing: "ease-out",
          },
        ],
      },
      {
        id: "layer-text-2",
        type: "text",
        name: "Subtitle",
        startTime: 3,
        duration: 7,
        track: 3,
        isTemplate: true,
        templateVariableId: "var-2",
        properties: {
          x: 960,
          y: 500,
          text: "[SUBTITLE]",
          fontSize: 36,
          fontFamily: "Arial",
          color: "#ffffff",
          opacity: 1,
        },
        transitionIn: {
          id: "trans-3",
          type: "crossfade",
          duration: 0.5,
          easing: "ease-in",
        },
      },
    ]
  }

  private extractComposition(templateData: any): TemplateComposition {
    return {
      id: "comp-1",
      name: "Main Composition",
      width: 1920,
      height: 1080,
      duration: 10,
      backgroundColor: "#000000",
    }
  }

  /**
   * Apply template with custom values
   */
  applyTemplate(template: Template, values: Record<string, any>): Layer[] {
    return template.layers.map((layer) => {
      const newLayer = { ...layer }

      // Replace template variables with actual values
      if (layer.templateVariableId) {
        const variable = template.variables.find((v) => v.id === layer.templateVariableId)
        if (variable && values[variable.name]) {
          const value = values[variable.name]

          if (variable.type === "text") {
            newLayer.properties = {
              ...newLayer.properties,
              text: value,
            }
          } else if (variable.type === "image" || variable.type === "video") {
            newLayer.properties = {
              ...newLayer.properties,
              src: value,
            }
          } else if (variable.type === "color") {
            newLayer.properties = {
              ...newLayer.properties,
              color: value,
            }
          }
        }
      }

      // Replace placeholders in text
      if (layer.type === "text" && layer.properties.text) {
        let text = layer.properties.text
        template.variables.forEach((variable) => {
          if (values[variable.name]) {
            text = text.replace(variable.placeholder, values[variable.name])
          }
        })
        newLayer.properties = { ...newLayer.properties, text }
      }

      // Replace color placeholders
      if (layer.properties.color && layer.properties.color.startsWith("[")) {
        const colorVar = template.variables.find((v) => v.placeholder === layer.properties.color)
        if (colorVar && values[colorVar.name]) {
          newLayer.properties = {
            ...newLayer.properties,
            color: values[colorVar.name],
          }
        }
      }

      return newLayer
    })
  }

  /**
   * Get template hierarchy for visualization
   */
  getLayerHierarchy(template: Template): any {
    return {
      name: template.composition?.name || "Root",
      layers: template.layers.map((layer) => ({
        id: layer.id,
        name: layer.name,
        type: layer.type,
        hasKeyframes: (layer.keyframes?.length || 0) > 0,
        hasTransitions: !!(layer.transitionIn || layer.transitionOut),
        isTemplate: layer.isTemplate,
        variable: template.variables.find((v) => v.id === layer.templateVariableId),
      })),
    }
  }
}
