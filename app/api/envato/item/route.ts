import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const itemId = searchParams.get("id")
  const token = process.env.ENVATO_API_TOKEN

  if (!token) {
    return NextResponse.json({ error: "Envato API token not configured" }, { status: 500 })
  }

  if (!itemId) {
    return NextResponse.json({ error: "Item ID required" }, { status: 400 })
  }

  try {
    const envatoResponse = await fetch(`https://api.envato.com/v1/market/item?id=${itemId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "StudioPro-Editor/1.0",
      },
    })

    if (!envatoResponse.ok) {
      throw new Error(`Envato API error: ${envatoResponse.status}`)
    }

    const data = await envatoResponse.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Envato item fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch item details" }, { status: 500 })
  }
}
