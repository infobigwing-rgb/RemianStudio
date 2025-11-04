export type TransitionType =
  | "fade"
  | "slide"
  | "wipe"
  | "dissolve"
  | "blur"
  | "zoom"
  | "cross-dissolve"
  | "dip-black"
  | "push"
  | "morph"

export interface Transition {
  type: TransitionType
  duration: number
  direction: "left" | "right" | "up" | "down" | "in" | "out"
  easing: "linear" | "ease-in" | "ease-out" | "ease-in-out"
}

export class TransitionLibrary {
  static createTransition(type: TransitionType, duration = 0.5): Transition {
    return {
      type,
      duration,
      direction: "left",
      easing: "ease-in-out",
    }
  }

  static getTransitions(): TransitionType[] {
    return ["fade", "slide", "wipe", "dissolve", "blur", "zoom", "cross-dissolve", "dip-black", "push", "morph"]
  }
}
