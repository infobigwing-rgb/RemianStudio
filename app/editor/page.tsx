"use client"

import { EditorCanvas } from "@/components/editor/EditorCanvas"
import { EditorTimeline } from "@/components/editor/EditorTimeline"
import { LayersPanel } from "@/components/editor/LayersPanel"
import { PropertiesPanel } from "@/components/editor/PropertiesPanel"
import { EditorToolbar } from "@/components/editor/EditorToolbar"
import { AssetBrowser } from "@/components/editor/AssetBrowser"
import { MediaLibrary } from "@/components/media/MediaLibrary"
import { CloudStoragePanel } from "@/components/media/CloudStoragePanel"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useEditorStore } from "@/lib/store/editor-store"
import { useEffect } from "react"

export default function EditorPage() {
  const setProject = useEditorStore((state) => state.setProject)

  useEffect(() => {
    setProject({
      id: "1",
      name: "Untitled Project",
      duration: 60,
      resolution: "1080p",
      fps: 30,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }, [setProject])

  return (
    <div className="h-screen w-full flex flex-col bg-background">
      <EditorToolbar />

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Left Panel - Layers, Assets, Media Library with Tabs */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <Tabs defaultValue="layers" className="h-full flex flex-col">
            <div className="border-b bg-card">
              <TabsList className="w-full rounded-none h-12">
                <TabsTrigger value="layers" className="flex-1">
                  Layers
                </TabsTrigger>
                <TabsTrigger value="assets" className="flex-1">
                  Assets
                </TabsTrigger>
                <TabsTrigger value="media" className="flex-1">
                  Media
                </TabsTrigger>
                <TabsTrigger value="cloud" className="flex-1">
                  Cloud
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="layers" className="flex-1 m-0">
              <LayersPanel />
            </TabsContent>
            <TabsContent value="assets" className="flex-1 m-0">
              <AssetBrowser />
            </TabsContent>
            <TabsContent value="media" className="flex-1 m-0">
              <MediaLibrary />
            </TabsContent>
            <TabsContent value="cloud" className="flex-1 m-0">
              <CloudStoragePanel />
            </TabsContent>
          </Tabs>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Center Panel - Canvas & Timeline */}
        <ResizablePanel defaultSize={55} minSize={40}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={70} minSize={50}>
              <EditorCanvas />
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={30} minSize={20}>
              <EditorTimeline />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Panel - Properties */}
        <ResizablePanel defaultSize={25} minSize={15} maxSize={35}>
          <PropertiesPanel />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
