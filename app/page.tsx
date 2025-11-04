"use client"

import { Canvas } from "@/components/editor/Canvas"
import { Timeline } from "@/components/editor/Timeline"
import { EnvatoPanel } from "@/components/editor/EnvatoPanel"
import { PropertiesPanel } from "@/components/editor/PropertiesPanel"
import { MediaLibrary } from "@/components/editor/MediaLibrary"
import { ExportDialog } from "@/components/editor/ExportDialog"
import { ImportDialog } from "@/components/import/ImportDialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Save, Upload, Sparkles } from "lucide-react"
import { useEditorStore } from "@/lib/store"
import { useState } from "react"

export default function EditorPage() {
  const { project, addLayer } = useEditorStore()
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)

  const handleAddTextLayer = () => {
    addLayer({
      id: `text-${Date.now()}`,
      type: "text",
      name: "Text Layer",
      startTime: 0,
      duration: 5,
      track: project.layers.length,
      content: "Edit Me",
      properties: {
        x: 100,
        y: 100,
        width: 400,
        height: 100,
        opacity: 1,
        rotation: 0,
      },
    })
  }

  const handleExport = () => {
    setExportDialogOpen(true)
  }

  const handleImport = () => {
    setImportDialogOpen(true)
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Toolbar */}
      <div className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Remian Studio
            </h1>
          </div>
          <span className="text-sm text-muted-foreground">{project.name}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleImport}>
            <Upload className="h-4 w-4 mr-2" />
            Import Project
          </Button>
          <Button variant="outline" size="sm" onClick={handleAddTextLayer}>
            Add Text
          </Button>
          <Button variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Editor Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Tabs defaultValue="envato" className="w-80 border-r border-border bg-card flex flex-col">
          <TabsList className="w-full rounded-none border-b border-border">
            <TabsTrigger value="envato" className="flex-1">
              Templates
            </TabsTrigger>
            <TabsTrigger value="media" className="flex-1">
              Media
            </TabsTrigger>
          </TabsList>

          <TabsContent value="envato" className="flex-1 m-0 overflow-hidden">
            <EnvatoPanel />
          </TabsContent>

          <TabsContent value="media" className="flex-1 m-0 overflow-hidden">
            <MediaLibrary />
          </TabsContent>
        </Tabs>

        {/* Center - Canvas & Timeline */}
        <div className="flex-1 flex flex-col">
          <Canvas />
          <Timeline />
        </div>

        {/* Right Sidebar - Properties */}
        <PropertiesPanel />
      </div>

      {/* Dialogs */}
      <ExportDialog open={exportDialogOpen} onOpenChange={setExportDialogOpen} />
      <ImportDialog open={importDialogOpen} onOpenChange={setImportDialogOpen} />
    </div>
  )
}
