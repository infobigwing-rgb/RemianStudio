"use client"

import { useState } from "react"
import type { BrandKit } from "@/lib/types/enterprise"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Palette, Type } from "lucide-react"

interface BrandKitEditorProps {
  brandKit?: BrandKit
  onSave: (brandKit: Omit<BrandKit, "id" | "teamId">) => void
}

export function BrandKitEditor({ brandKit, onSave }: BrandKitEditorProps) {
  const [name, setName] = useState(brandKit?.name || "")
  const [colors, setColors] = useState(
    brandKit?.colors || {
      primary: "#3b82f6",
      secondary: "#8b5cf6",
      accent: "#10b981",
      background: "#ffffff",
      text: "#000000",
    },
  )
  const [fonts, setFonts] = useState(
    brandKit?.fonts || {
      heading: "Inter",
      body: "Inter",
    },
  )

  const handleSave = () => {
    onSave({
      name,
      colors,
      fonts,
      logos: brandKit?.logos || { main: "", icon: "" },
      templates: brandKit?.templates || [],
      exportPresets: brandKit?.exportPresets || [],
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Brand Kit</h2>
        <p className="text-muted-foreground">
          Define your brand colors, fonts, and assets for consistent video production
        </p>
      </div>

      <Card className="p-4 space-y-4">
        <div>
          <Label>Brand Kit Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Brand Kit" />
        </div>
      </Card>

      <Card className="p-4 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Brand Colors</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(colors).map(([key, value]) => (
            <div key={key}>
              <Label className="capitalize">{key}</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={value}
                  onChange={(e) => setColors({ ...colors, [key]: e.target.value })}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={value}
                  onChange={(e) => setColors({ ...colors, [key]: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Type className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Typography</h3>
        </div>
        <div className="space-y-4">
          <div>
            <Label>Heading Font</Label>
            <Input
              value={fonts.heading}
              onChange={(e) => setFonts({ ...fonts, heading: e.target.value })}
              placeholder="Inter"
            />
          </div>
          <div>
            <Label>Body Font</Label>
            <Input
              value={fonts.body}
              onChange={(e) => setFonts({ ...fonts, body: e.target.value })}
              placeholder="Inter"
            />
          </div>
        </div>
      </Card>

      <Button onClick={handleSave} className="w-full">
        Save Brand Kit
      </Button>
    </div>
  )
}
