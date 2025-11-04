export const DEPLOYMENT_CONFIG = {
  // Environment
  environment: process.env.NODE_ENV || "development",

  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
    timeout: 30000,
    retries: 3,
  },

  // Envato Integration
  envato: {
    apiUrl: "https://api.envato.com",
    rateLimit: 1000, // requests per hour
    cacheTimeout: 24 * 60 * 60 * 1000, // 24 hours
  },

  // Storage Limits
  storage: {
    maxFileSize: 500 * 1024 * 1024, // 500MB
    maxProjectSize: 5 * 1024 * 1024 * 1024, // 5GB
    allowedFormats: ["mp4", "mov", "avi", "webm", "jpg", "png", "gif", "mp3", "wav"],
  },

  // Export Configuration
  export: {
    maxResolution: "4k",
    maxDuration: 3600, // 1 hour
    maxConcurrentExports: 3,
    formats: ["mp4", "webm", "mov"],
  },

  // Collaboration
  collaboration: {
    websocketUrl: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001",
    maxCollaborators: 10,
    presenceTimeout: 30000, // 30 seconds
  },

  // Performance
  performance: {
    enableWebWorkers: true,
    enableWebGL: true,
    enableVirtualization: true,
    chunkSize: 100,
    cacheSize: 1000,
  },

  // Security
  security: {
    enableCSRF: true,
    enableCORS: true,
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000"],
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  },

  // Analytics
  analytics: {
    enabled: process.env.ENABLE_ANALYTICS === "true",
    provider: "vercel",
    trackingId: process.env.ANALYTICS_ID,
  },

  // Feature Flags
  features: {
    templates: true,
    collaboration: true,
    cloudStorage: true,
    socialPublishing: true,
    advancedEffects: true,
    aiFeatures: false, // Coming soon
  },
}
