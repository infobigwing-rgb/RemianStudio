import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("x-webhook-signature")
    const body = await request.text()

    // Verify webhook signature
    const secret = process.env.WEBHOOK_SECRET || ""
    const expectedSignature = crypto.createHmac("sha256", secret).update(body).digest("hex")

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(body)

    // Process webhook event
    await processWebhookEvent(event)

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

async function processWebhookEvent(event: any) {
  const { type, data } = event

  switch (type) {
    case "project.created":
      console.log("Project created:", data.projectId)
      break
    case "project.exported":
      console.log("Project exported:", data.projectId)
      break
    case "comment.added":
      console.log("Comment added:", data.commentId)
      break
    default:
      console.log("Unknown event type:", type)
  }
}
