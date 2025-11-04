"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RotateCcw, Palette } from "lucide-react"
import type { Layer, Effect } from "@/lib/types"
import { useEditorStore } from "@/lib/store"

interface ColorGradingPanelProps {
  layer: Layer | null
}

export function ColorGradingPanel({ layer }: ColorGradingPanelProps) {
  const { updateLayer } = useEditorStore()

  if (!layer) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Palette className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Select a layer to adjust color grading</p>
        </CardContent>
      </Card>
    )
  }

  const colorGradeEffect = layer.effects?.find((e) => e.type === "colorGrade") || {
    id: "colorGrade",
    type: "colorGrade",
    name: "Color Grading",
    enabled: true,
    parameters: {
      exposure: 0,
      contrast: 0,
      highlights: 0,
      shadows: 0,
      whites: 0,
      blacks: 0,
      saturation: 100,
      vibrance: 0,
      temperature: 0,
      tint: 0,
    },
  }

  const updateColorParameter = (param: string, value: number) => {
    const effects = layer.effects || []
    const existingIndex = effects.findIndex((e) => e.type === "colorGrade")

    const updatedEffect: Effect = {
      ...colorGradeEffect,
      parameters: {
        ...colorGradeEffect.parameters,
        [param]: value,
      },
    }

    const newEffects =
      existingIndex >= 0
        ? effects.map((e, i) => (i === existingIndex ? updatedEffect : e))
        : [...effects, updatedEffect]

    updateLayer(layer.id, { effects: newEffects })
  }

  const resetAll = () => {
    const effects = layer.effects?.filter((e) => e.type !== "colorGrade") || []
    updateLayer(layer.id, { effects })
  }

  const params = colorGradeEffect.parameters

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base">Color Grading</CardTitle>
        <Button variant="ghost" size="sm" onClick={resetAll}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="tone">Tone</TabsTrigger>
            <TabsTrigger value="color">Color</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Exposure</Label>
                <span className="text-xs text-muted-foreground">{params.exposure?.toFixed(1) || 0}</span>
              </div>
              <Slider
                value={[params.exposure || 0]}
                onValueChange={([value]) => updateColorParameter("exposure", value)}
                min={-5}
                max={5}
                step={0.1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Contrast</Label>
                <span className="text-xs text-muted-foreground">{params.contrast?.toFixed(0) || 0}</span>
              </div>
              <Slider
                value={[params.contrast || 0]}
                onValueChange={([value]) => updateColorParameter("contrast", value)}
                min={-100}
                max={100}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Saturation</Label>
                <span className="text-xs text-muted-foreground">{params.saturation?.toFixed(0) || 100}</span>
              </div>
              <Slider
                value={[params.saturation || 100]}
                onValueChange={([value]) => updateColorParameter("saturation", value)}
                min={0}
                max={200}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Vibrance</Label>
                <span className="text-xs text-muted-foreground">{params.vibrance?.toFixed(0) || 0}</span>
              </div>
              <Slider
                value={[params.vibrance || 0]}
                onValueChange={([value]) => updateColorParameter("vibrance", value)}
                min={-100}
                max={100}
                step={1}
              />
            </div>
          </TabsContent>

          <TabsContent value="tone" className="space-y-4 mt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Highlights</Label>
                <span className="text-xs text-muted-foreground">{params.highlights?.toFixed(0) || 0}</span>
              </div>
              <Slider
                value={[params.highlights || 0]}
                onValueChange={([value]) => updateColorParameter("highlights", value)}
                min={-100}
                max={100}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Shadows</Label>
                <span className="text-xs text-muted-foreground">{params.shadows?.toFixed(0) || 0}</span>
              </div>
              <Slider
                value={[params.shadows || 0]}
                onValueChange={([value]) => updateColorParameter("shadows", value)}
                min={-100}
                max={100}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Whites</Label>
                <span className="text-xs text-muted-foreground">{params.whites?.toFixed(0) || 0}</span>
              </div>
              <Slider
                value={[params.whites || 0]}
                onValueChange={([value]) => updateColorParameter("whites", value)}
                min={-100}
                max={100}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Blacks</Label>
                <span className="text-xs text-muted-foreground">{params.blacks?.toFixed(0) || 0}</span>
              </div>
              <Slider
                value={[params.blacks || 0]}
                onValueChange={([value]) => updateColorParameter("blacks", value)}
                min={-100}
                max={100}
                step={1}
              />
            </div>
          </TabsContent>

          <TabsContent value="color" className="space-y-4 mt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Temperature</Label>
                <span className="text-xs text-muted-foreground">{params.temperature?.toFixed(0) || 0}</span>
              </div>
              <Slider
                value={[params.temperature || 0]}
                onValueChange={([value]) => updateColorParameter("temperature", value)}
                min={-100}
                max={100}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Tint</Label>
                <span className="text-xs text-muted-foreground">{params.tint?.toFixed(0) || 0}</span>
              </div>
              <Slider
                value={[params.tint || 0]}
                onValueChange={([value]) => updateColorParameter("tint", value)}
                min={-100}
                max={100}
                step={1}
              />
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Professional color grading controls inspired by Lumetri Color. Adjust exposure, tone, and color
                temperature for cinematic looks.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
