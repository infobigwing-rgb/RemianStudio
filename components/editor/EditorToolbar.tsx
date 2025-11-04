"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useEditorStore } from "@/lib/store/editor-store"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Download,
  Save,
  Undo,
  Redo,
  History,
  MessageSquare,
  Users,
  Upload,
  Keyboard,
} from "lucide-react"
import { ExportDialog } from "./ExportDialog"
import { BatchExportDialog } from "../export/BatchExportDialog"
import { PresenceIndicators } from "../collaboration/PresenceIndicators"
import { VersionHistory } from "../collaboration/VersionHistory"
import { KeyboardShortcutsDialog } from "../accessibility/KeyboardShortcutsDialog"
import { ThemeToggle } from "../accessibility/ThemeToggle"
import type { Presence, User, ProjectVersion } from "@/lib/types/collaboration"

export function EditorToolbar() {
  const { isPlaying, setIsPlaying, currentTime, setCurrentTime, project } = useEditorStore()
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [batchExportOpen, setBatchExportOpen] = useState(false)
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)

  const currentUser: User = {
    id: "user-1",
    name: "You",
    email: "you@example.com",
    color: "#3b82f6",
  }

  const mockPresences: Presence[] = [
    {
      userId: "user-1",
      user: currentUser,
      lastActive: Date.now(),
    },
  ]

  const mockVersions: ProjectVersion[] = []

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleSkipBack = () => {
    setCurrentTime(Math.max(0, currentTime - 5))
  }

  const handleSkipForward = () => {
    setCurrentTime(Math.min(project?.duration || 60, currentTime + 5))
  }

  const handleReset = () => {
    setCurrentTime(0)
    setIsPlaying(false)
  }

  return (
    <>
      <div className="h-14 border-b bg-card flex items-center justify-between px-4 gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">{project?.name || "Untitled"}</h1>
          <PresenceIndicators presences={mockPresences} currentUserId={currentUser.id} />
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
          <Button variant="ghost" size="sm" onClick={() => setVersionHistoryOpen(true)}>
            <History className="size-4" />
            Versions
          </Button>
          <Button variant="ghost" size="sm">
            <MessageSquare className="size-4" />
            Comments
          </Button>
          <Button variant="ghost" size="sm">
            <Users className="size-4" />
            Share
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => setShortcutsOpen(true)} aria-label="Keyboard shortcuts">
            <Keyboard className="size-4" />
          </Button>
          <ThemeToggle />
          <Button variant="ghost" size="sm">
            <Save className="size-4" />
            Save
          </Button>
          <Button variant="outline" size="sm" onClick={() => setBatchExportOpen(true)}>
            <Upload className="size-4" />
            Batch Export
          </Button>
          <Button variant="default" size="sm" onClick={() => setExportDialogOpen(true)}>
            <Download className="size-4" />
            Export
          </Button>
        </div>
      </div>

      <ExportDialog open={exportDialogOpen} onOpenChange={setExportDialogOpen} />
      <BatchExportDialog open={batchExportOpen} onOpenChange={setBatchExportOpen} />
      <VersionHistory
        versions={mockVersions}
        currentVersionId={null}
        open={versionHistoryOpen}
        onOpenChange={setVersionHistoryOpen}
        onCreateVersion={(name, desc) => console.log("[v0] Create version:", name, desc)}
        onRestoreVersion={(id) => console.log("[v0] Restore version:", id)}
        onCompareVersions={(v1, v2) => console.log("[v0] Compare versions:", v1, v2)}
      />
      <KeyboardShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </>
  )
}
