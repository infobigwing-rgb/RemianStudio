import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "")

  if (!token) {
    return NextResponse.json({ error: "No token provided" }, { status: 401 })
  }

  try {
    const response = await fetch("https://api.envato.com/v1/market/private/user/account.json", {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "StudioPro-Editor/1.0",
      },
    })

    if (!response.ok) {
      return NextResponse.json({ valid: false, error: "Invalid token" }, { status: 401 })
    }

    const userData = await response.json()
    return NextResponse.json({
      valid: true,
      user: {
        username: userData.account?.username,
        email: userData.account?.email,
      },
    })
  } catch (error) {
    console.error("Token validation error:", error)
    return NextResponse.json({ valid: false, error: "Validation failed" }, { status: 500 })
  }
}
