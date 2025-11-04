"use client"

import { useState, useEffect } from "react"
import type { Analytics } from "@/lib/types/enterprise"
import { TeamManager } from "@/lib/enterprise/team-manager"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, TrendingUp, Users, Video, HardDrive, Clock } from "lucide-react"

interface AnalyticsDashboardProps {
  teamId: string
}

export function AnalyticsDashboard({ teamId }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [period, setPeriod] = useState<Analytics["period"]>("month")
  const teamManager = new TeamManager()

  useEffect(() => {
    loadAnalytics()
  }, [teamId, period])

  const loadAnalytics = async () => {
    const data = await teamManager.getAnalytics(teamId, period)
    setAnalytics(data)
  }

  if (!analytics) {
    return <div className="p-8 text-center">Loading analytics...</div>
  }

  const formatBytes = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024)
    return `${gb.toFixed(1)} GB`
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6" />
          <h2 className="text-2xl font-bold">Analytics</h2>
        </div>
        <Select value={period} onValueChange={(v) => setPeriod(v as Analytics["period"])}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Projects Created</p>
            <Video className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-3xl font-bold">{analytics.metrics.projectsCreated}</p>
          <p className="text-xs text-green-500 mt-1">
            <TrendingUp className="w-3 h-3 inline mr-1" />
            +12% from last {period}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Projects Exported</p>
            <Video className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-3xl font-bold">{analytics.metrics.projectsExported}</p>
          <p className="text-xs text-green-500 mt-1">
            <TrendingUp className="w-3 h-3 inline mr-1" />
            +8% from last {period}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Active Users</p>
            <Users className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-3xl font-bold">{analytics.metrics.activeUsers}</p>
          <p className="text-xs text-green-500 mt-1">
            <TrendingUp className="w-3 h-3 inline mr-1" />
            +15% from last {period}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Storage Used</p>
            <HardDrive className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-3xl font-bold">{formatBytes(analytics.metrics.storageUsed)}</p>
          <p className="text-xs text-muted-foreground mt-1">of 10 GB</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Export Minutes</p>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-3xl font-bold">{analytics.metrics.exportMinutes}</p>
          <p className="text-xs text-muted-foreground mt-1">total rendering time</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Collaboration Sessions</p>
            <Users className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-3xl font-bold">{analytics.metrics.collaborationSessions}</p>
          <p className="text-xs text-green-500 mt-1">
            <TrendingUp className="w-3 h-3 inline mr-1" />
            +20% from last {period}
          </p>
        </Card>
      </div>
    </div>
  )
}
