import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("envato_access_token")

  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    // Fetch Elements subscription items
    const envatoResponse = await fetch("https://api.envato.com/v3/market/buyer/list-purchases?filter_by=elements", {
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
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
        isElements: true,
        author: item.item.author_username,
        tags: item.item.tags || [],
      })) || []

    return NextResponse.json({ results, total: results.length })
  } catch (error) {
    console.error("Envato Elements error:", error)
    return NextResponse.json({ error: "Failed to fetch Elements templates" }, { status: 500 })
  }
}
