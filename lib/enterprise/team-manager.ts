import type { Team, TeamMember, BrandKit, Analytics } from "@/lib/types/enterprise"

export class TeamManager {
  async createTeam(name: string, ownerId: string): Promise<Team> {
    const team: Team = {
      id: crypto.randomUUID(),
      name,
      plan: "free",
      members: [
        {
          userId: ownerId,
          email: "",
          name: "",
          role: "owner",
          joinedAt: new Date(),
          lastActive: new Date(),
        },
      ],
      settings: {
        allowGuestAccess: false,
        requireApproval: true,
        enableSSO: false,
        webhooks: [],
        storageLimit: 10 * 1024 * 1024 * 1024, // 10GB
        exportLimit: 100,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await this.saveTeam(team)
    return team
  }

  async addMember(teamId: string, email: string, role: TeamMember["role"]): Promise<void> {
    const team = await this.getTeam(teamId)

    const member: TeamMember = {
      userId: crypto.randomUUID(),
      email,
      name: email.split("@")[0],
      role,
      joinedAt: new Date(),
      lastActive: new Date(),
    }

    team.members.push(member)
    await this.saveTeam(team)
  }

  async updateMemberRole(teamId: string, userId: string, role: TeamMember["role"]): Promise<void> {
    const team = await this.getTeam(teamId)
    const member = team.members.find((m) => m.userId === userId)

    if (member) {
      member.role = role
      await this.saveTeam(team)
    }
  }

  async removeMember(teamId: string, userId: string): Promise<void> {
    const team = await this.getTeam(teamId)
    team.members = team.members.filter((m) => m.userId !== userId)
    await this.saveTeam(team)
  }

  async createBrandKit(teamId: string, brandKit: Omit<BrandKit, "id" | "teamId">): Promise<BrandKit> {
    const kit: BrandKit = {
      id: crypto.randomUUID(),
      teamId,
      ...brandKit,
    }

    const team = await this.getTeam(teamId)
    team.brandKit = kit
    await this.saveTeam(team)

    return kit
  }

  async getAnalytics(teamId: string, period: Analytics["period"]): Promise<Analytics> {
    // In production, this would query actual analytics data
    return {
      teamId,
      period,
      metrics: {
        projectsCreated: 45,
        projectsExported: 32,
        storageUsed: 5.2 * 1024 * 1024 * 1024,
        activeUsers: 8,
        exportMinutes: 240,
        collaborationSessions: 15,
      },
      topUsers: [],
      topProjects: [],
    }
  }

  private async getTeam(teamId: string): Promise<Team> {
    // In production, fetch from database
    const stored = localStorage.getItem(`team_${teamId}`)
    if (!stored) throw new Error("Team not found")
    return JSON.parse(stored)
  }

  private async saveTeam(team: Team): Promise<void> {
    // In production, save to database
    localStorage.setItem(`team_${team.id}`, JSON.stringify(team))
  }
}
