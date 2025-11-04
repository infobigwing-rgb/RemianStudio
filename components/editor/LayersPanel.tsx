"use client"

import { useEditorStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Trash2, Eye, EyeOff, ChevronUp, ChevronDown } from "lucide-react"
import type { Layer } from "@/lib/types"

export function LayersPanel() {
  const { project, selectedLayerId, setSelectedLayer, updateLayer, removeLayer } = useEditorStore()

  const handleMoveLayer = (layerId: string, direction: "up" | "down") => {
    const currentIndex = project.layers.findIndex((l) => l.id === layerId)
    if (currentIndex === -1) return

    const newLayers = [...project.layers]
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1

    if (targetIndex < 0 || targetIndex >= newLayers.length) return
    ;[newLayers[currentIndex], newLayers[targetIndex]] = [newLayers[targetIndex], newLayers[currentIndex]]

    // Update tracks
    newLayers.forEach((layer, index) => {
      layer.track = index
    })
  }

  const toggleLayerVisibility = (layer: Layer) => {
    updateLayer(layer.id, {
      properties: {
        ...layer.properties,
        opacity: layer.properties.opacity > 0 ? 0 : 1,
      },
    })
  }

  const getLayerIcon = (type: Layer["type"]) => {
    const icons = {
      video: "🎬",
      image: "🖼️",
      text: "📝",
      audio: "🎵",
      shape: "⬛",
      adjustment: "🎨",
    }
    return icons[type] || "📄"
  }

  return (
    <div className="h-full w-full flex flex-col bg-card">
      <div className="p-3 border-b border-border">
        <h3 className="text-sm font-semibold">Layers</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{project.layers.length} layers</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {project.layers.length === 0 ? (
            <div className="h-32 flex flex-col items-center justify-center text-center p-4">
              <p className="text-sm text-muted-foreground">No layers yet</p>
              <p className="text-xs text-muted-foreground mt-1">Add templates or media to get started</p>
            </div>
          ) : (
            [...project.layers].reverse().map((layer, reversedIndex) => {
              const actualIndex = project.layers.length - 1 - reversedIndex
              const isVisible = layer.properties.opacity > 0

              return (
                <div
                  key={layer.id}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent transition-colors group",
                    selectedLayerId === layer.id && "bg-accent ring-1 ring-primary",
                  )}
                  onClick={() => setSelectedLayer(layer.id)}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleLayerVisibility(layer)
                    }}
                  >
                    {isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3 opacity-50" />}
                  </Button>

                  <span className="text-sm">{getLayerIcon(layer.type)}</span>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{layer.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {layer.startTime.toFixed(1)}s - {(layer.startTime + layer.duration).toFixed(1)}s
                    </div>
                  </div>

                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      disabled={actualIndex === 0}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMoveLayer(layer.id, "up")
                      }}
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      disabled={actualIndex === project.layers.length - 1}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMoveLayer(layer.id, "down")
                      }}
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeLayer(layer.id)
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
