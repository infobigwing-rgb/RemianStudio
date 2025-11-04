"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CloudStorageManager } from "@/lib/media/cloud-storage"
import type { CloudStorage } from "@/lib/types/media"
import { Cloud, Check, X, Download } from "lucide-react"

export function CloudStoragePanel() {
  const [connections, setConnections] = useState<CloudStorage[]>([])
  const [connecting, setConnecting] = useState<string | null>(null)
  const storageManager = new CloudStorageManager()

  const providers: Array<{ id: CloudStorage["provider"]; name: string; icon: string }> = [
    { id: "google-drive", name: "Google Drive", icon: "🔵" },
    { id: "dropbox", name: "Dropbox", icon: "🔷" },
    { id: "onedrive", name: "OneDrive", icon: "🔶" },
  ]

  const handleConnect = async (provider: CloudStorage["provider"]) => {
    setConnecting(provider)
    try {
      await storageManager.connect(provider)
      const connection = storageManager.getConnection(provider)
      if (connection) {
        setConnections((prev) => [...prev.filter((c) => c.provider !== provider), connection])
      }
    } catch (error) {
      console.error("[v0] Connection failed:", error)
    } finally {
      setConnecting(null)
    }
  }

  const handleDisconnect = (provider: CloudStorage["provider"]) => {
    storageManager.disconnect(provider)
    setConnections((prev) => prev.filter((c) => c.provider !== provider))
  }

  const formatQuota = (bytes: number) => {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Cloud className="size-5" />
          <h2 className="text-lg font-semibold">Cloud Storage</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-1">Connect your cloud storage to import and export media</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {providers.map((provider) => {
            const connection = connections.find((c) => c.provider === provider.id)
            const isConnecting = connecting === provider.id

            return (
              <Card key={provider.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{provider.icon}</span>
                      <CardTitle className="text-base">{provider.name}</CardTitle>
                    </div>
                    {connection?.connected ? (
                      <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                        <Check className="size-3 mr-1" />
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="outline">Not Connected</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {connection?.connected ? (
                    <>
                      <div className="text-sm">
                        <p className="text-muted-foreground mb-1">Account: {connection.email}</p>
                        {connection.quota && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span>Storage Used</span>
                              <span>
                                {formatQuota(connection.quota.used)} / {formatQuota(connection.quota.total)}
                              </span>
                            </div>
                            <Progress value={(connection.quota.used / connection.quota.total) * 100} />
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                          <Download className="size-3 mr-1" />
                          Import
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDisconnect(provider.id)}>
                          <X className="size-3 mr-1" />
                          Disconnect
                        </Button>
                      </div>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleConnect(provider.id)}
                      disabled={isConnecting}
                      className="w-full"
                    >
                      {isConnecting ? "Connecting..." : "Connect"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
