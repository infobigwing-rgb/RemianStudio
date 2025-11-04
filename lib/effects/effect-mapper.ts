import type { Effect } from "../types"

export class EffectMapper {
  private static effectDatabase: Record<string, any> = {
    // Premiere Pro effects
    "Lumetri Color": {
      webEquivalent: "colorGrade",
      parameters: {
        exposure: { default: 0, range: [-5, 5] },
        contrast: { default: 0, range: [-100, 100] },
        highlights: { default: 0, range: [-100, 100] },
        shadows: { default: 0, range: [-100, 100] },
        whites: { default: 0, range: [-100, 100] },
        blacks: { default: 0, range: [-100, 100] },
        saturation: { default: 100, range: [0, 200] },
        vibrance: { default: 0, range: [-100, 100] },
      },
    },
    "Gaussian Blur": {
      webEquivalent: "blur",
      parameters: {
        blurriness: { default: 0, range: [0, 100] },
      },
    },
    "Brightness & Contrast": {
      webEquivalent: "brightnessContrast",
      parameters: {
        brightness: { default: 0, range: [-100, 100] },
        contrast: { default: 0, range: [-100, 100] },
      },
    },
    "Hue/Saturation": {
      webEquivalent: "hueSaturation",
      parameters: {
        hue: { default: 0, range: [-180, 180] },
        saturation: { default: 0, range: [-100, 100] },
        lightness: { default: 0, range: [-100, 100] },
      },
    },
    Sharpen: {
      webEquivalent: "sharpen",
      parameters: {
        amount: { default: 0, range: [0, 100] },
      },
    },
    Glow: {
      webEquivalent: "glow",
      parameters: {
        threshold: { default: 75, range: [0, 100] },
        radius: { default: 10, range: [0, 100] },
        intensity: { default: 50, range: [0, 100] },
      },
    },

    // After Effects effects
    "ADBE Gaussian Blur 2": {
      webEquivalent: "blur",
      parameters: {
        blurriness: { default: 0, range: [0, 100] },
      },
    },
    "ADBE Brightness & Contrast 2": {
      webEquivalent: "brightnessContrast",
      parameters: {
        brightness: { default: 0, range: [-100, 100] },
        contrast: { default: 0, range: [-100, 100] },
      },
    },
    "ADBE Glow2": {
      webEquivalent: "glow",
      parameters: {
        threshold: { default: 75, range: [0, 100] },
        radius: { default: 10, range: [0, 100] },
        intensity: { default: 50, range: [0, 100] },
      },
    },
  }

  static mapEffect(nativeName: string, nativeParameters: Record<string, any>): Effect | null {
    const mapping = this.effectDatabase[nativeName]

    if (!mapping) {
      console.warn(`No web equivalent found for effect: ${nativeName}`)
      return null
    }

    const parameters: Record<string, any> = {}

    // Map parameters with defaults
    for (const [key, config] of Object.entries(mapping.parameters)) {
      const nativeValue = nativeParameters[key]
      parameters[key] = nativeValue !== undefined ? nativeValue : (config as any).default
    }

    return {
      id: `effect-${Date.now()}-${Math.random()}`,
      type: mapping.webEquivalent,
      name: nativeName,
      enabled: true,
      parameters,
    }
  }

  static getSupportedEffects(): string[] {
    return Object.keys(this.effectDatabase)
  }

  static getEffectInfo(nativeName: string): any {
    return this.effectDatabase[nativeName]
  }

  static applyEffectToCanvas(ctx: CanvasRenderingContext2D, effect: Effect, width: number, height: number): void {
    switch (effect.type) {
      case "blur":
        ctx.filter = `blur(${effect.parameters.blurriness || 0}px)`
        break

      case "brightnessContrast":
        const brightness = (effect.parameters.brightness || 0) / 100
        const contrast = (effect.parameters.contrast || 0) / 100 + 1
        ctx.filter = `brightness(${1 + brightness}) contrast(${contrast})`
        break

      case "hueSaturation":
        const hue = effect.parameters.hue || 0
        const saturation = (effect.parameters.saturation || 0) / 100 + 1
        ctx.filter = `hue-rotate(${hue}deg) saturate(${saturation})`
        break

      case "glow":
        ctx.shadowBlur = effect.parameters.radius || 10
        ctx.shadowColor = `rgba(255, 255, 255, ${(effect.parameters.intensity || 50) / 100})`
        break

      case "sharpen":
        // Sharpen requires image data manipulation
        break

      default:
        ctx.filter = "none"
    }
  }
}
