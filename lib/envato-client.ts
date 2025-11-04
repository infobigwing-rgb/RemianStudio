const ENVATO_TOKEN = process.env.ENVATO_API_TOKEN

export class EnvatoClient {
  private baseUrl = "https://api.envato.com"

  private async request(endpoint: string, options?: RequestInit) {
    if (!ENVATO_TOKEN) {
      throw new Error("Envato API token not configured")
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${ENVATO_TOKEN}`,
        "User-Agent": "VideoEditor/1.0",
        ...options?.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`Envato API error: ${response.status}`)
    }

    return response.json()
  }

  async searchTemplates(query: string, category = "video-templates") {
    return this.request(`/v1/market/search?q=${encodeURIComponent(query)}&site=${category}`)
  }

  async getItemDetails(itemId: string) {
    return this.request(`/v1/market/item?id=${itemId}`)
  }

  async getUserPurchases() {
    return this.request("/v3/market/buyer/list-purchases")
  }
}

export const envatoClient = new EnvatoClient()
