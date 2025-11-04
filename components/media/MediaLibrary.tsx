"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import type { MediaAsset, UploadProgress } from "@/lib/types/media"
import { UploadManager } from "@/lib/media/upload-manager"
import { Upload, Search, Folder, ImageIcon, Video, Music, Plus } from "lucide-react"
import { useEditorStore } from "@/lib/store/editor-store"
import type { Layer } from "@/lib/types/editor"

export function MediaLibrary() {
  const [assets, setAssets] = useState<MediaAsset[]>([])
  const [uploads, setUploads] = useState<UploadProgress[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | "video" | "image" | "audio">("all")
  const { addLayer } = useEditorStore()

  const uploadManager = new UploadManager()

  useEffect(() => {
    const unsubscribe = uploadManager.onUploadChange(setUploads)
    return unsubscribe
  }, [])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    try {
      const newAssets = await uploadManager.uploadFiles(files)
      setAssets((prev) => [...newAssets, ...prev])
    } catch (error) {
      console.error("[v0] Upload failed:", error)
    }
  }

  const handleAddToProject = (asset: MediaAsset) => {
    const newLayer: Layer = {
      id: `layer-${Date.now()}`,
      type: asset.type === "audio" ? "audio" : asset.type === "video" ? "video" : "image",
      name: asset.name,
      startTime: 0,
      duration: asset.duration || 5,
      track: 0,
      properties: {
        x: 0,
        y: 0,
        opacity: 1,
        src: asset.url,
        ...(asset.type === "audio" && { volume: 1 }),
        ...(asset.type === "image" && {
          width: asset.width || 400,
          height: asset.height || 300,
        }),
      },
    }

    addLayer(newLayer)
  }

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = activeTab === "all" || asset.type === activeTab
    return matchesSearch && matchesType
  })

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="p-4 border-b space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Media Library</h2>
          <label>
            <input
              type="file"
              multiple
              accept="video/*,image/*,audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button size="sm" asChild>
              <span>
                <Upload className="size-4 mr-2" />
                Upload
              </span>
            </Button>
          </label>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">
              All
            </TabsTrigger>
            <TabsTrigger value="video" className="flex-1">
              <Video className="size-3 mr-1" />
              Video
            </TabsTrigger>
            <TabsTrigger value="image" className="flex-1">
              <ImageIcon className="size-3 mr-1" />
              Images
            </TabsTrigger>
            <TabsTrigger value="audio" className="flex-1">
              <Music className="size-3 mr-1" />
              Audio
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {uploads.length > 0 && (
        <div className="p-4 border-b bg-muted/30 space-y-2">
          <h3 className="text-sm font-semibold">Uploading</h3>
          {uploads.map((upload) => (
            <div key={upload.fileId} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="truncate flex-1">{upload.fileName}</span>
                <span className="text-muted-foreground">{upload.progress}%</span>
              </div>
              <Progress value={upload.progress} />
              {upload.status === "error" && <p className="text-xs text-destructive">{upload.error}</p>}
            </div>
          ))}
        </div>
      )}

      <ScrollArea className="flex-1">
        {filteredAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-4">
            <Folder className="size-16 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              {assets.length === 0 ? "No media files yet" : "No files match your search"}
            </p>
            <label>
              <input
                type="file"
                multiple
                accept="video/*,image/*,audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button asChild>
                <span>
                  <Plus className="size-4 mr-2" />
                  Upload Files
                </span>
              </Button>
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 p-4">
            {filteredAssets.map((asset) => (
              <Card key={asset.id} className="overflow-hidden group">
                <div className="aspect-video relative bg-muted">
                  {asset.type === "audio" ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="size-12 text-muted-foreground" />
                    </div>
                  ) : (
                    <img
                      src={asset.thumbnailUrl || asset.url}
                      alt={asset.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                  {asset.hasProxy && <Badge className="absolute top-2 right-2 text-xs">Proxy</Badge>}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button size="sm" onClick={() => handleAddToProject(asset)}>
                      <Plus className="size-3 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
                <CardContent className="p-3">
                  <h3 className="font-medium text-sm truncate">{asset.name}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">{formatFileSize(asset.size)}</span>
                    {asset.duration && (
                      <span className="text-xs text-muted-foreground">{asset.duration.toFixed(1)}s</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
