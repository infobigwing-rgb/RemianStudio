import type { ImportedProject, CompatibilityReport, Project } from "./types"
import { PremiereParser } from "./parsers/premiere-parser"
import { AfterEffectsParser } from "./parsers/after-effects-parser"
import { FinalCutParser } from "./parsers/final-cut-parser"
import { AppleMotionParser } from "./parsers/apple-motion-parser"
import { DaVinciResolveParser } from "./parsers/davinci-resolve-parser"

export class FormatImporter {
  async importFile(file: File): Promise<ImportedProject> {
    const content = await file.text()
    const format = this.detectFormat(file.name, content)

    let project: Project
    let warnings: string[] = []

    try {
      switch (format) {
        case "premiere": {
          const parser = new PremiereParser()
          const premiereProject = await parser.parse(content)
          project = parser.convertToProject(premiereProject)
          warnings = this.getPremiereWarnings(premiereProject)
          break
        }

        case "afterEffects": {
          const parser = new AfterEffectsParser()
          const aeProject = await parser.parse(content)
          project = parser.convertToProject(aeProject)
          warnings = this.getAfterEffectsWarnings(aeProject)
          break
        }

        case "finalCut": {
          const parser = new FinalCutParser()
          const fcpProject = await parser.parse(content)
          project = parser.convertToProject(fcpProject)
          warnings = this.getFinalCutWarnings(fcpProject)
          break
        }

        case "appleMotion": {
          const parser = new AppleMotionParser()
          const motionProject = await parser.parse(content)
          project = parser.convertToProject(motionProject)
          warnings = this.getMotionWarnings(motionProject)
          break
        }

        case "davinciResolve": {
          const parser = new DaVinciResolveParser()
          const resolveProject = await parser.parse(content)
          project = parser.convertToProject(resolveProject)
          warnings = this.getResolveWarnings(resolveProject)
          break
        }

        default:
          throw new Error(`Unsupported format: ${format}`)
      }

      const compatibilityReport = this.generateCompatibilityReport(project, format)

      return {
        format,
        originalPath: file.name,
        project,
        compatibilityReport,
        warnings,
      }
    } catch (error) {
      throw new Error(`Failed to import ${format} project: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  private detectFormat(
    filename: string,
    content: string,
  ): "premiere" | "afterEffects" | "finalCut" | "appleMotion" | "davinciResolve" {
    const ext = filename.toLowerCase()

    if (ext.endsWith(".motn")) {
      return "appleMotion"
    }

    if (ext.endsWith(".drp")) {
      return "davinciResolve"
    }

    if (ext.endsWith(".prproj") || ext.endsWith(".xml")) {
      if (content.includes("PremiereData") || content.includes("xmeml")) {
        return "premiere"
      }
    }

    if (ext.endsWith(".aep") || ext.endsWith(".json")) {
      if (content.includes("composition") || content.includes("After Effects")) {
        return "afterEffects"
      }
    }

    if (ext.endsWith(".fcpxml")) {
      return "finalCut"
    }

    // Default detection based on content
    if (content.includes("fcpxml")) return "finalCut"
    if (content.includes("PremiereData")) return "premiere"
    if (content.includes("composition")) return "afterEffects"

    throw new Error("Unable to detect project format")
  }

  private generateCompatibilityReport(project: Project, format: string): CompatibilityReport {
    const supported: string[] = [
      "Basic transforms (position, scale, rotation, opacity)",
      "Keyframe animation with bezier easing",
      "Layer hierarchy and timing",
      "Common transitions (fade, slide, crossfade)",
      "Text layers",
      "Video and audio tracks",
    ]

    const limited: Array<{ feature: string; note: string }> = [
      { feature: "Complex effects", note: "Converted to closest web equivalent" },
      { feature: "3D transforms", note: "Flattened to 2D with perspective" },
      { feature: "Expressions", note: "Converted to keyframes where possible" },
      { feature: "Nested compositions", note: "Flattened to single timeline" },
    ]

    const unsupported: string[] = [
      "Third-party plugin binaries",
      "Real-time 3D rendering",
      "Proprietary codec features",
      "Dynamic link compositions",
    ]

    const notes: string[] = [
      `Imported from ${format} format`,
      "Media files need to be re-linked or uploaded",
      "Some effects may appear different due to web rendering limitations",
      "Preview quality optimized for web performance",
    ]

    return {
      supportedFeatures: supported,
      limitedFeatures: limited,
      unsupportedFeatures: unsupported,
      conversionNotes: notes,
    }
  }

  private getPremiereWarnings(project: any): string[] {
    const warnings: string[] = []

    if (project.sequences.length > 1) {
      warnings.push(`Project contains ${project.sequences.length} sequences. Only the first sequence was imported.`)
    }

    return warnings
  }

  private getAfterEffectsWarnings(project: any): string[] {
    const warnings: string[] = []

    if (project.compositions.length > 1) {
      warnings.push(
        `Project contains ${project.compositions.length} compositions. Only the first composition was imported.`,
      )
    }

    const hasExpressions = project.compositions.some((comp: any) =>
      comp.layers.some((layer: any) => Object.keys(layer.expressions).length > 0),
    )

    if (hasExpressions) {
      warnings.push("Some layers contain expressions. These have been converted to keyframes where possible.")
    }

    return warnings
  }

  private getFinalCutWarnings(project: any): string[] {
    const warnings: string[] = []

    if (project.events.length > 1) {
      warnings.push(`Project contains ${project.events.length} events. Only the first event was imported.`)
    }

    return warnings
  }

  private getMotionWarnings(project: any): string[] {
    const warnings: string[] = []
    if (project.project?.layers?.some((l: any) => l.behaviors?.length > 0)) {
      warnings.push("Motion behaviors have been converted to keyframe animations.")
    }
    return warnings
  }

  private getResolveWarnings(project: any): string[] {
    const warnings: string[] = []
    if (project.timeline?.clips?.some((c: any) => c.grading)) {
      warnings.push("DaVinci Resolve color grading has been converted to web-compatible format.")
    }
    return warnings
  }
}
