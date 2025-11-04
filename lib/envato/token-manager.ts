// Secure Envato token management
export class EnvatoTokenManager {
  private static instance: EnvatoTokenManager
  private token = ""

  private constructor() {
    this.loadToken()
  }

  static getInstance(): EnvatoTokenManager {
    if (!EnvatoTokenManager.instance) {
      EnvatoTokenManager.instance = new EnvatoTokenManager()
    }
    return EnvatoTokenManager.instance
  }

  private loadToken(): void {
    if (typeof window !== "undefined") {
      const encrypted = localStorage.getItem("envato_token")
      if (encrypted) {
        // In production, implement proper decryption
        this.token = encrypted
      }
    }
  }

  setToken(token: string): void {
    this.token = token
    if (typeof window !== "undefined") {
      // In production, implement proper encryption
      localStorage.setItem("envato_token", token)
    }
  }

  getToken(): string {
    return this.token
  }

  clearToken(): void {
    this.token = ""
    if (typeof window !== "undefined") {
      localStorage.removeItem("envato_token")
    }
  }

  async validateToken(): Promise<boolean> {
    if (!this.token) return false

    try {
      const response = await fetch("/api/envato/validate", {
        headers: this.getHeaders(),
      })
      return response.ok
    } catch {
      return false
    }
  }

  getHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.token}`,
      "User-Agent": "StudioPro-Editor/1.0",
      "Content-Type": "application/json",
    }
  }
}
