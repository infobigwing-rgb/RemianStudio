export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  color: string
}

export interface Presence {
  userId: string
  user: User
  cursor?: { x: number; y: number }
  selectedLayerId?: string
  lastActive: number
}

export interface Comment {
  id: string
  userId: string
  user: User
  content: string
  timelinePosition: number
  layerId?: string
  createdAt: Date
  resolved: boolean
  replies: CommentReply[]
}

export interface CommentReply {
  id: string
  userId: string
  user: User
  content: string
  createdAt: Date
}

export interface ProjectVersion {
  id: string
  projectId: string
  name: string
  description?: string
  createdBy: User
  createdAt: Date
  snapshot: any
  parentVersionId?: string
}

export interface CollaborationSession {
  id: string
  projectId: string
  users: User[]
  presences: Map<string, Presence>
  comments: Comment[]
  currentVersion: ProjectVersion
  versions: ProjectVersion[]
}
