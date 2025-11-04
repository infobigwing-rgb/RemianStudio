"use client"

import { useState, useEffect } from "react"
import type { Team, TeamMember } from "@/lib/types/enterprise"
import { TeamManager } from "@/lib/enterprise/team-manager"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, UserPlus, Trash2 } from "lucide-react"

interface TeamManagementProps {
  teamId: string
}

export function TeamManagement({ teamId }: TeamManagementProps) {
  const [team, setTeam] = useState<Team | null>(null)
  const [newMemberEmail, setNewMemberEmail] = useState("")
  const [newMemberRole, setNewMemberRole] = useState<TeamMember["role"]>("editor")
  const teamManager = new TeamManager()

  useEffect(() => {
    loadTeam()
  }, [teamId])

  const loadTeam = async () => {
    try {
      const teamData = await teamManager["getTeam"](teamId)
      setTeam(teamData)
    } catch (error) {
      console.error("Failed to load team:", error)
    }
  }

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) return

    try {
      await teamManager.addMember(teamId, newMemberEmail, newMemberRole)
      setNewMemberEmail("")
      await loadTeam()
    } catch (error) {
      console.error("Failed to add member:", error)
    }
  }

  const handleUpdateRole = async (userId: string, role: TeamMember["role"]) => {
    try {
      await teamManager.updateMemberRole(teamId, userId, role)
      await loadTeam()
    } catch (error) {
      console.error("Failed to update role:", error)
    }
  }

  const handleRemoveMember = async (userId: string) => {
    try {
      await teamManager.removeMember(teamId, userId)
      await loadTeam()
    } catch (error) {
      console.error("Failed to remove member:", error)
    }
  }

  if (!team) {
    return <div className="p-8 text-center">Loading team...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6" />
          <div>
            <h2 className="text-2xl font-bold">{team.name}</h2>
            <p className="text-sm text-muted-foreground">
              {team.members.length} members · {team.plan} plan
            </p>
          </div>
        </div>
      </div>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Add Team Member</h3>
        <div className="flex gap-2">
          <Input
            placeholder="Email address"
            value={newMemberEmail}
            onChange={(e) => setNewMemberEmail(e.target.value)}
            className="flex-1"
          />
          <Select value={newMemberRole} onValueChange={(v) => setNewMemberRole(v as TeamMember["role"])}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="viewer">Viewer</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAddMember}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Team Members</h3>
        <div className="space-y-2">
          {team.members.map((member) => (
            <div key={member.userId} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={member.role}
                  onValueChange={(v) => handleUpdateRole(member.userId, v as TeamMember["role"])}
                  disabled={member.role === "owner"}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                  </SelectContent>
                </Select>
                {member.role !== "owner" && (
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveMember(member.userId)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
