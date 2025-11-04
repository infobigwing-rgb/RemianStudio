"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Template, TemplateVariable } from "@/lib/types/editor"
import { TemplateParser } from "@/lib/template-parser"
import { useEditorStore } from "@/lib/store/editor-store"
import { Upload, Wand2, Layers } from "lucide-react"

interface TemplateCustomizerProps {
  template: Template | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TemplateCustomizer({ template, open, onOpenChange }: TemplateCustomizerProps) {
  const { addLayer } = useEditorStore()
  const [values, setValues] = useState<Record<string, any>>({})
  const [showHierarchy, setShowHierarchy] = useState(false)

  if (!template) return null

  const parser = new TemplateParser()
  const hierarchy = parser.getLayerHierarchy(template)

  const handleValueChange = (variableName: string, value: any) => {
    setValues((prev) => ({ ...prev, [variableName]: value }))
  }

  const handleApplyTemplate = () => {
    const layers = parser.applyTemplate(template, values)
    layers.forEach((layer) => addLayer(layer))
    onOpenChange(false)
  }

  const renderVariableInput = (variable: TemplateVariable) => {
    switch (variable.type) {
      case "text":
        return (
          <Input
            value={values[variable.name] || variable.defaultValue}
            onChange={(e) => handleValueChange(variable.name, e.target.value)}
            placeholder={variable.placeholder}
          />
        )
      case "color":
        return (
          <Input
            type="color"
            value={values[variable.name] || variable.defaultValue}
            onChange={(e) => handleValueChange(variable.name, e.target.value)}
            className="h-10"
          />
        )
      case "image":
      case "video":
        return (
          <div className="flex gap-2">
            <Input
              value={values[variable.name] || ""}
              onChange={(e) => handleValueChange(variable.name, e.target.value)}
              placeholder="Enter URL or upload file"
            />
            <Button variant="outline" size="icon">
              <Upload className="size-4" />
            </Button>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Customize Template: {template.name}</span>
            <Button variant="ghost" size="sm" onClick={() => setShowHierarchy(!showHierarchy)}>
              <Layers className="size-4 mr-2" />
              {showHierarchy ? "Hide" : "Show"} Hierarchy
            </Button>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          {showHierarchy ? (
            <div className="space-y-4 p-4">
              <h3 className="font-semibold">Layer Hierarchy</h3>
              <Card>
                <CardContent className="p-4 space-y-2">
                  <div className="font-medium">{hierarchy.name}</div>
                  <div className="pl-4 space-y-2">
                    {hierarchy.layers.map((layer: any) => (
                      <div key={layer.id} className="flex items-center gap-2 text-sm">
                        <Badge variant="outline">{layer.type}</Badge>
                        <span>{layer.name}</span>
                        {layer.hasKeyframes && <Badge variant="secondary">Animated</Badge>}
                        {layer.hasTransitions && <Badge variant="secondary">Transitions</Badge>}
                        {layer.isTemplate && layer.variable && (
                          <Badge className="bg-blue-500">{layer.variable.placeholder}</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-6 p-4">
              <div>
                <h3 className="font-semibold mb-2">Template Preview</h3>
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <img
                    src={template.previewUrl || template.thumbnailUrl}
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Customize Variables</h3>
                <div className="space-y-4">
                  {template.variables.map((variable) => (
                    <div key={variable.id} className="space-y-2">
                      <Label>
                        {variable.name}
                        <Badge variant="outline" className="ml-2 text-xs">
                          {variable.placeholder}
                        </Badge>
                      </Label>
                      {renderVariableInput(variable)}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <Wand2 className="size-5 text-primary mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium mb-1">Template Features</p>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• {template.layers.length} layers with preserved animations</li>
                      <li>
                        • {template.layers.filter((l) => l.keyframes && l.keyframes.length > 0).length} animated layers
                      </li>
                      <li>
                        • {template.layers.filter((l) => l.transitionIn || l.transitionOut).length} layers with
                        transitions
                      </li>
                      <li>
                        • {template.duration}s duration at {template.fps}fps
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApplyTemplate}>
            <Wand2 className="size-4 mr-2" />
            Apply Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
