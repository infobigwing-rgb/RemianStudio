"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { ProjectVersion } from "@/lib/types/collaboration"
import { History, GitBranch, RotateCcw, Plus } from "lucide-react"

interface VersionHistoryProps {
  versions: ProjectVersion[]
  currentVersionId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateVersion: (name: string, description?: string) => void
  onRestoreVersion: (versionId: string) => void
  onCompareVersions: (v1: string, v2: string) => void
}

export function VersionHistory({
  versions,
  currentVersionId,
  open,
  onOpenChange,
  onCreateVersion,
  onRestoreVersion,
  onCompareVersions,
}: VersionHistoryProps) {
  const [createMode, setCreateMode] = useState(false)
  const [versionName, setVersionName] = useState("")
  const [versionDescription, setVersionDescription] = useState("")
  const [compareMode, setCompareMode] = useState(false)
  const [selectedVersions, setSelectedVersions] = useState<string[]>([])

  const handleCreateVersion = () => {
    if (versionName.trim()) {
      onCreateVersion(versionName, versionDescription)
      setVersionName("")
      setVersionDescription("")
      setCreateMode(false)
    }
  }

  const handleVersionSelect = (versionId: string) => {
    if (!compareMode) return

    if (selectedVersions.includes(versionId)) {
      setSelectedVersions(selectedVersions.filter((id) => id !== versionId))
    } else if (selectedVersions.length < 2) {
      setSelectedVersions([...selectedVersions, versionId])
    }
  }

  const handleCompare = () => {
    if (selectedVersions.length === 2) {
      onCompareVersions(selectedVersions[0], selectedVersions[1])
      setCompareMode(false)
      setSelectedVersions([])
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="size-5" />
            Version History
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {!createMode && !compareMode && (
              <>
                <Button onClick={() => setCreateMode(true)} className="flex-1">
                  <Plus className="size-4 mr-2" />
                  Save Version
                </Button>
                <Button variant="outline" onClick={() => setCompareMode(true)} className="flex-1">
                  <GitBranch className="size-4 mr-2" />
                  Compare
                </Button>
              </>
            )}

            {createMode && (
              <div className="flex-1 space-y-3">
                <div>
                  <Label>Version Name</Label>
                  <Input
                    value={versionName}
                    onChange={(e) => setVersionName(e.target.value)}
                    placeholder="e.g., Final Cut v1"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Description (optional)</Label>
                  <Textarea
                    value={versionDescription}
                    onChange={(e) => setVersionDescription(e.target.value)}
                    placeholder="What changed in this version?"
                    className="mt-1"
                    rows={2}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateVersion}>Create</Button>
                  <Button variant="outline" onClick={() => setCreateMode(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {compareMode && (
              <div className="flex-1 flex items-center gap-2">
                <Badge variant="secondary">{selectedVersions.length}/2 selected</Badge>
                <Button onClick={handleCompare} disabled={selectedVersions.length !== 2} className="flex-1">
                  Compare Selected
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCompareMode(false)
                    setSelectedVersions([])
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>

          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {versions.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <History className="size-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No versions saved yet</p>
                  </CardContent>
                </Card>
              ) : (
                versions.map((version) => (
                  <Card
                    key={version.id}
                    className={`cursor-pointer transition-colors ${
                      compareMode && selectedVersions.includes(version.id)
                        ? "ring-2 ring-primary"
                        : currentVersionId === version.id
                          ? "border-primary"
                          : ""
                    }`}
                    onClick={() => compareMode && handleVersionSelect(version.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <Avatar className="size-10">
                            <AvatarImage src={version.createdBy.avatar || "/placeholder.svg"} />
                            <AvatarFallback style={{ backgroundColor: version.createdBy.color }}>
                              {version.createdBy.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{version.name}</h3>
                              {currentVersionId === version.id && <Badge variant="secondary">Current</Badge>}
                            </div>
                            {version.description && (
                              <p className="text-sm text-muted-foreground mb-2">{version.description}</p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{version.createdBy.name}</span>
                              <span>•</span>
                              <span>{version.createdAt.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        {!compareMode && currentVersionId !== version.id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              onRestoreVersion(version.id)
                            }}
                          >
                            <RotateCcw className="size-3 mr-1" />
                            Restore
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
