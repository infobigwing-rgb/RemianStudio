"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Upload, FileVideo, AlertTriangle, CheckCircle2, XCircle } from "lucide-react"
import { FormatImporter } from "@/lib/format-importer"
import { useEditorStore } from "@/lib/store"
import type { ImportedProject } from "@/lib/types"

interface ImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImportDialog({ open, onOpenChange }: ImportDialogProps) {
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [importResult, setImportResult] = useState<ImportedProject | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { setProject } = useEditorStore()

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    setProgress(0)
    setError(null)
    setImportResult(null)

    try {
      const importer = new FormatImporter()

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const result = await importer.importFile(file)

      clearInterval(progressInterval)
      setProgress(100)
      setImportResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import file")
    } finally {
      setImporting(false)
    }
  }, [])

  const handleApplyImport = () => {
    if (importResult) {
      setProject(importResult.project)
      onOpenChange(false)
      setImportResult(null)
    }
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file) {
        const input = document.createElement("input")
        input.type = "file"
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)
        input.files = dataTransfer.files
        handleFileSelect({ target: input } as any)
      }
    },
    [handleFileSelect],
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Import Professional Project</DialogTitle>
          <DialogDescription>
            Import projects from Premiere Pro (.prproj, .xml), After Effects (.aep, .json), or Final Cut Pro (.fcpxml)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!importing && !importResult && !error && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop your project file here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">Supported: .prproj, .xml, .aep, .json, .fcpxml</p>
              <input
                id="file-input"
                type="file"
                accept=".prproj,.xml,.aep,.json,.fcpxml"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {importing && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <FileVideo className="h-5 w-5 animate-pulse" />
                <span className="text-sm">Importing project...</span>
              </div>
              <Progress value={progress} />
              <p className="text-xs text-muted-foreground">Parsing project structure and converting effects...</p>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {importResult && (
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    Successfully imported {importResult.format} project: <strong>{importResult.project.name}</strong>
                  </AlertDescription>
                </Alert>

                {importResult.warnings.length > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        {importResult.warnings.map((warning, i) => (
                          <p key={i} className="text-sm">
                            {warning}
                          </p>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Compatibility Report</h4>

                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">✓ Supported Features</p>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      {importResult.compatibilityReport.supportedFeatures.map((feature, i) => (
                        <li key={i}>• {feature}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-2">⚠ Limited Support</p>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      {importResult.compatibilityReport.limitedFeatures.map((item, i) => (
                        <li key={i}>
                          • {item.feature}: <span className="italic">{item.note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">✗ Not Supported</p>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      {importResult.compatibilityReport.unsupportedFeatures.map((feature, i) => (
                        <li key={i}>• {feature}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground space-y-1">
                      {importResult.compatibilityReport.conversionNotes.map((note, i) => (
                        <p key={i}>• {note}</p>
                      ))}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleApplyImport} className="flex-1">
                    Apply Import
                  </Button>
                  <Button variant="outline" onClick={() => setImportResult(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
