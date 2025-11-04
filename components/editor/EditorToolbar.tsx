"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useEditorStore } from "@/lib/store"
import { Play, Pause, SkipBack, SkipForward, Download, Save, Undo, Redo } from "lucide-react"
import { ExportDialog } from "./ExportDialog"

export function EditorToolbar() {
  const { isPlaying, setIsPlaying, currentTime, setCurrentTime, project } = useEditorStore()
  const [exportDialogOpen, setExportDialogOpen] = useState(false)

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleSkipBack = () => {
    setCurrentTime(Math.max(0, currentTime - 5))
  }

  const handleSkipForward = () => {
    setCurrentTime(Math.min(project.duration || 60, currentTime + 5))
  }

  const handleReset = () => {
    setCurrentTime(0)
    setIsPlaying(false)
  }

  return (
    <>
      <div className="h-14 border-b bg-card flex items-center justify-between px-4 gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">Remian Studio</h1>
          <span className="text-sm text-muted-foreground">{project.name || "Untitled"}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon-sm" onClick={handleReset} aria-label="Reset to start">
            <SkipBack className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={handleSkipBack} aria-label="Skip back 5 seconds">
            <SkipBack className="size-4" />
          </Button>
          <Button variant="default" size="icon" onClick={handlePlayPause} aria-label={isPlaying ? "Pause" : "Play"}>
            {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={handleSkipForward} aria-label="Skip forward 5 seconds">
            <SkipForward className="size-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon-sm" aria-label="Undo">
            <Undo className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Redo">
            <Redo className="size-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Save className="size-4" />
            Save
          </Button>
          <Button variant="default" size="sm" onClick={() => setExportDialogOpen(true)}>
            <Download className="size-4" />
            Export
          </Button>
        </div>
      </div>

      <ExportDialog open={exportDialogOpen} onOpenChange={setExportDialogOpen} />
    </>
  )
}
