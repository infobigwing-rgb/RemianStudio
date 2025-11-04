import type { Keyframe, Layer } from "./types/editor"

export class AnimationEngine {
  /**
   * Calculate interpolated value at a specific time using keyframes
   */
  interpolateValue(keyframes: Keyframe[], time: number, property: string): any {
    if (!keyframes || keyframes.length === 0) return null

    const relevantKeyframes = keyframes.filter((kf) => kf.property === property).sort((a, b) => a.time - b.time)

    if (relevantKeyframes.length === 0) return null
    if (relevantKeyframes.length === 1) return relevantKeyframes[0].value

    // Find surrounding keyframes
    let beforeKf: Keyframe | null = null
    let afterKf: Keyframe | null = null

    for (let i = 0; i < relevantKeyframes.length; i++) {
      if (relevantKeyframes[i].time <= time) {
        beforeKf = relevantKeyframes[i]
      }
      if (relevantKeyframes[i].time >= time && !afterKf) {
        afterKf = relevantKeyframes[i]
        break
      }
    }

    // Before first keyframe
    if (!beforeKf && afterKf) return afterKf.value

    // After last keyframe
    if (beforeKf && !afterKf) return beforeKf.value

    // Between keyframes - interpolate
    if (beforeKf && afterKf) {
      const progress = (time - beforeKf.time) / (afterKf.time - beforeKf.time)
      const easedProgress = this.applyEasing(progress, afterKf.easing, afterKf.bezierPoints)

      return this.lerp(beforeKf.value, afterKf.value, easedProgress)
    }

    return null
  }

  /**
   * Linear interpolation between two values
   */
  private lerp(start: any, end: any, t: number): any {
    if (typeof start === "number" && typeof end === "number") {
      return start + (end - start) * t
    }
    return t < 0.5 ? start : end
  }

  /**
   * Apply easing function to progress value
   */
  private applyEasing(t: number, easing: Keyframe["easing"], bezierPoints?: [number, number, number, number]): number {
    switch (easing) {
      case "linear":
        return t
      case "ease-in":
        return t * t
      case "ease-out":
        return t * (2 - t)
      case "ease-in-out":
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
      case "bezier":
        if (bezierPoints) {
          return this.cubicBezier(t, bezierPoints[0], bezierPoints[1], bezierPoints[2], bezierPoints[3])
        }
        return t
      default:
        return t
    }
  }

  /**
   * Cubic bezier easing calculation
   */
  private cubicBezier(t: number, p1: number, p2: number, p3: number, p4: number): number {
    const u = 1 - t
    return u * u * u * 0 + 3 * u * u * t * p1 + 3 * u * t * t * p3 + t * t * t * 1
  }

  /**
   * Get all animated properties for a layer at a specific time
   */
  getAnimatedProperties(layer: Layer, time: number): Partial<Layer["properties"]> {
    if (!layer.keyframes || layer.keyframes.length === 0) {
      return {}
    }

    const animatedProps: any = {}
    const properties = new Set(layer.keyframes.map((kf) => kf.property))

    properties.forEach((prop) => {
      const value = this.interpolateValue(layer.keyframes!, time - layer.startTime, prop)
      if (value !== null) {
        animatedProps[prop] = value
      }
    })

    return animatedProps
  }

  /**
   * Apply transition effect to a layer
   */
  applyTransition(
    layer: Layer,
    time: number,
    transitionType: "in" | "out",
  ): { opacity: number; transform: string } | null {
    const transition = transitionType === "in" ? layer.transitionIn : layer.transitionOut
    if (!transition) return null

    const layerTime = time - layer.startTime
    const transitionStart = transitionType === "in" ? 0 : layer.duration - transition.duration
    const transitionEnd = transitionStart + transition.duration

    if (layerTime < transitionStart || layerTime > transitionEnd) return null

    const progress = (layerTime - transitionStart) / transition.duration
    const easedProgress = this.applyEasing(progress, transition.easing)

    return this.calculateTransitionEffect(transition.type, easedProgress, transitionType, transition.direction)
  }

  /**
   * Calculate transition effect values
   */
  private calculateTransitionEffect(
    type: string,
    progress: number,
    transitionType: "in" | "out",
    direction?: string,
  ): { opacity: number; transform: string } {
    const effectProgress = transitionType === "in" ? progress : 1 - progress

    switch (type) {
      case "crossfade":
        return {
          opacity: effectProgress,
          transform: "none",
        }

      case "slide": {
        const distance = 100
        let x = 0
        let y = 0

        if (direction === "left") x = distance * (1 - effectProgress)
        else if (direction === "right") x = -distance * (1 - effectProgress)
        else if (direction === "up") y = distance * (1 - effectProgress)
        else if (direction === "down") y = -distance * (1 - effectProgress)

        return {
          opacity: 1,
          transform: `translate(${x}px, ${y}px)`,
        }
      }

      case "zoom":
        return {
          opacity: effectProgress,
          transform: `scale(${0.5 + effectProgress * 0.5})`,
        }

      case "blur":
        return {
          opacity: 1,
          transform: `blur(${(1 - effectProgress) * 10}px)`,
        }

      default:
        return { opacity: 1, transform: "none" }
    }
  }
}
