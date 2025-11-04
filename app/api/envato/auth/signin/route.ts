import { NextResponse } from "next/server"

export async function GET() {
  // Envato OAuth configuration
  const clientId = process.env.ENVATO_CLIENT_ID
  const redirectUri = process.env.ENVATO_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/envato/auth/callback`

  if (!clientId) {
    return NextResponse.json({ error: "Envato OAuth not configured" }, { status: 500 })
  }

  // Build OAuth authorization URL
  const authUrl = new URL("https://api.envato.com/authorization")
  authUrl.searchParams.set("response_type", "code")
  authUrl.searchParams.set("client_id", clientId)
  authUrl.searchParams.set("redirect_uri", redirectUri)

  // Redirect to Envato OAuth
  return NextResponse.redirect(authUrl.toString())
}
