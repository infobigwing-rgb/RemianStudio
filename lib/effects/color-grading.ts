export interface ColorGradingControls {
  // Color wheels
  lift: { r: number; g: number; b: number }
  gamma: { r: number; g: number; b: number }
  gain: { r: number; g: number; b: number }

  // Curves
  redCurve: Array<[number, number]>
  greenCurve: Array<[number, number]>
  blueCurve: Array<[number, number]>

  // HSL
  hue: number
  saturation: number
  lightness: number

  // LUT
  lutIntensity: number
}

export class ColorGradingEngine {
  private controls: ColorGradingControls = {
    lift: { r: 0, g: 0, b: 0 },
    gamma: { r: 1, g: 1, b: 1 },
    gain: { r: 1, g: 1, b: 1 },
    redCurve: [
      [0, 0],
      [1, 1],
    ],
    greenCurve: [
      [0, 0],
      [1, 1],
    ],
    blueCurve: [
      [0, 0],
      [1, 1],
    ],
    hue: 0,
    saturation: 1,
    lightness: 1,
    lutIntensity: 0,
  }

  getControls(): ColorGradingControls {
    return this.controls
  }

  updateLift(r: number, g: number, b: number) {
    this.controls.lift = { r, g, b }
  }

  updateGamma(r: number, g: number, b: number) {
    this.controls.gamma = { r: Math.max(0.1, r), g: Math.max(0.1, g), b: Math.max(0.1, b) }
  }

  updateGain(r: number, g: number, b: number) {
    this.controls.gain = { r, g, b }
  }

  updateCurve(channel: "red" | "green" | "blue", points: Array<[number, number]>) {
    if (channel === "red") this.controls.redCurve = points
    else if (channel === "green") this.controls.greenCurve = points
    else this.controls.blueCurve = points
  }

  updateHSL(hue: number, saturation: number, lightness: number) {
    this.controls.hue = hue
    this.controls.saturation = Math.max(0, saturation)
    this.controls.lightness = Math.max(0, lightness)
  }
}
