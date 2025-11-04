"use client"

import { useState, useEffect, useMemo } from "react"
import { searchEnvatoAssets } from "@/lib/envato-api"
import type { EnvatoAsset, Template } from "@/lib/types/editor"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Download, ShoppingCart, Check, Wand2 } from "lucide-react"
import { useEditorStore } from "@/lib/store/editor-store"
import { TemplateCustomizer } from "./TemplateCustomizer"
import { TemplateParser } from "@/lib/template-parser"

export function AssetBrowser() {
  const [assets, setAssets] = useState<EnvatoAsset[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<EnvatoAsset["type"] | "all">("all")
  const { addLayer } = useEditorStore()
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [customizerOpen, setCustomizerOpen] = useState(false)

  useEffect(() => {
    loadAssets()
  }, [activeTab])

  const loadAssets = async () => {
    setLoading(true)
    try {
      const type = activeTab === "all" ? undefined : activeTab
      const results = await searchEnvatoAssets(searchQuery, type)
      setAssets(results)
    } catch (error) {
      console.error("[v0] Failed to load assets:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleTemplateSelect = async (asset: EnvatoAsset) => {
    if (asset.type === "video-template") {
      const parser = new TemplateParser()
      const template = await parser.parseTemplate(asset)
      setSelectedTemplate(template)
      setCustomizerOpen(true)
    } else {
      handleAddToProject(asset)
    }
  }

  const handleAddToProject = (asset: EnvatoAsset) => {
    const layerType: EnvatoAsset["type"] =
      asset.type === "video-template" || asset.type === "video" ? "video" : asset.type === "audio" ? "audio" : "image"

    const newLayer: EnvatoAsset = {
      id: `layer-${Date.now()}`,
      type: layerType,
      name: asset.name,
      startTime: 0,
      duration: 5,
      track: 0,
      properties: {
        x: 0,
        y: 0,
        opacity: 1,
        src: asset.previewUrl || asset.thumbnailUrl,
        ...(layerType === "audio" && { volume: 1 }),
      },
    }

    addLayer(newLayer)
  }

  const filteredAssets = useMemo(() => {
    return assets
  }, [assets])

  return (
    <>
      <div className="h-full w-full flex flex-col bg-card">
        {/* Header */}
        <div className="p-4 border-b space-y-4">
          <h2 className="text-lg font-semibold">Envato Assets</h2>

          {/* Search */}
          <div className="flex gap-2">
            <Input
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadAssets()}
            />
            <Button onClick={loadAssets} size="icon">
              <Search className="size-4" />
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">
                All
              </TabsTrigger>
              <TabsTrigger value="video-template" className="flex-1">
                Templates
              </TabsTrigger>
              <TabsTrigger value="video" className="flex-1">
                Video
              </TabsTrigger>
              <TabsTrigger value="audio" className="flex-1">
                Audio
              </TabsTrigger>
              <TabsTrigger value="image" className="flex-1">
                Images
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Assets Grid */}
        <ScrollArea className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-sm text-muted-foreground">Loading assets...</p>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-sm text-muted-foreground">No assets found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {filteredAssets.map((asset) => (
                <Card key={asset.id} className="overflow-hidden">
                  <div className="aspect-video relative bg-muted">
                    <img
                      src={asset.thumbnailUrl || "/placeholder.svg"}
                      alt={asset.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {asset.isPurchased && (
                      <Badge className="absolute top-2 right-2 bg-green-500">
                        <Check className="size-3 mr-1" />
                        Owned
                      </Badge>
                    )}
                    {asset.type === "video-template" && (
                      <Badge className="absolute top-2 left-2 bg-blue-500">
                        <Wand2 className="size-3 mr-1" />
                        Template
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-3 space-y-2">
                    <div>
                      <h3 className="font-medium text-sm line-clamp-1">{asset.name}</h3>
                      <p className="text-xs text-muted-foreground">{asset.author}</p>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {asset.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="font-semibold">${asset.price}</span>
                      {asset.isPurchased ? (
                        <Button size="sm" onClick={() => handleTemplateSelect(asset)}>
                          {asset.type === "video-template" ? (
                            <>
                              <Wand2 className="size-3 mr-1" />
                              Customize
                            </>
                          ) : (
                            <>
                              <Download className="size-3 mr-1" />
                              Add
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline">
                          <ShoppingCart className="size-3 mr-1" />
                          Buy
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Template Customizer Dialog */}
      <TemplateCustomizer template={selectedTemplate} open={customizerOpen} onOpenChange={setCustomizerOpen} />
    </>
  )
}
