"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import type { PlatformPreset, BatchExportJob } from "@/lib/types/export"
import { PLATFORM_PRESETS } from "@/lib/export/platform-presets"
import { BatchExporter } from "@/lib/export/batch-exporter"
import { useEditorStore } from "@/lib/store/editor-store"
import { Download, Loader2, Check, X } from "lucide-react"

interface BatchExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BatchExportDialog({ open, onOpenChange }: BatchExportDialogProps) {
  const { project, layers } = useEditorStore()
  const [selectedPresets, setSelectedPresets] = useState<string[]>([])
  const [exportName, setExportName] = useState("My Video")
  const [exporting, setExporting] = useState(false)
  const [currentJob, setCurrentJob] = useState<BatchExportJob | null>(null)

  const batchExporter = new BatchExporter()

  const handlePresetToggle = (presetId: string) => {
    setSelectedPresets((prev) => (prev.includes(presetId) ? prev.filter((id) => id !== presetId) : [...prev, presetId]))
  }

  const handleExport = async () => {
    if (!project || selectedPresets.length === 0) return

    setExporting(true)

    const presets = PLATFORM_PRESETS.filter((p) => selectedPresets.includes(p.id))
    const job = await batchExporter.createBatchExport(project, layers, presets, exportName)

    setCurrentJob(job)

    // Poll for updates
    const interval = setInterval(() => {
      const updatedJob = batchExporter.getJob(job.id)
      if (updatedJob) {
        setCurrentJob(updatedJob)
        if (updatedJob.status === "complete" || updatedJob.status === "error") {
          clearInterval(interval)
          setExporting(false)
        }
      }
    }, 500)
  }

  const handleDownloadAll = () => {
    if (!currentJob) return

    currentJob.outputs.forEach((output) => {
      if (output.status === "complete" && output.url) {
        const a = document.createElement("a")
        a.href = output.url
        a.download = `${exportName}-${output.presetName}.mp4`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }
    })
  }

  const platformGroups = PLATFORM_PRESETS.reduce(
    (acc, preset) => {
      if (!acc[preset.platform]) {
        acc[preset.platform] = []
      }
      acc[preset.platform].push(preset)
      return acc
    },
    {} as Record<string, PlatformPreset[]>,
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Batch Export for Multiple Platforms</DialogTitle>
        </DialogHeader>

        {!exporting && !currentJob ? (
          <div className="space-y-4">
            <div>
              <Label>Export Name</Label>
              <Input value={exportName} onChange={(e) => setExportName(e.target.value)} className="mt-1" />
            </div>

            <div>
              <Label>Select Platform Presets</Label>
              <ScrollArea className="h-[400px] mt-2">
                <div className="space-y-4">
                  {Object.entries(platformGroups).map(([platform, presets]) => (
                    <div key={platform}>
                      <h3 className="text-sm font-semibold mb-2 capitalize">{platform}</h3>
                      <div className="space-y-2">
                        {presets.map((preset) => (
                          <Card
                            key={preset.id}
                            className={`cursor-pointer transition-colors ${
                              selectedPresets.includes(preset.id) ? "ring-2 ring-primary" : ""
                            }`}
                            onClick={() => handlePresetToggle(preset.id)}
                          >
                            <CardContent className="p-3 flex items-center gap-3">
                              <Checkbox checked={selectedPresets.includes(preset.id)} />
                              <div className="flex-1">
                                <div className="font-medium text-sm">{preset.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {preset.resolution} • {preset.aspectRatio} • {preset.fps}fps
                                  {preset.maxDuration && ` • Max ${preset.maxDuration}s`}
                                </div>
                              </div>
                              <Badge variant="outline">{preset.format.toUpperCase()}</Badge>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="bg-muted/50 p-3 rounded-lg text-sm">
              <p className="font-medium mb-1">Selected: {selectedPresets.length} presets</p>
              <p className="text-muted-foreground">
                Each preset will be exported separately with optimized settings for its platform.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">{Math.round(currentJob?.progress || 0)}%</span>
              </div>
              <Progress value={currentJob?.progress || 0} />
            </div>

            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {currentJob?.outputs.map((output) => (
                  <Card key={output.id}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{output.presetName}</div>
                          <div className="text-xs text-muted-foreground">
                            {output.status === "pending" && "Waiting..."}
                            {output.status === "rendering" && "Rendering..."}
                            {output.status === "complete" &&
                              `Complete • ${(output.size / (1024 * 1024)).toFixed(1)} MB`}
                            {output.status === "error" && `Error: ${output.error}`}
                          </div>
                        </div>
                        {output.status === "rendering" && <Loader2 className="size-4 animate-spin" />}
                        {output.status === "complete" && <Check className="size-4 text-green-500" />}
                        {output.status === "error" && <X className="size-4 text-destructive" />}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>

            {currentJob?.status === "complete" && (
              <Button onClick={handleDownloadAll} className="w-full">
                <Download className="size-4 mr-2" />
                Download All ({currentJob.outputs.filter((o) => o.status === "complete").length} files)
              </Button>
            )}
          </div>
        )}

        <DialogFooter>
          {!exporting && !currentJob && (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleExport} disabled={selectedPresets.length === 0}>
                Export {selectedPresets.length} Version{selectedPresets.length !== 1 ? "s" : ""}
              </Button>
            </>
          )}
          {currentJob?.status === "complete" && <Button onClick={() => onOpenChange(false)}>Close</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
