"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Keyboard } from "lucide-react"

interface KeyboardShortcutsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  const shortcuts = [
    {
      category: "Playback",
      items: [
        { keys: ["Space"], description: "Play/Pause" },
        { keys: ["J"], description: "Rewind 5 seconds" },
        { keys: ["K"], description: "Play/Pause" },
        { keys: ["L"], description: "Forward 5 seconds" },
        { keys: ["Home"], description: "Go to start" },
        { keys: ["End"], description: "Go to end" },
      ],
    },
    {
      category: "Editing",
      items: [
        { keys: ["Ctrl", "Z"], description: "Undo" },
        { keys: ["Ctrl", "Shift", "Z"], description: "Redo" },
        { keys: ["Ctrl", "C"], description: "Copy layer" },
        { keys: ["Ctrl", "V"], description: "Paste layer" },
        { keys: ["Ctrl", "X"], description: "Cut layer" },
        { keys: ["Delete"], description: "Delete selected layer" },
        { keys: ["Ctrl", "D"], description: "Duplicate layer" },
      ],
    },
    {
      category: "Timeline",
      items: [
        { keys: ["I"], description: "Set in point" },
        { keys: ["O"], description: "Set out point" },
        { keys: ["+"], description: "Zoom in timeline" },
        { keys: ["-"], description: "Zoom out timeline" },
        { keys: ["Shift", "Z"], description: "Fit timeline to window" },
      ],
    },
    {
      category: "Layers",
      items: [
        { keys: ["Ctrl", "T"], description: "Add text layer" },
        { keys: ["Ctrl", "I"], description: "Add image layer" },
        { keys: ["Ctrl", "Shift", "V"], description: "Add video layer" },
        { keys: ["↑"], description: "Select layer above" },
        { keys: ["↓"], description: "Select layer below" },
      ],
    },
    {
      category: "View",
      items: [
        { keys: ["Ctrl", "1"], description: "Fit to window" },
        { keys: ["Ctrl", "2"], description: "100% zoom" },
        { keys: ["Ctrl", "3"], description: "200% zoom" },
        { keys: ["F"], description: "Toggle fullscreen" },
        { keys: ["Ctrl", "/"], description: "Show shortcuts" },
      ],
    },
    {
      category: "File",
      items: [
        { keys: ["Ctrl", "S"], description: "Save project" },
        { keys: ["Ctrl", "Shift", "S"], description: "Save as" },
        { keys: ["Ctrl", "E"], description: "Export" },
        { keys: ["Ctrl", "Shift", "E"], description: "Batch export" },
      ],
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="size-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[500px]">
          <div className="space-y-6 pr-4">
            {shortcuts.map((category) => (
              <div key={category.category}>
                <h3 className="text-sm font-semibold mb-3">{category.category}</h3>
                <div className="space-y-2">
                  {category.items.map((item, index) => (
                    <Card key={index}>
                      <CardContent className="p-3 flex items-center justify-between">
                        <span className="text-sm">{item.description}</span>
                        <div className="flex items-center gap-1">
                          {item.keys.map((key, keyIndex) => (
                            <span key={keyIndex} className="flex items-center gap-1">
                              <Badge variant="outline" className="font-mono">
                                {key}
                              </Badge>
                              {keyIndex < item.keys.length - 1 && <span className="text-muted-foreground">+</span>}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
