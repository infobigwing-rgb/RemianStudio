"use client"

import { useEffect, useRef, useState } from "react"
import { useEditorStore } from "@/lib/store"
import { WebGLRenderer } from "@/lib/webgl/renderer"
import type { Layer } from "@/lib/types"

export function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const webglRendererRef = useRef<WebGLRenderer | null>(null)
  const { project, currentTime } = useEditorStore()
  const [useWebGL, setUseWebGL] = useState(true)
  const mediaCache = useRef<Map<string, HTMLImageElement | HTMLVideoElement>>(new Map())

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    if (useWebGL && !webglRendererRef.current) {
      const renderer = new WebGLRenderer()
      if (renderer.initialize(canvas)) {
        webglRendererRef.current = renderer
      } else {
        setUseWebGL(false)
      }
    }

    return () => {
      webglRendererRef.current?.dispose()
    }
  }, [useWebGL])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = "#1a1a1a"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const activeLayers = project.layers
      .filter((layer) => currentTime >= layer.startTime && currentTime < layer.startTime + layer.duration)
      .sort((a, b) => a.track - b.track)

    for (const layer of activeLayers) {
      renderLayer(ctx, layer, currentTime)
    }
  }, [project.layers, currentTime, project.resolution])

  const renderLayer = (ctx: CanvasRenderingContext2D, layer: Layer, time: number) => {
    ctx.save()

    const props = calculateAnimatedProperties(layer, time)

    // Apply transformations
    ctx.globalAlpha = props.opacity

    if (layer.blendMode) {
      ctx.globalCompositeOperation = mapBlendMode(layer.blendMode)
    }

    const transitionOpacity = calculateTransitionOpacity(layer, time)
    ctx.globalAlpha *= transitionOpacity

    ctx.translate(props.x + props.width / 2, props.y + props.height / 2)
    ctx.rotate((props.rotation * Math.PI) / 180)
    ctx.scale(props.scale || 1, props.scale || 1)
    ctx.translate(-props.width / 2, -props.height / 2)

    if (layer.effects && layer.effects.length > 0) {
      const filters: string[] = []
      for (const effect of layer.effects) {
        if (!effect.enabled) continue

        switch (effect.type) {
          case "blur":
            filters.push(`blur(${effect.parameters.blurriness || 0}px)`)
            break
          case "brightnessContrast":
            const brightness = 1 + (effect.parameters.brightness || 0) / 100
            const contrast = 1 + (effect.parameters.contrast || 0) / 100
            filters.push(`brightness(${brightness}) contrast(${contrast})`)
            break
          case "hueSaturation":
            const hue = effect.parameters.hue || 0
            const saturation = 1 + (effect.parameters.saturation || 0) / 100
            filters.push(`hue-rotate(${hue}deg) saturate(${saturation})`)
            break
        }
      }
      ctx.filter = filters.join(" ")
    }

    // Render layer content
    if (layer.type === "text" && layer.content) {
      ctx.fillStyle = "#fff"
      ctx.font = `${props.height / 2}px sans-serif`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(layer.content, props.width / 2, props.height / 2)
    } else if (layer.type === "image" && layer.source) {
      const img = loadMedia(layer.source, "image") as HTMLImageElement
      if (img && img.complete) {
        ctx.drawImage(img, 0, 0, props.width, props.height)
      }
    } else if (layer.type === "video" && layer.source) {
      const video = loadMedia(layer.source, "video") as HTMLVideoElement
      if (video && video.readyState >= 2) {
        // Sync video time with layer time
        const layerTime = time - layer.startTime
        if (Math.abs(video.currentTime - layerTime) > 0.1) {
          video.currentTime = layerTime
        }
        ctx.drawImage(video, 0, 0, props.width, props.height)
      }
    } else if (layer.type === "shape") {
      ctx.fillStyle = "#4a9eff"
      ctx.fillRect(0, 0, props.width, props.height)
    }

    ctx.restore()
  }

  const calculateAnimatedProperties = (layer: Layer, time: number) => {
    const props = { ...layer.properties }

    if (layer.keyframes && layer.keyframes.length > 0) {
      for (const keyframe of layer.keyframes) {
        const relativeTime = time - layer.startTime

        // Find surrounding keyframes
        const sortedKeyframes = layer.keyframes
          .filter((kf) => kf.property === keyframe.property)
          .sort((a, b) => a.time - b.time)

        for (let i = 0; i < sortedKeyframes.length - 1; i++) {
          const kf1 = sortedKeyframes[i]
          const kf2 = sortedKeyframes[i + 1]

          if (relativeTime >= kf1.time && relativeTime <= kf2.time) {
            const progress = (relativeTime - kf1.time) / (kf2.time - kf1.time)
            const easedProgress = applyEasing(progress, kf1.easing || "linear", kf1.bezierControlPoints)

            if (typeof kf1.value === "number" && typeof kf2.value === "number") {
              const interpolated = kf1.value + (kf2.value - kf1.value) * easedProgress
              ;(props as any)[kf1.property] = interpolated
            }
          }
        }
      }
    }

    return props
  }

  const calculateTransitionOpacity = (layer: Layer, time: number): number => {
    if (!layer.transition) return 1

    const relativeTime = time - layer.startTime
    const transitionDuration = layer.transition.duration

    switch (layer.transition.type) {
      case "fade":
      case "crossDissolve":
        if (relativeTime < transitionDuration) {
          return relativeTime / transitionDuration
        } else if (relativeTime > layer.duration - transitionDuration) {
          return (layer.duration - relativeTime) / transitionDuration
        }
        break

      case "dipToBlack":
        if (relativeTime < transitionDuration) {
          return Math.pow(relativeTime / transitionDuration, 2)
        } else if (relativeTime > layer.duration - transitionDuration) {
          return Math.pow((layer.duration - relativeTime) / transitionDuration, 2)
        }
        break
    }

    return 1
  }

  const applyEasing = (t: number, easing: string, bezierPoints?: [number, number, number, number]): number => {
    switch (easing) {
      case "linear":
        return t
      case "easeIn":
        return t * t
      case "easeOut":
        return t * (2 - t)
      case "easeInOut":
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
      case "bezier":
        if (bezierPoints) {
          return cubicBezier(t, bezierPoints[0], bezierPoints[1], bezierPoints[2], bezierPoints[3])
        }
        return t
      default:
        return t
    }
  }

  const cubicBezier = (t: number, p1: number, p2: number, p3: number, p4: number): number => {
    const u = 1 - t
    return u * u * u * 0 + 3 * u * u * t * p1 + 3 * u * t * t * p3 + t * t * t * 1
  }

  const mapBlendMode = (mode: string): GlobalCompositeOperation => {
    const mapping: Record<string, GlobalCompositeOperation> = {
      normal: "source-over",
      multiply: "multiply",
      screen: "screen",
      overlay: "overlay",
      darken: "darken",
      lighten: "lighten",
      colorDodge: "color-dodge",
      colorBurn: "color-burn",
      hardLight: "hard-light",
      softLight: "soft-light",
      difference: "difference",
      exclusion: "exclusion",
    }
    return mapping[mode] || "source-over"
  }

  const loadMedia = (src: string, type: "image" | "video"): HTMLImageElement | HTMLVideoElement | null => {
    if (mediaCache.current.has(src)) {
      return mediaCache.current.get(src)!
    }

    if (type === "image") {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.src = src
      mediaCache.current.set(src, img)
      return img
    } else {
      const video = document.createElement("video")
      video.crossOrigin = "anonymous"
      video.src = src
      video.muted = true
      video.load()
      mediaCache.current.set(src, video)
      return video
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-black/50 p-4">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={project.resolution.width}
          height={project.resolution.height}
          className="max-w-full max-h-full border border-border shadow-2xl"
          style={{ maxHeight: "calc(100vh - 300px)" }}
        />
        <div className="absolute top-2 right-2 text-xs bg-black/70 px-2 py-1 rounded">
          {useWebGL ? "WebGL" : "Canvas 2D"} • {project.resolution.width}x{project.resolution.height}
        </div>
      </div>
    </div>
  )
}
