"use client"

import { useEditorStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Play, Pause, SkipBack } from "lucide-react"
import { Slider } from "@/components/ui/slider"

export function Timeline() {
  const { project, currentTime, isPlaying, setCurrentTime, setIsPlaying, selectedLayerId, setSelectedLayer } =
    useEditorStore()

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    setCurrentTime(0)
    setIsPlaying(false)
  }

  return (
    <div className="h-64 border-t border-border bg-card flex flex-col">
      {/* Playback Controls */}
      <div className="flex items-center gap-2 p-3 border-b border-border">
        <Button size="sm" variant="ghost" onClick={handleReset}>
          <SkipBack className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={handlePlayPause}>
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>

        <div className="flex-1 px-4">
          <Slider
            value={[currentTime]}
            max={project.duration}
            step={0.1}
            onValueChange={([value]) => setCurrentTime(value)}
            className="w-full"
          />
        </div>

        <span className="text-sm text-muted-foreground font-mono">
          {currentTime.toFixed(1)}s / {project.duration}s
        </span>
      </div>

      {/* Timeline Tracks */}
      <div className="flex-1 overflow-auto p-4">
        <div className="relative" style={{ height: `${project.layers.length * 60 + 40}px` }}>
          {/* Time ruler */}
          <div className="absolute top-0 left-0 right-0 h-8 border-b border-border flex">
            {Array.from({ length: Math.ceil(project.duration) + 1 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-24 border-r border-border/50 text-xs text-muted-foreground px-2">
                {i}s
              </div>
            ))}
          </div>

          {/* Layers */}
          <div className="absolute top-8 left-0 right-0">
            {project.layers.map((layer, index) => (
              <div key={layer.id} className="h-12 mb-2 relative" onClick={() => setSelectedLayer(layer.id)}>
                <div
                  className={`absolute h-full rounded border-2 transition-colors cursor-pointer ${
                    selectedLayerId === layer.id
                      ? "bg-primary/20 border-primary"
                      : "bg-secondary border-border hover:border-primary/50"
                  }`}
                  style={{
                    left: `${(layer.startTime / project.duration) * 100}%`,
                    width: `${(layer.duration / project.duration) * 100}%`,
                  }}
                >
                  <div className="px-2 py-1 text-xs truncate">{layer.name}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-primary pointer-events-none"
            style={{ left: `${(currentTime / project.duration) * 100}%` }}
          >
            <div className="absolute -top-1 -left-2 w-4 h-4 bg-primary rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
