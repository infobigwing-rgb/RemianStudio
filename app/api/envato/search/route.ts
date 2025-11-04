import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")
  const page = searchParams.get("page") || "1"

  const token = process.env.ENVATO_API_TOKEN

  if (!token) {
    return NextResponse.json({ error: "Envato API token not configured" }, { status: 500 })
  }

  try {
    const envatoResponse = await fetch(
      `https://api.envato.com/v1/market/search?q=${encodeURIComponent(query || "")}&site=videohive&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "User-Agent": "StudioPro-Editor/1.0",
        },
      },
    )

    if (!envatoResponse.ok) {
      throw new Error(`Envato API error: ${envatoResponse.status}`)
    }

    const data = await envatoResponse.json()

    // Transform to our format
    const results =
      data.matches?.map((item: any) => ({
        id: item.id,
        name: item.name,
        thumbnailUrl: item.previews?.icon_preview?.icon_url || "",
        previewUrl: item.previews?.mp4_video_preview?.url,
        type: "video-template",
        price: item.price_cents / 100,
        isPurchased: false,
        author: item.author_username,
        tags: item.tags || [],
      })) || []

    return NextResponse.json({ results, total: data.total || 0 })
  } catch (error) {
    console.error("Envato search error:", error)
    return NextResponse.json({ error: "Failed to search Envato" }, { status: 500 })
  }
}
