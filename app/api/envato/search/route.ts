import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")
  const page = searchParams.get("page") || "1"

  const token = process.env.ENVATO_API_TOKEN

  console.log("[v0] Envato search API called", { query, page, hasToken: !!token })

  if (!token) {
    console.error("[v0] Envato API token not configured")
    return NextResponse.json(
      {
        error: "Envato API token not configured",
        details: "Please set ENVATO_API_TOKEN in your environment variables",
      },
      { status: 500 },
    )
  }

  try {
    const apiUrl = `https://api.envato.com/v1/discovery/search/search/item?term=${encodeURIComponent(query || "")}&site=videohive&page=${page}`
    console.log("[v0] Fetching from Envato API:", apiUrl)

    const envatoResponse = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "Remian-Studio/1.0",
      },
    })

    console.log("[v0] Envato API response status:", envatoResponse.status)

    if (!envatoResponse.ok) {
      const errorText = await envatoResponse.text()
      console.error("[v0] Envato API error:", {
        status: envatoResponse.status,
        statusText: envatoResponse.statusText,
        body: errorText,
      })

      return NextResponse.json(
        {
          error: `Envato API error: ${envatoResponse.status}`,
          details: errorText,
          status: envatoResponse.status,
        },
        { status: envatoResponse.status },
      )
    }

    const data = await envatoResponse.json()
    console.log("[v0] Envato API response data:", {
      matchesCount: data.matches?.length || 0,
      total: data.total,
    })

    // Transform to our format
    const results =
      data.matches?.map((item: any) => ({
        id: item.id,
        name: item.name,
        thumbnailUrl: item.previews?.icon_preview?.icon_url || item.thumbnail_url || "",
        previewUrl: item.previews?.mp4_video_preview?.url || item.live_preview_url,
        type: "video-template",
        price: item.price_cents ? item.price_cents / 100 : 0,
        isPurchased: false,
        author: item.author_username || item.author,
        tags: item.tags || [],
      })) || []

    console.log("[v0] Transformed results:", results.length)

    return NextResponse.json({
      results,
      total: data.total || 0,
      success: true,
    })
  } catch (error) {
    console.error("[v0] Envato search error:", error)
    return NextResponse.json(
      {
        error: "Failed to search Envato",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
