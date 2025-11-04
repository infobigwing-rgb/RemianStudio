import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const token = process.env.ENVATO_API_TOKEN

  if (!token) {
    return NextResponse.json({ error: "Envato API token not configured" }, { status: 500 })
  }

  try {
    const envatoResponse = await fetch("https://api.envato.com/v3/market/buyer/list-purchases", {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "RemianStudio/1.0",
      },
    })

    if (!envatoResponse.ok) {
      throw new Error(`Envato API error: ${envatoResponse.status}`)
    }

    const data = await envatoResponse.json()

    // Transform to our format
    const results =
      data.results?.map((item: any) => ({
        id: item.item.id,
        name: item.item.name,
        thumbnailUrl: item.item.previews?.icon_preview?.icon_url || "",
        previewUrl: item.item.previews?.mp4_video_preview?.url,
        type: "video-template",
        isPurchased: true,
        author: item.item.author_username,
        tags: item.item.tags || [],
        purchaseDate: item.sold_at,
      })) || []

    return NextResponse.json({ results, total: results.length })
  } catch (error) {
    console.error("Envato purchases error:", error)
    return NextResponse.json({ error: "Failed to fetch purchases" }, { status: 500 })
  }
}
