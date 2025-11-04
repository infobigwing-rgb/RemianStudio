"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { TransitionLibrary, type Transition } from "@/lib/effects/transitions"
import { useState } from "react"

export function TransitionEditor() {
  const [selectedTransition, setSelectedTransition] = useState<Transition | null>(null)
  const transitions = TransitionLibrary.getTransitions()

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-sm">Transitions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {transitions.map((type) => (
            <Button
              key={type}
              variant={selectedTransition?.type === type ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTransition(TransitionLibrary.createTransition(type))}
              className="text-xs"
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </div>

        {selectedTransition && (
          <div className="space-y-2 pt-2">
            <label className="text-xs font-medium">Duration</label>
            <Slider
              value={[selectedTransition.duration]}
              onValueChange={(v) => setSelectedTransition({ ...selectedTransition, duration: v[0] })}
              min={0.1}
              max={3}
              step={0.1}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
