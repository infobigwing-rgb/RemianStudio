"use client"

import { useEditorStore } from "@/lib/store/editor-store"
import { useEffect, useRef, useMemo, useCallback } from "react"
import { ZoomIn, ZoomOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnimationEngine } from "@/lib/animation-engine"

export function EditorCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { layers, currentTime, zoom, setZoom, project } = useEditorStore()
  const animationFrameRef = useRef<number>()
  const animationEngine = useMemo(() => new AnimationEngine(), [])

  const visibleLayers = useMemo(() => {
    return layers.filter((layer) => currentTime >= layer.startTime && currentTime < layer.startTime + layer.duration)
  }, [layers, currentTime])

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Render visible layers with animations and transitions
    visibleLayers.forEach((layer) => {
      const animatedProps = animationEngine.getAnimatedProperties(layer, currentTime)
      const props = { ...layer.properties, ...animatedProps }

      const transitionEffect = animationEngine.applyTransition(layer, currentTime, "in")

      ctx.save()
      ctx.globalAlpha = transitionEffect?.opacity ?? props.opacity ?? 1

      if (layer.type === "text" && props.text) {
        ctx.fillStyle = props.color || "#ffffff"
        ctx.font = `${props.fontSize || 32}px ${props.fontFamily || "Arial"}`
        ctx.fillText(props.text, props.x || 100, props.y || 100)
      } else if (layer.type === "image" && props.src) {
        ctx.fillStyle = "#444444"
        ctx.fillRect(props.x || 0, props.y || 0, props.width || 200, props.height || 200)
      }

      ctx.restore()
    })
  }, [visibleLayers, currentTime, animationEngine])

  useEffect(() => {
    const render = () => {
      renderCanvas()
      animationFrameRef.current = requestAnimationFrame(render)
    }

    animationFrameRef.current = requestAnimationFrame(render)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [renderCanvas])

  return (
    <div className="h-full w-full flex flex-col bg-muted/30">
      {/* Canvas Controls */}
      <div className="h-12 border-b bg-card flex items-center justify-between px-4">
        <div className="text-sm text-muted-foreground">
          {project?.resolution} @ {project?.fps}fps
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon-sm" onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}>
            <ZoomOut className="size-4" />
          </Button>
          <span className="text-sm font-medium w-12 text-center">{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" size="icon-sm" onClick={() => setZoom(Math.min(2, zoom + 0.25))}>
            <ZoomIn className="size-4" />
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div
          className="relative bg-black shadow-lg"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "center",
          }}
        >
          <canvas ref={canvasRef} width={1920} height={1080} className="max-w-full h-auto" />
        </div>
      </div>
    </div>
  )
}
