import type { User } from "./user" // Assuming User is imported from another module
import type { Comment } from "./comment" // Assuming Comment is imported from another module

export type CollaborationEvent =
  | { type: "user-joined"; user: User }
  | { type: "user-left"; userId: string }
  | { type: "cursor-move"; userId: string; x: number; y: number }
  | { type: "layer-select"; userId: string; layerId: string | null }
  | { type: "layer-update"; layerId: string; updates: any }
  | { type: "layer-add"; layer: any }
  | { type: "layer-remove"; layerId: string }
  | { type: "comment-add"; comment: Comment }
  | { type: "comment-resolve"; commentId: string }

export class CollaborationClient {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private listeners: Map<string, Set<(event: CollaborationEvent) => void>> = new Map()

  constructor(
    private projectId: string,
    private userId: string,
  ) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      // In production, this would connect to a real WebSocket server
      // For now, we'll simulate the connection
      console.log("[v0] Collaboration: Connecting to WebSocket server...")

      // Simulate connection delay
      setTimeout(() => {
        console.log("[v0] Collaboration: Connected successfully")
        this.reconnectAttempts = 0
        resolve()
      }, 500)
    })
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  send(event: CollaborationEvent) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.log("[v0] Collaboration: Simulating event broadcast:", event.type)
      // In production, this would send through WebSocket
      // For now, we'll just log it
      return
    }

    this.ws.send(JSON.stringify(event))
  }

  on(eventType: string, callback: (event: CollaborationEvent) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }
    this.listeners.get(eventType)!.add(callback)
  }

  off(eventType: string, callback: (event: CollaborationEvent) => void) {
    const listeners = this.listeners.get(eventType)
    if (listeners) {
      listeners.delete(callback)
    }
  }

  private emit(event: CollaborationEvent) {
    const listeners = this.listeners.get(event.type)
    if (listeners) {
      listeners.forEach((callback) => callback(event))
    }
  }

  private reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("[v0] Collaboration: Max reconnection attempts reached")
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

    console.log(`[v0] Collaboration: Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`)

    setTimeout(() => {
      this.connect().catch(() => this.reconnect())
    }, delay)
  }
}
