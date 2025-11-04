import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const token = process.env.ENVATO_API_TOKEN

  console.log("[v0] Envato purchases API called", { hasToken: !!token })

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
    const apiUrl = "https://api.envato.com/v3/market/buyer/list-purchases"
    console.log("[v0] Fetching purchases from:", apiUrl)

    const envatoResponse = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "Remian-Studio/1.0",
      },
    })

    console.log("[v0] Purchases API response status:", envatoResponse.status)

    if (!envatoResponse.ok) {
      const errorText = await envatoResponse.text()
      console.error("[v0] Envato purchases API error:", {
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
    console.log("[v0] Purchases data:", {
      resultsCount: data.results?.length || 0,
    })

    // Transform to our format
    const results =
      data.results?.map((item: any) => ({
        id: item.item.id,
        name: item.item.name,
        thumbnailUrl: item.item.previews?.icon_preview?.icon_url || item.item.thumbnail_url || "",
        previewUrl: item.item.previews?.mp4_video_preview?.url || item.item.live_preview_url,
        type: "video-template",
        isPurchased: true,
        author: item.item.author_username || item.item.author,
        tags: item.item.tags || [],
        purchaseDate: item.sold_at,
      })) || []

    console.log("[v0] Transformed purchases:", results.length)

    return NextResponse.json({
      results,
      total: results.length,
      success: true,
    })
  } catch (error) {
    console.error("[v0] Envato purchases error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch purchases",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
