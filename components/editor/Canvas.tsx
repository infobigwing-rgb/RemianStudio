"use client"

import { useEffect, useRef } from "react"
import { useEditorStore } from "@/lib/store"
import type { Layer } from "@/lib/types"

export function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { project, currentTime } = useEditorStore()
  const mediaCache = useRef<Map<string, HTMLImageElement | HTMLVideoElement>>(new Map())

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = "#1a1a1a"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Get active layers at current time
    const activeLayers = project.layers
      .filter((layer) => currentTime >= layer.startTime && currentTime < layer.startTime + layer.duration)
      .sort((a, b) => a.track - b.track)

    // Render each layer
    for (const layer of activeLayers) {
      renderLayer(ctx, layer)
    }
  }, [project.layers, currentTime, project.resolution])

  const renderLayer = (ctx: CanvasRenderingContext2D, layer: Layer) => {
    ctx.save()

    const props = layer.properties

    // Apply transformations
    ctx.globalAlpha = props.opacity
    ctx.translate(props.x + props.width / 2, props.y + props.height / 2)
    ctx.rotate((props.rotation * Math.PI) / 180)
    ctx.scale(props.scale || 1, props.scale || 1)
    ctx.translate(-props.width / 2, -props.height / 2)

    // Render layer content based on type
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
        const layerTime = currentTime - layer.startTime
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
          {project.resolution.width}x{project.resolution.height}
        </div>
      </div>
    </div>
  )
}
