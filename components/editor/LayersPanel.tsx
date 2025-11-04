"use client"

import { useEditorStore } from "@/lib/store/editor-store"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Plus, Trash2, ImageIcon, Type, Video, Music } from "lucide-react"
import type { Layer } from "@/lib/types/editor"

export function LayersPanel() {
  const { layers, selectedLayerId, selectLayer, addLayer, removeLayer } = useEditorStore()

  const handleAddLayer = (type: Layer["type"]) => {
    const newLayer: Layer = {
      id: `layer-${Date.now()}`,
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Layer`,
      startTime: 0,
      duration: 5,
      track: layers.length,
      properties: {
        x: 100,
        y: 100,
        opacity: 1,
        ...(type === "text" && {
          text: "New Text",
          fontSize: 48,
          fontFamily: "Arial",
          color: "#ffffff",
        }),
      },
    }
    addLayer(newLayer)
    selectLayer(newLayer.id)
  }

  const getLayerIcon = (type: Layer["type"]) => {
    switch (type) {
      case "video":
        return <Video className="size-4" />
      case "image":
        return <ImageIcon className="size-4" />
      case "text":
        return <Type className="size-4" />
      case "audio":
        return <Music className="size-4" />
    }
  }

  return (
    <div className="h-full w-full flex flex-col bg-card border-r">
      {/* Header */}
      <div className="h-12 border-b flex items-center justify-between px-4">
        <h2 className="text-sm font-semibold">Layers</h2>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" onClick={() => handleAddLayer("text")} title="Add Text">
            <Type className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => handleAddLayer("image")} title="Add Image">
            <ImageIcon className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => handleAddLayer("video")} title="Add Video">
            <Video className="size-4" />
          </Button>
        </div>
      </div>

      {/* Layers List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {layers.length === 0 ? (
            <div className="h-32 flex flex-col items-center justify-center text-center p-4">
              <p className="text-sm text-muted-foreground mb-2">No layers yet</p>
              <Button size="sm" onClick={() => handleAddLayer("text")}>
                <Plus className="size-4" />
                Add Layer
              </Button>
            </div>
          ) : (
            layers.map((layer) => (
              <div
                key={layer.id}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent transition-colors",
                  selectedLayerId === layer.id && "bg-accent ring-2 ring-primary",
                )}
                onClick={() => selectLayer(layer.id)}
              >
                <div className="text-muted-foreground">{getLayerIcon(layer.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{layer.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {layer.startTime}s - {layer.startTime + layer.duration}s
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeLayer(layer.id)
                  }}
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
