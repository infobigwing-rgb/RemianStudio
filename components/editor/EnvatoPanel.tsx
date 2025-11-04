"use client"

import { useState } from "react"
import { Search, Download, Eye } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEditorStore } from "@/lib/store"
import type { EnvatoAsset } from "@/lib/types"

export function EnvatoPanel() {
  const [searchQuery, setSearchQuery] = useState("")
  const [assets, setAssets] = useState<EnvatoAsset[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { addLayer } = useEditorStore()

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/envato/search?q=${encodeURIComponent(searchQuery)}`)

      if (!response.ok) {
        throw new Error("Search failed")
      }

      const data = await response.json()

      const mappedAssets: EnvatoAsset[] = data.results.map((item: any) => ({
        id: item.id,
        name: item.name,
        thumbnail: item.thumbnailUrl || "/placeholder.svg?height=200&width=300",
        previewUrl: item.previewUrl,
        category: "video-templates",
        tags: item.tags || [],
        isPurchased: item.isPurchased,
        templateData: {
          layers: [
            { name: "Background", type: "video", isPlaceholder: false },
            { name: "Title Text", type: "text", isPlaceholder: true },
          ],
          placeholders: [{ id: "title", name: "Title", type: "text", defaultValue: "Your Title" }],
        },
      }))

      setAssets(mappedAssets)
    } catch (error) {
      console.error("Search failed:", error)
      setAssets([
        {
          id: "1",
          name: "Corporate Intro Template",
          thumbnail: "/placeholder.svg?height=200&width=300",
          category: "video-templates",
          tags: ["corporate", "intro", "business"],
          isPurchased: true,
          templateData: {
            layers: [
              { name: "Background", type: "video", isPlaceholder: false },
              { name: "Logo", type: "image", isPlaceholder: true },
              { name: "Title Text", type: "text", isPlaceholder: true },
            ],
            placeholders: [
              { id: "logo", name: "Logo", type: "image" },
              { id: "title", name: "Title", type: "text", defaultValue: "Your Company" },
            ],
          },
        },
        {
          id: "2",
          name: "Social Media Promo",
          thumbnail: "/placeholder.svg?height=200&width=300",
          category: "video-templates",
          tags: ["social", "promo", "instagram"],
          isPurchased: true,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplyTemplate = (asset: EnvatoAsset) => {
    if (asset.templateData) {
      asset.templateData.layers.forEach((templateLayer, index) => {
        addLayer({
          id: `${asset.id}-${index}`,
          type: templateLayer.type as any,
          name: templateLayer.name,
          startTime: 0,
          duration: 5,
          track: index,
          content: templateLayer.isPlaceholder ? "Edit Me" : undefined,
          properties: {
            x: 100,
            y: 100 + index * 50,
            width: 400,
            height: 100,
            opacity: 1,
            rotation: 0,
          },
        })
      })
    }
  }

  return (
    <div className="w-80 border-r border-border bg-card flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold mb-3">Envato Templates</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button size="icon" onClick={handleSearch} disabled={isLoading}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {assets.map((asset) => (
            <Card key={asset.id} className="overflow-hidden">
              <img
                src={asset.thumbnail || "/placeholder.svg?height=200&width=300"}
                alt={asset.name}
                className="w-full h-40 object-cover"
              />
              <div className="p-3">
                <h3 className="font-medium text-sm mb-1">{asset.name}</h3>
                <div className="flex gap-1 flex-wrap mb-2">
                  {asset.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-xs bg-secondary px-2 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </Button>
                  {asset.isPurchased ? (
                    <Button size="sm" className="flex-1" onClick={() => handleApplyTemplate(asset)}>
                      <Download className="h-3 w-3 mr-1" />
                      Apply
                    </Button>
                  ) : (
                    <Button size="sm" variant="secondary" className="flex-1" disabled>
                      Purchase
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
