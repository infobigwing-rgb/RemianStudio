"use client"

import { useRef, useState, useEffect } from "react"
import { useEditorStore } from "@/lib/store/editor-store"
import { cn } from "@/lib/utils"
import { VirtualScroller } from "@/lib/performance/virtualization"

export function VirtualizedTimeline() {
  const { layers, currentTime, project, selectedLayerId, selectLayer } = useEditorStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)

  const duration = project?.duration || 60
  const pixelsPerSecond = 50
  const trackHeight = 60

  // Initialize virtual scroller
  const scroller = new VirtualScroller(trackHeight, layers.length, 3)
  scroller.setScrollTop(scrollTop)
  scroller.setContainerHeight(containerHeight)

  const virtualItems = scroller.getVirtualItems()
  const totalHeight = scroller.getTotalSize()

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const resizeObserver = new ResizeObserver((entries) => {
      setContainerHeight(entries[0].contentRect.height)
    })

    resizeObserver.observe(container)
    return () => resizeObserver.disconnect()
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const frames = Math.floor((seconds % 1) * (project?.fps || 30))
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}:${frames.toString().padStart(2, "0")}`
  }

  return (
    <div className="h-full w-full flex flex-col bg-card border-t">
      <div className="h-12 border-b flex items-center px-4 gap-4">
        <div className="text-sm font-medium">Timeline</div>
        <div className="text-sm text-muted-foreground font-mono">{formatTime(currentTime)}</div>
      </div>

      <div className="h-8 border-b bg-muted/30 relative">
        <div className="absolute inset-0 flex">
          {Array.from({ length: Math.ceil(duration) + 1 }).map((_, i) => (
            <div key={i} className="border-l border-border" style={{ width: `${pixelsPerSecond}px` }}>
              <span className="text-xs text-muted-foreground ml-1">{i}s</span>
            </div>
          ))}
        </div>
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-primary z-10"
          style={{ left: `${currentTime * pixelsPerSecond}px` }}
        >
          <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-primary rounded-sm" />
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-auto"
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
        style={{ minWidth: `${duration * pixelsPerSecond}px` }}
      >
        <div style={{ height: totalHeight, position: "relative" }}>
          {virtualItems.map((virtualItem) => {
            const layer = layers[virtualItem.index]
            if (!layer) return null

            return (
              <div
                key={layer.id}
                className={cn("absolute left-0 right-0 px-2", selectedLayerId === layer.id && "ring-2 ring-primary")}
                style={{
                  top: virtualItem.start,
                  height: virtualItem.size,
                }}
                onClick={() => selectLayer(layer.id)}
              >
                <div className="h-full relative cursor-pointer rounded border bg-card hover:bg-accent/50 transition-colors">
                  <div
                    className="absolute h-full bg-primary/20 border border-primary rounded flex items-center px-2"
                    style={{
                      left: `${layer.startTime * pixelsPerSecond}px`,
                      width: `${layer.duration * pixelsPerSecond}px`,
                    }}
                  >
                    <span className="text-xs font-medium truncate">{layer.name}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
