"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, FileUp } from "lucide-react"
import { useEditorStore } from "@/lib/store"
import type { Placeholder } from "@/lib/placeholder-detector"

interface PlaceholderReplacementProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  placeholders: Placeholder[]
}

export function PlaceholderReplacement({ open, onOpenChange, placeholders }: PlaceholderReplacementProps) {
  const [selectedPlaceholder, setSelectedPlaceholder] = useState<Placeholder | null>(placeholders[0] || null)
  const [replacementValue, setReplacementValue] = useState<string>("")
  const [replacementFile, setReplacementFile] = useState<File | null>(null)
  const { updateLayerContent } = useEditorStore()

  const handleTextReplacement = () => {
    if (selectedPlaceholder && selectedPlaceholder.type === "text") {
      updateLayerContent(selectedPlaceholder.layerId, replacementValue)
      setReplacementValue("")
    }
  }

  const handleMediaReplacement = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && selectedPlaceholder) {
      setReplacementFile(file)
      // In a real app, upload the file and get a URL
      const fileUrl = URL.createObjectURL(file)
      updateLayerContent(selectedPlaceholder.layerId, fileUrl)
      setReplacementFile(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Replace Template Placeholders</DialogTitle>
          <DialogDescription>
            Found {placeholders.length} placeholder{placeholders.length !== 1 ? "s" : ""} to customize
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          {/* Placeholder List */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Placeholders</h3>
            <div className="border rounded-lg overflow-y-auto max-h-96 space-y-1">
              {placeholders.map((placeholder) => (
                <button
                  key={placeholder.id}
                  onClick={() => setSelectedPlaceholder(placeholder)}
                  className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                    selectedPlaceholder?.id === placeholder.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                >
                  <div className="font-medium">{placeholder.name}</div>
                  <div className="text-xs opacity-70">{placeholder.type}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Replacement Editor */}
          <div className="space-y-4">
            {selectedPlaceholder ? (
              <>
                <div className="bg-muted p-3 rounded-lg">
                  <div className="text-xs font-medium opacity-70 mb-1">Current Value:</div>
                  <div className="text-sm font-mono break-words">{selectedPlaceholder.originalValue}</div>
                  {selectedPlaceholder.hint && (
                    <div className="text-xs text-muted-foreground mt-2 flex gap-2">
                      <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      {selectedPlaceholder.hint}
                    </div>
                  )}
                </div>

                {selectedPlaceholder.type === "text" ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">New Text</label>
                    <Input
                      placeholder="Enter replacement text"
                      value={replacementValue}
                      onChange={(e) => setReplacementValue(e.target.value)}
                    />
                    <Button onClick={handleTextReplacement} className="w-full" size="sm">
                      Apply Text
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Upload {selectedPlaceholder.type}</label>
                    <Input
                      type="file"
                      accept={selectedPlaceholder.type === "image" ? "image/*" : "video/*"}
                      onChange={handleMediaReplacement}
                    />
                    <div className="text-xs text-muted-foreground">
                      <FileUp className="h-3 w-3 inline mr-1" />
                      Drop or click to select
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-muted-foreground py-8">No placeholder selected</div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
