import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")

  if (!code) {
    return NextResponse.redirect(new URL("/?error=oauth_failed", request.url))
  }

  const clientId = process.env.ENVATO_CLIENT_ID
  const clientSecret = process.env.ENVATO_CLIENT_SECRET
  const redirectUri = process.env.ENVATO_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/envato/auth/callback`

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/?error=oauth_config", request.url))
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://api.envato.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for token")
    }

    const tokenData = await tokenResponse.json()

    // Get user info
    const userResponse = await fetch("https://api.envato.com/v1/market/private/user/account.json", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    const userData = await userResponse.json()

    // Store tokens in httpOnly cookies
    const cookieStore = await cookies()
    cookieStore.set("envato_access_token", tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    if (tokenData.refresh_token) {
      cookieStore.set("envato_refresh_token", tokenData.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 90, // 90 days
      })
    }

    // Store user info
    cookieStore.set(
      "envato_user",
      JSON.stringify({
        username: userData.account?.username,
        email: userData.account?.email,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
      },
    )

    // Redirect back to app
    return NextResponse.redirect(new URL("/?auth=success", request.url))
  } catch (error) {
    console.error("OAuth callback error:", error)
    return NextResponse.redirect(new URL("/?error=oauth_failed", request.url))
  }
}
