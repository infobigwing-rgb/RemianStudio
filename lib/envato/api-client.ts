import { EnvatoTokenManager } from "./token-manager"
import type { EnvatoAsset } from "../types/editor"

// Rate-limited API client for single user
export class EnvatoAPIClient {
  private requestQueue: Array<() => Promise<any>> = []
  private processing = false
  private tokenManager: EnvatoTokenManager

  constructor() {
    this.tokenManager = EnvatoTokenManager.getInstance()
  }

  async searchTemplates(query: string, page = 1): Promise<EnvatoAsset[]> {
    return this.queueRequest(async () => {
      const response = await fetch(`/api/envato/search?q=${encodeURIComponent(query)}&page=${page}`, {
        headers: this.tokenManager.getHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`)
      }

      const data = await response.json()
      return data.results || []
    })
  }

  async getAssetDetails(itemId: string): Promise<EnvatoAsset | null> {
    return this.queueRequest(async () => {
      const response = await fetch(`/api/envato/item/${itemId}`, {
        headers: this.tokenManager.getHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Failed to get asset: ${response.status}`)
      }

      return response.json()
    })
  }

  async downloadAsset(itemId: string): Promise<string> {
    return this.queueRequest(async () => {
      const response = await fetch(`/api/envato/download/${itemId}`, {
        headers: this.tokenManager.getHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`)
      }

      const data = await response.json()
      return data.downloadUrl
    })
  }

  private async queueRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          // Rate limiting: 1 request per 200ms (max 300/min)
          await new Promise((r) => setTimeout(r, 200))
          const result = await requestFn()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })

      if (!this.processing) {
        this.processQueue()
      }
    })
  }

  private async processQueue(): Promise<void> {
    this.processing = true
    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift()
      if (request) {
        await request()
      }
    }
    this.processing = false
  }
}
