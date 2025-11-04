"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Layer, Keyframe } from "@/lib/types"
import { useEditorStore } from "@/lib/store"
import { Plus, Trash2, TrendingUp } from "lucide-react"

interface KeyframeEditorProps {
  layer: Layer | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KeyframeEditor({ layer, open, onOpenChange }: KeyframeEditorProps) {
  const { updateLayer } = useEditorStore()
  const [selectedProperty, setSelectedProperty] = useState<string>("opacity")

  if (!layer) return null

  const keyframes = layer.keyframes || []
  const propertyKeyframes = keyframes.filter((kf) => kf.property === selectedProperty)

  const animatableProperties = [
    { value: "opacity", label: "Opacity" },
    { value: "x", label: "Position X" },
    { value: "y", label: "Position Y" },
    { value: "scale", label: "Scale" },
    { value: "rotation", label: "Rotation" },
  ]

  if (layer.type === "text") {
    animatableProperties.push({ value: "fontSize", label: "Font Size" })
  }

  const handleAddKeyframe = () => {
    const newKeyframe: Keyframe = {
      id: `kf-${Date.now()}`,
      time: 0,
      property: selectedProperty,
      value: layer.properties[selectedProperty as keyof typeof layer.properties] || 1,
      easing: "linear",
    }

    updateLayer(layer.id, {
      keyframes: [...keyframes, newKeyframe],
    })
  }

  const handleUpdateKeyframe = (keyframeId: string, updates: Partial<Keyframe>) => {
    const updatedKeyframes = keyframes.map((kf) => (kf.id === keyframeId ? { ...kf, ...updates } : kf))

    updateLayer(layer.id, {
      keyframes: updatedKeyframes,
    })
  }

  const handleDeleteKeyframe = (keyframeId: string) => {
    updateLayer(layer.id, {
      keyframes: keyframes.filter((kf) => kf.id !== keyframeId),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Keyframe Animation: {layer.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Property Selector */}
          <div className="flex items-center gap-4">
            <Label className="w-24">Property</Label>
            <Select value={selectedProperty} onValueChange={setSelectedProperty}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {animatableProperties.map((prop) => (
                  <SelectItem key={prop.value} value={prop.value}>
                    {prop.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAddKeyframe}>
              <Plus className="size-4 mr-2" />
              Add Keyframe
            </Button>
          </div>

          {/* Keyframes List */}
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {propertyKeyframes.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <TrendingUp className="size-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      No keyframes for {selectedProperty}. Add a keyframe to start animating.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                propertyKeyframes
                  .sort((a, b) => a.time - b.time)
                  .map((keyframe, index) => (
                    <Card key={keyframe.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <Badge variant="outline" className="mt-2">
                            #{index + 1}
                          </Badge>

                          <div className="flex-1 grid grid-cols-3 gap-4">
                            <div>
                              <Label className="text-xs">Time (s)</Label>
                              <Input
                                type="number"
                                step="0.1"
                                value={keyframe.time}
                                onChange={(e) =>
                                  handleUpdateKeyframe(keyframe.id, {
                                    time: Number.parseFloat(e.target.value),
                                  })
                                }
                                className="mt-1"
                              />
                            </div>

                            <div>
                              <Label className="text-xs">Value</Label>
                              <Input
                                type="number"
                                step="0.1"
                                value={keyframe.value}
                                onChange={(e) =>
                                  handleUpdateKeyframe(keyframe.id, {
                                    value: Number.parseFloat(e.target.value),
                                  })
                                }
                                className="mt-1"
                              />
                            </div>

                            <div>
                              <Label className="text-xs">Easing</Label>
                              <Select
                                value={keyframe.easing}
                                onValueChange={(value: any) => handleUpdateKeyframe(keyframe.id, { easing: value })}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="linear">Linear</SelectItem>
                                  <SelectItem value="ease-in">Ease In</SelectItem>
                                  <SelectItem value="ease-out">Ease Out</SelectItem>
                                  <SelectItem value="ease-in-out">Ease In-Out</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteKeyframe(keyframe.id)}
                            className="mt-6"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              )}
            </div>
          </ScrollArea>

          {/* Animation Preview */}
          {propertyKeyframes.length > 0 && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="text-sm">
                  <p className="font-medium mb-2">Animation Summary</p>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• {propertyKeyframes.length} keyframes</li>
                    <li>• Duration: {Math.max(...propertyKeyframes.map((kf) => kf.time)).toFixed(1)}s</li>
                    <li>
                      • Range: {Math.min(...propertyKeyframes.map((kf) => kf.value)).toFixed(2)} →{" "}
                      {Math.max(...propertyKeyframes.map((kf) => kf.value)).toFixed(2)}
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
