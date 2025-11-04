"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react"
import { FormatImporter } from "@/lib/format-importer"
import { useEditorStore } from "@/lib/store"

interface ImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImportDialog({ open, onOpenChange }: ImportDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [importResult, setImportResult] = useState<any>(null)
  const { setProject } = useEditorStore()

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setError(null)
    setImportResult(null)

    try {
      const importer = new FormatImporter()
      const result = await importer.importFile(file)

      setImportResult(result)
      console.log("[v0] Import successful:", result)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to import file"
      setError(message)
      console.error("[v0] Import error:", message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImportProject = () => {
    if (importResult?.project) {
      setProject(importResult.project)
      onOpenChange(false)
      setImportResult(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Native Project File</DialogTitle>
          <DialogDescription>
            Import Premiere Pro (.prproj), After Effects (.aep), or Final Cut Pro (.fcpxml) files
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Project File</label>
            <Input
              type="file"
              accept=".prproj,.aep,.fcpxml,.xml,.json"
              onChange={handleFileSelect}
              disabled={isLoading}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">
              Supported formats: Premiere Pro (.prproj), After Effects (.aep), Final Cut Pro (.fcpxml)
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Processing your project file...</AlertDescription>
            </Alert>
          )}

          {/* Error State */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Compatibility Report */}
          {importResult && (
            <div className="space-y-3 border rounded-lg p-4 bg-card">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  {importResult.format === "premiere" && "Premiere Pro"}
                  {importResult.format === "afterEffects" && "After Effects"}
                  {importResult.format === "finalCut" && "Final Cut Pro"}
                  {" Project"}
                </h3>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>

              <div className="text-sm space-y-3">
                {/* Supported Features */}
                {importResult.compatibilityReport.supportedFeatures.length > 0 && (
                  <div>
                    <h4 className="font-medium text-green-600 flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Fully Supported
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {importResult.compatibilityReport.supportedFeatures.map((feature: string, i: number) => (
                        <li key={i}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Limited Support */}
                {importResult.compatibilityReport.limitedFeatures.length > 0 && (
                  <div>
                    <h4 className="font-medium text-yellow-600 flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4" />
                      Limited Support
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {importResult.compatibilityReport.limitedFeatures.map((item: any, i: number) => (
                        <li key={i}>
                          <strong>{item.feature}</strong> - {item.note}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Unsupported Features */}
                {importResult.compatibilityReport.unsupportedFeatures.length > 0 && (
                  <div>
                    <h4 className="font-medium text-red-600 flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4" />
                      Not Supported
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {importResult.compatibilityReport.unsupportedFeatures.map((feature: string, i: number) => (
                        <li key={i}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Conversion Notes */}
                {importResult.compatibilityReport.conversionNotes.length > 0 && (
                  <div className="bg-muted p-2 rounded text-xs space-y-1">
                    <h4 className="font-medium">Conversion Notes:</h4>
                    {importResult.compatibilityReport.conversionNotes.map((note: string, i: number) => (
                      <p key={i}>• {note}</p>
                    ))}
                  </div>
                )}

                {/* Warnings */}
                {importResult.warnings.length > 0 && (
                  <div className="bg-yellow-50 dark:bg-yellow-950 p-2 rounded text-xs space-y-1 border border-yellow-200 dark:border-yellow-800">
                    <h4 className="font-medium">Warnings:</h4>
                    {importResult.warnings.map((warning: string, i: number) => (
                      <p key={i}>⚠ {warning}</p>
                    ))}
                  </div>
                )}
              </div>

              {/* Import Project Info */}
              <div className="text-xs text-muted-foreground border-t pt-3">
                <p>
                  Project: <strong>{importResult.project.name}</strong>
                </p>
                <p>
                  Duration: <strong>{importResult.project.duration.toFixed(1)}s</strong>
                </p>
                <p>
                  Layers: <strong>{importResult.project.layers.length}</strong>
                </p>
                <p>
                  Resolution:{" "}
                  <strong>
                    {importResult.project.resolution.width}x{importResult.project.resolution.height}
                  </strong>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Dialog Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleImportProject} disabled={!importResult || isLoading}>
            Import to Timeline
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
