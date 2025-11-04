"use client"

import { useEditorStore } from "@/lib/store"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Layers } from "lucide-react"

export function PropertiesPanel() {
  const { project, selectedLayerId, updateLayer } = useEditorStore()

  const selectedLayer = project.layers.find((l) => l.id === selectedLayerId)

  if (!selectedLayer) {
    return (
      <div className="w-80 border-l border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Properties</h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <Layers className="h-12 w-12 mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Select a layer to edit its properties</p>
        </div>
      </div>
    )
  }

  const updateProperty = (key: string, value: any) => {
    updateLayer(selectedLayer.id, {
      properties: { ...selectedLayer.properties, [key]: value },
    })
  }

  return (
    <div className="w-80 border-l border-border bg-card flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold">Properties</h2>
        <p className="text-xs text-muted-foreground mt-1">{selectedLayer.name}</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Basic Info */}
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Layer Name</Label>
              <Input
                value={selectedLayer.name}
                onChange={(e) => updateLayer(selectedLayer.id, { name: e.target.value })}
                className="mt-1.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Start (s)</Label>
                <Input
                  type="number"
                  value={selectedLayer.startTime}
                  onChange={(e) => updateLayer(selectedLayer.id, { startTime: Number.parseFloat(e.target.value) })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label className="text-xs">Duration (s)</Label>
                <Input
                  type="number"
                  value={selectedLayer.duration}
                  onChange={(e) => updateLayer(selectedLayer.id, { duration: Number.parseFloat(e.target.value) })}
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Transform */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Transform</h3>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">X Position</Label>
                <Input
                  type="number"
                  value={selectedLayer.properties.x}
                  onChange={(e) => updateProperty("x", Number.parseFloat(e.target.value))}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label className="text-xs">Y Position</Label>
                <Input
                  type="number"
                  value={selectedLayer.properties.y}
                  onChange={(e) => updateProperty("y", Number.parseFloat(e.target.value))}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Width</Label>
                <Input
                  type="number"
                  value={selectedLayer.properties.width}
                  onChange={(e) => updateProperty("width", Number.parseFloat(e.target.value))}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label className="text-xs">Height</Label>
                <Input
                  type="number"
                  value={selectedLayer.properties.height}
                  onChange={(e) => updateProperty("height", Number.parseFloat(e.target.value))}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Opacity: {Math.round(selectedLayer.properties.opacity * 100)}%</Label>
              <Slider
                value={[selectedLayer.properties.opacity * 100]}
                onValueChange={([value]) => updateProperty("opacity", value / 100)}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-xs">Rotation: {selectedLayer.properties.rotation}°</Label>
              <Slider
                value={[selectedLayer.properties.rotation]}
                onValueChange={([value]) => updateProperty("rotation", value)}
                min={-180}
                max={180}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-xs">Scale: {((selectedLayer.properties.scale || 1) * 100).toFixed(0)}%</Label>
              <Slider
                value={[(selectedLayer.properties.scale || 1) * 100]}
                onValueChange={([value]) => updateProperty("scale", value / 100)}
                min={10}
                max={300}
                step={1}
                className="mt-2"
              />
            </div>
          </div>

          <Separator />

          {/* Text Properties */}
          {selectedLayer.type === "text" && (
            <>
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Text</h3>

                <div>
                  <Label className="text-xs">Content</Label>
                  <Input
                    value={selectedLayer.content || ""}
                    onChange={(e) => updateLayer(selectedLayer.id, { content: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Transition */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Transition</h3>

            <div>
              <Label className="text-xs">Type</Label>
              <Select
                value={selectedLayer.transition?.type || "none"}
                onValueChange={(value) => {
                  if (value === "none") {
                    updateLayer(selectedLayer.id, { transition: undefined })
                  } else {
                    updateLayer(selectedLayer.id, {
                      transition: { type: value as any, duration: 0.5 },
                    })
                  }
                }}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="fade">Fade</SelectItem>
                  <SelectItem value="slide">Slide</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedLayer.transition && (
              <div>
                <Label className="text-xs">Duration (s)</Label>
                <Input
                  type="number"
                  value={selectedLayer.transition.duration}
                  onChange={(e) =>
                    updateLayer(selectedLayer.id, {
                      transition: {
                        ...selectedLayer.transition!,
                        duration: Number.parseFloat(e.target.value),
                      },
                    })
                  }
                  step={0.1}
                  className="mt-1.5"
                />
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
