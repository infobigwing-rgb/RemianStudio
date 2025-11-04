"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ColorGradingEngine } from "@/lib/effects/color-grading"

export function ColorGradingPanel() {
  const [engine] = useState(() => new ColorGradingEngine())
  const controls = engine.getControls()

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-sm">Color Grading</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="wheels" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="wheels">Wheels</TabsTrigger>
            <TabsTrigger value="curves">Curves</TabsTrigger>
            <TabsTrigger value="hsl">HSL</TabsTrigger>
            <TabsTrigger value="lut">LUT</TabsTrigger>
          </TabsList>

          <TabsContent value="wheels" className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium">Lift</label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-xs text-muted-foreground">Red</span>
                  <Slider
                    value={[controls.lift.r]}
                    onValueChange={(v) => engine.updateLift(v[0], controls.lift.g, controls.lift.b)}
                    min={-1}
                    max={1}
                    step={0.01}
                  />
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Green</span>
                  <Slider
                    value={[controls.lift.g]}
                    onValueChange={(v) => engine.updateLift(controls.lift.r, v[0], controls.lift.b)}
                    min={-1}
                    max={1}
                    step={0.01}
                  />
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Blue</span>
                  <Slider
                    value={[controls.lift.b]}
                    onValueChange={(v) => engine.updateLift(controls.lift.r, controls.lift.g, v[0])}
                    min={-1}
                    max={1}
                    step={0.01}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="hsl" className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium">Hue</label>
              <Slider
                value={[controls.hue]}
                onValueChange={(v) => engine.updateHSL(v[0], controls.saturation, controls.lightness)}
                min={-180}
                max={180}
                step={1}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium">Saturation</label>
              <Slider
                value={[controls.saturation]}
                onValueChange={(v) => engine.updateHSL(controls.hue, v[0], controls.lightness)}
                min={0}
                max={2}
                step={0.01}
              />
            </div>
          </TabsContent>

          <TabsContent value="curves">
            <div className="text-xs text-muted-foreground p-4 text-center">Curve editor coming soon</div>
          </TabsContent>

          <TabsContent value="lut">
            <div className="text-xs text-muted-foreground p-4 text-center">LUT import coming soon</div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
