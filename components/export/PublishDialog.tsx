"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { PublishTarget } from "@/lib/types/export"
import { Publisher } from "@/lib/export/publisher"
import { Check, X, ExternalLink } from "lucide-react"

interface PublishDialogProps {
  exportUrl: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PublishDialog({ exportUrl, open, onOpenChange }: PublishDialogProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [publishing, setPublishing] = useState(false)
  const [results, setResults] = useState<any[]>([])

  const publisher = new Publisher()

  const platforms: PublishTarget[] = [
    { platform: "youtube", connected: true, accountName: "My Channel" },
    { platform: "instagram", connected: true, accountName: "@myaccount" },
    { platform: "tiktok", connected: false },
    { platform: "facebook", connected: true, accountName: "My Page" },
    { platform: "twitter", connected: false },
    { platform: "linkedin", connected: true, accountName: "My Profile" },
  ]

  const handlePublish = async () => {
    const targets = platforms.filter((p) => selectedPlatforms.includes(p.platform) && p.connected)

    setPublishing(true)

    const job = await publisher.publish("export-1", exportUrl, targets)

    // Poll for results
    const interval = setInterval(() => {
      const updatedJob = publisher.getJob(job.id)
      if (updatedJob) {
        setResults(updatedJob.results)
        if (updatedJob.status === "complete" || updatedJob.status === "error") {
          clearInterval(interval)
          setPublishing(false)
        }
      }
    }, 500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Publish to Social Media</DialogTitle>
        </DialogHeader>

        {!publishing && results.length === 0 ? (
          <div className="space-y-4">
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {platforms.map((platform) => (
                  <Card
                    key={platform.platform}
                    className={`cursor-pointer transition-colors ${
                      selectedPlatforms.includes(platform.platform) ? "ring-2 ring-primary" : ""
                    } ${!platform.connected ? "opacity-50" : ""}`}
                    onClick={() => {
                      if (platform.connected) {
                        setSelectedPlatforms((prev) =>
                          prev.includes(platform.platform)
                            ? prev.filter((p) => p !== platform.platform)
                            : [...prev, platform.platform],
                        )
                      }
                    }}
                  >
                    <CardContent className="p-3 flex items-center gap-3">
                      <Checkbox
                        checked={selectedPlatforms.includes(platform.platform)}
                        disabled={!platform.connected}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm capitalize">{platform.platform}</div>
                        {platform.connected ? (
                          <div className="text-xs text-muted-foreground">{platform.accountName}</div>
                        ) : (
                          <div className="text-xs text-muted-foreground">Not connected</div>
                        )}
                      </div>
                      {platform.connected ? (
                        <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="outline">Connect</Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((result) => (
              <Card key={result.platform}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm capitalize">{result.platform}</div>
                      {result.status === "success" && result.url && (
                        <a
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          View post <ExternalLink className="size-3" />
                        </a>
                      )}
                      {result.status === "error" && <div className="text-xs text-destructive">{result.error}</div>}
                    </div>
                    {result.status === "success" && <Check className="size-4 text-green-500" />}
                    {result.status === "error" && <X className="size-4 text-destructive" />}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <DialogFooter>
          {!publishing && results.length === 0 && (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handlePublish} disabled={selectedPlatforms.length === 0}>
                Publish to {selectedPlatforms.length} Platform{selectedPlatforms.length !== 1 ? "s" : ""}
              </Button>
            </>
          )}
          {results.length > 0 && <Button onClick={() => onOpenChange(false)}>Close</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
