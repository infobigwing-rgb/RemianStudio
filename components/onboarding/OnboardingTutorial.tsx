"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, ChevronLeft, ChevronRight, Check } from "lucide-react"

interface TutorialStep {
  title: string
  description: string
  target?: string
  action?: string
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: "Welcome to StudioPro",
    description: "A professional video editor built for the web. Let's take a quick tour of the key features.",
  },
  {
    title: "Import Templates",
    description: "Browse and import professional templates from Envato Elements. Click the Assets tab to get started.",
    target: "asset-browser",
    action: "Click Assets Tab",
  },
  {
    title: "Customize Templates",
    description:
      "Replace placeholders with your own content. Edit text, swap images, and adjust colors to match your brand.",
    target: "template-customizer",
  },
  {
    title: "Timeline Editing",
    description:
      "Arrange clips, add transitions, and create keyframe animations. Drag clips to reorder and trim edges to adjust timing.",
    target: "timeline",
  },
  {
    title: "Add Transitions",
    description: "Apply professional transitions between clips. Choose from crossfade, slide, zoom, and more.",
    target: "transitions-panel",
  },
  {
    title: "Keyframe Animation",
    description: "Create smooth animations by setting keyframes for position, scale, rotation, and opacity.",
    target: "keyframe-editor",
  },
  {
    title: "Collaborate in Real-time",
    description: "Invite team members to edit together. See live cursors, add comments, and track changes.",
    target: "collaboration",
  },
  {
    title: "Export & Publish",
    description:
      "Export your video with platform-specific presets for YouTube, Instagram, TikTok, and more. Or publish directly to social media.",
    target: "export-button",
  },
]

export function OnboardingTutorial() {
  const [isOpen, setIsOpen] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)

  if (!isOpen) return null

  const step = TUTORIAL_STEPS[currentStep]
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1

  const handleNext = () => {
    if (isLastStep) {
      setIsOpen(false)
      localStorage.setItem("onboarding_completed", "true")
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    setIsOpen(false)
    localStorage.setItem("onboarding_skipped", "true")
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {TUTORIAL_STEPS.length}
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">{step.title}</h3>
            <p className="text-muted-foreground">{step.description}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSkip}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex gap-1">
          {TUTORIAL_STEPS.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full transition-colors ${
                index <= currentStep ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between pt-4">
          <Button variant="ghost" onClick={handlePrevious} disabled={currentStep === 0}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <Button onClick={handleNext}>
            {isLastStep ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Get Started
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  )
}
