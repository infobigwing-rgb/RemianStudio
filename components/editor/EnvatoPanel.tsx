"use client"

import { useState, useEffect } from "react"
import { Search, Download, Eye, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEditorStore } from "@/lib/store"
import { EnvatoAuth } from "@/components/auth/EnvatoAuth"
import type { EnvatoAsset } from "@/lib/types"

export function EnvatoPanel() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<EnvatoAsset[]>([])
  const [purchasedTemplates, setPurchasedTemplates] = useState<EnvatoAsset[]>([])
  const [elementsTemplates, setElementsTemplates] = useState<EnvatoAsset[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingPurchased, setIsLoadingPurchased] = useState(true)
  const [isLoadingElements, setIsLoadingElements] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { addLayer } = useEditorStore()

  useEffect(() => {
    loadPurchasedTemplates()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadElementsTemplates()
    }
  }, [isAuthenticated])

  const loadPurchasedTemplates = async () => {
    setIsLoadingPurchased(true)
    try {
      const response = await fetch("/api/envato/purchases")

      if (response.ok) {
        const data = await response.json()
        const mapped: EnvatoAsset[] = (data.results || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          thumbnail: item.thumbnailUrl || "/placeholder.svg?height=200&width=300",
          previewUrl: item.previewUrl,
          category: "video-templates",
          tags: item.tags || [],
          isPurchased: true,
        }))
        setPurchasedTemplates(mapped)
      }
    } catch (error) {
      console.error("Failed to load purchased templates:", error)
    } finally {
      setIsLoadingPurchased(false)
    }
  }

  const loadElementsTemplates = async () => {
    setIsLoadingElements(true)
    try {
      const response = await fetch("/api/envato/elements")

      if (response.ok) {
        const data = await response.json()
        const mapped: EnvatoAsset[] = (data.results || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          thumbnail: item.thumbnailUrl || "/placeholder.svg?height=200&width=300",
          previewUrl: item.previewUrl,
          category: "video-templates",
          tags: item.tags || [],
          isPurchased: true,
          isElements: true,
        }))
        setElementsTemplates(mapped)
      }
    } catch (error) {
      console.error("Failed to load Elements templates:", error)
    } finally {
      setIsLoadingElements(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const response = await fetch(`/api/envato/search?q=${encodeURIComponent(searchQuery)}`)

      if (!response.ok) {
        throw new Error("Search failed")
      }

      const data = await response.json()
      const mapped: EnvatoAsset[] = data.results.map((item: any) => ({
        id: item.id,
        name: item.name,
        thumbnail: item.thumbnailUrl || "/placeholder.svg?height=200&width=300",
        previewUrl: item.previewUrl,
        category: "video-templates",
        tags: item.tags || [],
        isPurchased: item.isPurchased || false,
      }))

      setSearchResults(mapped)
    } catch (error) {
      console.error("Search failed:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleApplyTemplate = (asset: EnvatoAsset) => {
    addLayer({
      id: `template-${asset.id}-${Date.now()}`,
      type: "video",
      name: asset.name,
      startTime: 0,
      duration: 5,
      track: 0,
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

  const renderAssetCard = (asset: EnvatoAsset) => (
    <Card key={asset.id} className="overflow-hidden">
      <img src={asset.thumbnail || "/placeholder.svg"} alt={asset.name} className="w-full h-40 object-cover" />
      <div className="p-3">
        <h3 className="font-medium text-sm mb-1 line-clamp-1">{asset.name}</h3>
        {asset.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap mb-2">
            {asset.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs bg-secondary px-2 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          {asset.previewUrl && (
            <Button size="sm" variant="outline" className="flex-1 bg-transparent" asChild>
              <a href={asset.previewUrl} target="_blank" rel="noopener noreferrer">
                <Eye className="h-3 w-3 mr-1" />
                Preview
              </a>
            </Button>
          )}
          {asset.isPurchased ? (
            <Button size="sm" className="flex-1" onClick={() => handleApplyTemplate(asset)}>
              <Download className="h-3 w-3 mr-1" />
              Apply
            </Button>
          ) : (
            <Button size="sm" variant="secondary" className="flex-1" disabled>
              Not Purchased
            </Button>
          )}
        </div>
      </div>
    </Card>
  )

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold mb-1">Your Template Library</h2>
        <p className="text-xs text-muted-foreground">Browse and import Envato templates</p>
      </div>

      <div className="p-4 border-b border-border">
        <EnvatoAuth onAuthChange={setIsAuthenticated} />
      </div>

      <Tabs defaultValue="purchased" className="flex-1 flex flex-col">
        <TabsList className="w-full rounded-none border-b border-border">
          <TabsTrigger value="purchased" className="flex-1">
            Purchased
          </TabsTrigger>
          {isAuthenticated && (
            <TabsTrigger value="elements" className="flex-1">
              Elements
            </TabsTrigger>
          )}
          <TabsTrigger value="search" className="flex-1">
            Search
          </TabsTrigger>
        </TabsList>

        <TabsContent value="purchased" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4">
              {isLoadingPurchased ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : purchasedTemplates.length > 0 ? (
                <div className="space-y-3">{purchasedTemplates.map(renderAssetCard)}</div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No purchased templates found</p>
                  <p className="text-sm mt-1">Search for templates to purchase</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {isAuthenticated && (
          <TabsContent value="elements" className="flex-1 m-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4">
                {isLoadingElements ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : elementsTemplates.length > 0 ? (
                  <div className="space-y-3">{elementsTemplates.map(renderAssetCard)}</div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No Elements templates found</p>
                    <p className="text-sm mt-1">Check your Envato Elements subscription</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        )}

        <TabsContent value="search" className="flex-1 m-0 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="flex gap-2">
              <Input
                placeholder="Search Envato marketplace..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button size="icon" onClick={handleSearch} disabled={isSearching}>
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4">
              {searchResults.length > 0 ? (
                <div className="space-y-3">{searchResults.map(renderAssetCard)}</div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>Search for video templates</p>
                  <p className="text-sm mt-1">Enter keywords to find templates</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
