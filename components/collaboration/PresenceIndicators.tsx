"use client"

import { useMemo } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Presence } from "@/lib/types/collaboration"

interface PresenceIndicatorsProps {
  presences: Presence[]
  currentUserId: string
}

export function PresenceIndicators({ presences, currentUserId }: PresenceIndicatorsProps) {
  const otherUsers = useMemo(() => {
    return presences.filter((p) => p.userId !== currentUserId)
  }, [presences, currentUserId])

  if (otherUsers.length === 0) return null

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Editing:</span>
      <div className="flex -space-x-2">
        {otherUsers.slice(0, 3).map((presence) => (
          <Avatar
            key={presence.userId}
            className="size-8 border-2 border-background"
            style={{ borderColor: presence.user.color }}
          >
            <AvatarImage src={presence.user.avatar || "/placeholder.svg"} />
            <AvatarFallback style={{ backgroundColor: presence.user.color }}>
              {presence.user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      {otherUsers.length > 3 && (
        <Badge variant="secondary" className="text-xs">
          +{otherUsers.length - 3}
        </Badge>
      )}
    </div>
  )
}
