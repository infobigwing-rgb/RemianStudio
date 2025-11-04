"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Upload, Video, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { useEditorStore } from "@/lib/store"
import { ImageIcon } from "lucide-react"

interface MediaFile {
  id: string
  name: string
  type: "image" | "video" | "audio"
  url: string
  thumbnail?: string
}

export function MediaLibrary() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const { addLayer } = useEditorStore()

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(e.target.files || [])

    uploadedFiles.forEach((file) => {
      const url = URL.createObjectURL(file)
      const type = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "audio"

      const newFile: MediaFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type,
        url,
        thumbnail: type === "image" ? url : undefined,
      }

      setFiles((prev) => [...prev, newFile])
    })
  }, [])

  const handleAddToTimeline = (file: MediaFile) => {
    addLayer({
      id: `layer-${Date.now()}`,
      type: file.type,
      name: file.name,
      startTime: 0,
      duration: 5,
      track: 0,
      source: file.url,
      properties: {
        x: 0,
        y: 0,
        width: 1920,
        height: 1080,
        opacity: 1,
        rotation: 0,
      },
    })
  }

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold mb-3">Media Library</h2>
        <label htmlFor="file-upload">
          <Button className="w-full" asChild>
            <span>
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </span>
          </Button>
        </label>
        <input
          id="file-upload"
          type="file"
          multiple
          accept="image/*,video/*,audio/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 grid grid-cols-2 gap-3">
          {files.map((file) => (
            <Card
              key={file.id}
              className="overflow-hidden cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleAddToTimeline(file)}
            >
              <div className="aspect-video bg-secondary flex items-center justify-center">
                {file.thumbnail ? (
                  <img
                    src={file.thumbnail || "/placeholder.svg"}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    {file.type === "video" && <Video className="h-8 w-8 text-muted-foreground" />}
                    {file.type === "image" && <ImageIcon className="h-8 w-8 text-muted-foreground" />}
                    {file.type === "audio" && <FileText className="h-8 w-8 text-muted-foreground" />}
                  </>
                )}
              </div>
              <div className="p-2">
                <p className="text-xs truncate">{file.name}</p>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
