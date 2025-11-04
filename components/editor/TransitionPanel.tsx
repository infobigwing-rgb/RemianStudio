"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import type { Layer, Transition } from "@/lib/types/editor"
import { useEditorStore } from "@/lib/store/editor-store"

interface TransitionPanelProps {
  layer: Layer
}

export function TransitionPanel({ layer }: TransitionPanelProps) {
  const { updateLayer } = useEditorStore()

  const handleTransitionUpdate = (type: "in" | "out", updates: Partial<Transition> | null) => {
    const key = type === "in" ? "transitionIn" : "transitionOut"

    if (updates === null) {
      updateLayer(layer.id, { [key]: undefined })
    } else {
      const currentTransition = layer[key]
      updateLayer(layer.id, {
        [key]: currentTransition ? { ...currentTransition, ...updates } : createDefaultTransition(updates),
      })
    }
  }

  const createDefaultTransition = (updates: Partial<Transition>): Transition => ({
    id: `trans-${Date.now()}`,
    type: "crossfade",
    duration: 0.5,
    easing: "ease-out",
    ...updates,
  })

  return (
    <div className="space-y-4">
      {/* Transition In */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Transition In</CardTitle>
            <Switch
              checked={!!layer.transitionIn}
              onCheckedChange={(checked) => {
                if (checked) {
                  handleTransitionUpdate("in", {})
                } else {
                  handleTransitionUpdate("in", null)
                }
              }}
            />
          </div>
        </CardHeader>
        {layer.transitionIn && (
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">Type</Label>
              <Select
                value={layer.transitionIn.type}
                onValueChange={(value: any) => handleTransitionUpdate("in", { type: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="crossfade">Crossfade</SelectItem>
                  <SelectItem value="wipe">Wipe</SelectItem>
                  <SelectItem value="slide">Slide</SelectItem>
                  <SelectItem value="push">Push</SelectItem>
                  <SelectItem value="zoom">Zoom</SelectItem>
                  <SelectItem value="blur">Blur</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(layer.transitionIn.type === "slide" || layer.transitionIn.type === "wipe") && (
              <div>
                <Label className="text-xs">Direction</Label>
                <Select
                  value={layer.transitionIn.direction || "left"}
                  onValueChange={(value: any) => handleTransitionUpdate("in", { direction: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                    <SelectItem value="up">Up</SelectItem>
                    <SelectItem value="down">Down</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label className="text-xs">Duration (s)</Label>
              <Input
                type="number"
                step="0.1"
                value={layer.transitionIn.duration}
                onChange={(e) => handleTransitionUpdate("in", { duration: Number.parseFloat(e.target.value) })}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">Easing</Label>
              <Select
                value={layer.transitionIn.easing}
                onValueChange={(value: any) => handleTransitionUpdate("in", { easing: value })}
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
          </CardContent>
        )}
      </Card>

      {/* Transition Out */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Transition Out</CardTitle>
            <Switch
              checked={!!layer.transitionOut}
              onCheckedChange={(checked) => {
                if (checked) {
                  handleTransitionUpdate("out", {})
                } else {
                  handleTransitionUpdate("out", null)
                }
              }}
            />
          </div>
        </CardHeader>
        {layer.transitionOut && (
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">Type</Label>
              <Select
                value={layer.transitionOut.type}
                onValueChange={(value: any) => handleTransitionUpdate("out", { type: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="crossfade">Crossfade</SelectItem>
                  <SelectItem value="wipe">Wipe</SelectItem>
                  <SelectItem value="slide">Slide</SelectItem>
                  <SelectItem value="push">Push</SelectItem>
                  <SelectItem value="zoom">Zoom</SelectItem>
                  <SelectItem value="blur">Blur</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(layer.transitionOut.type === "slide" || layer.transitionOut.type === "wipe") && (
              <div>
                <Label className="text-xs">Direction</Label>
                <Select
                  value={layer.transitionOut.direction || "left"}
                  onValueChange={(value: any) => handleTransitionUpdate("out", { direction: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                    <SelectItem value="up">Up</SelectItem>
                    <SelectItem value="down">Down</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label className="text-xs">Duration (s)</Label>
              <Input
                type="number"
                step="0.1"
                value={layer.transitionOut.duration}
                onChange={(e) => handleTransitionUpdate("out", { duration: Number.parseFloat(e.target.value) })}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">Easing</Label>
              <Select
                value={layer.transitionOut.easing}
                onValueChange={(value: any) => handleTransitionUpdate("out", { easing: value })}
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
          </CardContent>
        )}
      </Card>
    </div>
  )
}
