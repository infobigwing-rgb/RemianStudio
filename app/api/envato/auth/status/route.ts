import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("envato_access_token")
  const userCookie = cookieStore.get("envato_user")

  if (!accessToken) {
    return NextResponse.json({ authenticated: false })
  }

  try {
    const user = userCookie ? JSON.parse(userCookie.value) : null
    return NextResponse.json({
      authenticated: true,
      user,
    })
  } catch (error) {
    return NextResponse.json({ authenticated: false })
  }
}
