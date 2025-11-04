export interface Team {
  id: string
  name: string
  plan: "free" | "pro" | "enterprise"
  members: TeamMember[]
  brandKit?: BrandKit
  settings: TeamSettings
  createdAt: Date
  updatedAt: Date
}

export interface TeamMember {
  userId: string
  email: string
  name: string
  role: "owner" | "admin" | "editor" | "viewer"
  avatar?: string
  joinedAt: Date
  lastActive: Date
}

export interface BrandKit {
  id: string
  teamId: string
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
  }
  fonts: {
    heading: string
    body: string
  }
  logos: {
    main: string
    icon: string
    watermark?: string
  }
  templates: string[]
  exportPresets: any[] // Placeholder for ExportPreset until it is declared
}

export interface TeamSettings {
  allowGuestAccess: boolean
  requireApproval: boolean
  enableSSO: boolean
  ssoProvider?: "google" | "microsoft" | "okta" | "auth0"
  webhooks: Webhook[]
  storageLimit: number
  exportLimit: number
}

export interface Webhook {
  id: string
  url: string
  events: WebhookEvent[]
  secret: string
  enabled: boolean
}

export type WebhookEvent =
  | "project.created"
  | "project.updated"
  | "project.exported"
  | "project.shared"
  | "comment.added"
  | "version.created"

export interface Analytics {
  teamId: string
  period: "day" | "week" | "month" | "year"
  metrics: {
    projectsCreated: number
    projectsExported: number
    storageUsed: number
    activeUsers: number
    exportMinutes: number
    collaborationSessions: number
  }
  topUsers: {
    userId: string
    name: string
    projectsCreated: number
    exportsCompleted: number
  }[]
  topProjects: {
    projectId: string
    name: string
    views: number
    exports: number
    collaborators: number
  }[]
}

// Placeholder declaration for ExportPreset
export interface ExportPreset {
  id: string
  name: string
  settings: any // Define settings as needed
}
