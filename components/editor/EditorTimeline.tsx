"use client"

import { useEditorStore } from "@/lib/store/editor-store"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export function EditorTimeline() {
  const { layers, currentTime, setCurrentTime, project, selectedLayerId, selectLayer } = useEditorStore()

  const duration = project?.duration || 60
  const pixelsPerSecond = 50

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const frames = Math.floor((seconds % 1) * (project?.fps || 30))
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}:${frames.toString().padStart(2, "0")}`
  }

  return (
    <div className="h-full w-full flex flex-col bg-card border-t">
      {/* Timeline Header */}
      <div className="h-12 border-b flex items-center px-4 gap-4">
        <div className="text-sm font-medium">Timeline</div>
        <div className="text-sm text-muted-foreground font-mono">{formatTime(currentTime)}</div>
      </div>

      {/* Timeline Ruler */}
      <div className="h-8 border-b bg-muted/30 relative">
        <div className="absolute inset-0 flex">
          {Array.from({ length: Math.ceil(duration) + 1 }).map((_, i) => (
            <div key={i} className="border-l border-border" style={{ width: `${pixelsPerSecond}px` }}>
              <span className="text-xs text-muted-foreground ml-1">{i}s</span>
            </div>
          ))}
        </div>
        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-primary z-10"
          style={{ left: `${currentTime * pixelsPerSecond}px` }}
        >
          <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-primary rounded-sm" />
        </div>
      </div>

      {/* Timeline Tracks */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1" style={{ minWidth: `${duration * pixelsPerSecond}px` }}>
          {layers.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-sm text-muted-foreground">
              No layers yet. Add a layer to get started.
            </div>
          ) : (
            layers.map((layer) => (
              <div
                key={layer.id}
                className={cn(
                  "h-12 relative cursor-pointer rounded border bg-card hover:bg-accent/50 transition-colors",
                  selectedLayerId === layer.id && "ring-2 ring-primary",
                )}
                onClick={() => selectLayer(layer.id)}
              >
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
            ))
          )}
        </div>
      </ScrollArea>

      {/* Timeline Scrubber */}
      <div className="h-12 border-t bg-card px-4 flex items-center">
        <Slider
          value={[currentTime]}
          onValueChange={([value]) => setCurrentTime(value)}
          max={duration}
          step={0.01}
          className="flex-1"
        />
      </div>
    </div>
  )
}
