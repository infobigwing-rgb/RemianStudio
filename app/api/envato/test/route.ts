import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const token = process.env.ENVATO_API_TOKEN

  console.log("[v0] Testing Envato API connection", { hasToken: !!token })

  if (!token) {
    return NextResponse.json({
      success: false,
      error: "Token not configured",
      details: "ENVATO_API_TOKEN environment variable is not set",
      tokenFormat: null,
    })
  }

  // Check token format
  const tokenFormat = token.startsWith("Bearer ") ? "Has Bearer prefix (remove it)" : "Correct format"

  try {
    // Test with a simple API call to verify token
    const response = await fetch("https://api.envato.com/v1/market/private/user/account.json", {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "Remian-Studio/1.0",
      },
    })

    console.log("[v0] Test API response:", response.status)

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({
        success: true,
        message: "Connection successful",
        user: {
          username: data.account?.username || "Unknown",
          email: data.account?.email || "Unknown",
        },
        tokenFormat,
      })
    } else {
      const errorText = await response.text()
      console.error("[v0] Test API error:", errorText)

      let errorMessage = "Unknown error"
      if (response.status === 401) {
        errorMessage = "Invalid or expired token"
      } else if (response.status === 403) {
        errorMessage = "Token doesn't have required permissions"
      } else if (response.status === 429) {
        errorMessage = "Rate limit exceeded (120 requests/minute)"
      }

      return NextResponse.json({
        success: false,
        error: errorMessage,
        details: errorText,
        status: response.status,
        tokenFormat,
      })
    }
  } catch (error) {
    console.error("[v0] Test connection error:", error)
    return NextResponse.json({
      success: false,
      error: "Network error",
      details: error instanceof Error ? error.message : "Failed to connect to Envato API",
      tokenFormat,
    })
  }
}
