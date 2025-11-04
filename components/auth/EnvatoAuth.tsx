"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, LogIn, LogOut, CheckCircle2 } from "lucide-react"

interface EnvatoAuthProps {
  onAuthChange?: (isAuthenticated: boolean) => void
}

export function EnvatoAuth({ onAuthChange }: EnvatoAuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userInfo, setUserInfo] = useState<{ username?: string; email?: string } | null>(null)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/envato/auth/status")
      if (response.ok) {
        const data = await response.json()
        setIsAuthenticated(data.authenticated)
        setUserInfo(data.user)
        onAuthChange?.(data.authenticated)
      }
    } catch (error) {
      console.error("Failed to check auth status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignIn = () => {
    // Redirect to OAuth flow
    window.location.href = "/api/envato/auth/signin"
  }

  const handleSignOut = async () => {
    try {
      await fetch("/api/envato/auth/signout", { method: "POST" })
      setIsAuthenticated(false)
      setUserInfo(null)
      onAuthChange?.(false)
    } catch (error) {
      console.error("Failed to sign out:", error)
    }
  }

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </Card>
    )
  }

  if (isAuthenticated && userInfo) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm font-medium">Connected to Envato</p>
              <p className="text-xs text-muted-foreground">{userInfo.username || userInfo.email}</p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-1" />
            Sign Out
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <div className="text-center space-y-3">
        <div>
          <h3 className="font-medium text-sm mb-1">Connect to Envato Elements</h3>
          <p className="text-xs text-muted-foreground">Sign in to access your Envato Elements subscription templates</p>
        </div>
        <Button onClick={handleSignIn} className="w-full">
          <LogIn className="h-4 w-4 mr-2" />
          Sign in with Envato
        </Button>
      </div>
    </Card>
  )
}
