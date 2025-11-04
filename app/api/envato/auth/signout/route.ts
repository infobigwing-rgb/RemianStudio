import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  const cookieStore = await cookies()

  // Clear all Envato cookies
  cookieStore.delete("envato_access_token")
  cookieStore.delete("envato_refresh_token")
  cookieStore.delete("envato_user")

  return NextResponse.json({ success: true })
}
