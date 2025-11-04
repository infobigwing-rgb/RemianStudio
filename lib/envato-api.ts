import type { EnvatoAsset } from "./types/editor"
import { cache } from "./cache"

// Mock Envato API - In production, this would call the real Envato API
export async function searchEnvatoAssets(query: string, type?: EnvatoAsset["type"]): Promise<EnvatoAsset[]> {
  const cacheKey = `envato-search-${query}-${type || "all"}`
  const cached = cache.get<EnvatoAsset[]>(cacheKey)
  if (cached) {
    console.log("[v0] Returning cached Envato assets")
    return cached
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Mock data
  const mockAssets: EnvatoAsset[] = [
    {
      id: "1",
      name: "Corporate Intro Template",
      thumbnailUrl: "/placeholder.svg?height=200&width=300",
      previewUrl: "/placeholder.svg?height=400&width=600",
      type: "video-template",
      price: 29,
      isPurchased: false,
      author: "VideoHive",
      tags: ["corporate", "intro", "business"],
    },
    {
      id: "2",
      name: "Modern Logo Reveal",
      thumbnailUrl: "/placeholder.svg?height=200&width=300",
      previewUrl: "/placeholder.svg?height=400&width=600",
      type: "video-template",
      price: 19,
      isPurchased: true,
      author: "MotionArray",
      tags: ["logo", "reveal", "modern"],
    },
    {
      id: "3",
      name: "Cinematic Background Music",
      thumbnailUrl: "/placeholder.svg?height=200&width=300",
      type: "audio",
      price: 15,
      isPurchased: false,
      author: "AudioJungle",
      tags: ["cinematic", "background", "music"],
    },
    {
      id: "4",
      name: "Stock Footage - City Skyline",
      thumbnailUrl: "/placeholder.svg?height=200&width=300",
      previewUrl: "/placeholder.svg?height=400&width=600",
      type: "video",
      price: 25,
      isPurchased: true,
      author: "VideoHive",
      tags: ["city", "skyline", "timelapse"],
    },
    {
      id: "5",
      name: "Abstract Background Pack",
      thumbnailUrl: "/placeholder.svg?height=200&width=300",
      type: "image",
      price: 12,
      isPurchased: false,
      author: "GraphicRiver",
      tags: ["abstract", "background", "geometric"],
    },
    {
      id: "6",
      name: "Social Media Lower Thirds",
      thumbnailUrl: "/placeholder.svg?height=200&width=300",
      previewUrl: "/placeholder.svg?height=400&width=600",
      type: "video-template",
      price: 22,
      isPurchased: true,
      author: "VideoHive",
      tags: ["social", "lower-thirds", "graphics"],
    },
  ]

  // Filter by type if specified
  let filtered = type ? mockAssets.filter((a) => a.type === type) : mockAssets

  // Filter by query
  if (query) {
    const lowerQuery = query.toLowerCase()
    filtered = filtered.filter(
      (a) => a.name.toLowerCase().includes(lowerQuery) || a.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)),
    )
  }

  cache.set(cacheKey, filtered, 5 * 60 * 1000)

  return filtered
}

export async function getEnvatoAsset(id: string): Promise<EnvatoAsset | null> {
  const cacheKey = `envato-asset-${id}`
  const cached = cache.get<EnvatoAsset>(cacheKey)
  if (cached) {
    return cached
  }

  const assets = await searchEnvatoAssets("")
  const asset = assets.find((a) => a.id === id) || null

  if (asset) {
    cache.set(cacheKey, asset, 10 * 60 * 1000)
  }

  return asset
}

export async function purchaseEnvatoAsset(id: string): Promise<boolean> {
  // Simulate purchase
  await new Promise((resolve) => setTimeout(resolve, 1000))

  cache.delete(`envato-asset-${id}`)

  return true
}
