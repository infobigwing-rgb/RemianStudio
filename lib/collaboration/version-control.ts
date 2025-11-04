import type { EditorProject, Layer } from "../types/editor"
import type { ProjectVersion, User } from "../types/collaboration"

export class VersionControl {
  private versions: ProjectVersion[] = []
  private currentVersionId: string | null = null

  /**
   * Create a new version snapshot
   */
  createVersion(
    project: EditorProject,
    layers: Layer[],
    user: User,
    name: string,
    description?: string,
  ): ProjectVersion {
    const version: ProjectVersion = {
      id: `version-${Date.now()}`,
      projectId: project.id,
      name,
      description,
      createdBy: user,
      createdAt: new Date(),
      snapshot: {
        project: { ...project },
        layers: layers.map((l) => ({ ...l })),
      },
      parentVersionId: this.currentVersionId || undefined,
    }

    this.versions.push(version)
    this.currentVersionId = version.id

    return version
  }

  /**
   * Get all versions for a project
   */
  getVersions(): ProjectVersion[] {
    return [...this.versions].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  /**
   * Get a specific version
   */
  getVersion(versionId: string): ProjectVersion | null {
    return this.versions.find((v) => v.id === versionId) || null
  }

  /**
   * Restore a version
   */
  restoreVersion(versionId: string): { project: EditorProject; layers: Layer[] } | null {
    const version = this.getVersion(versionId)
    if (!version) return null

    this.currentVersionId = versionId

    return {
      project: { ...version.snapshot.project },
      layers: version.snapshot.layers.map((l: Layer) => ({ ...l })),
    }
  }

  /**
   * Compare two versions
   */
  compareVersions(
    versionId1: string,
    versionId2: string,
  ): {
    layersAdded: Layer[]
    layersRemoved: Layer[]
    layersModified: Layer[]
  } {
    const v1 = this.getVersion(versionId1)
    const v2 = this.getVersion(versionId2)

    if (!v1 || !v2) {
      return { layersAdded: [], layersRemoved: [], layersModified: [] }
    }

    const layers1 = v1.snapshot.layers as Layer[]
    const layers2 = v2.snapshot.layers as Layer[]

    const layersAdded = layers2.filter((l2) => !layers1.find((l1) => l1.id === l2.id))
    const layersRemoved = layers1.filter((l1) => !layers2.find((l2) => l2.id === l1.id))
    const layersModified = layers2.filter((l2) => {
      const l1 = layers1.find((l) => l.id === l2.id)
      return l1 && JSON.stringify(l1) !== JSON.stringify(l2)
    })

    return { layersAdded, layersRemoved, layersModified }
  }

  /**
   * Get version history tree
   */
  getVersionTree(): any {
    const tree: any = {}

    this.versions.forEach((version) => {
      if (!version.parentVersionId) {
        tree[version.id] = { version, children: [] }
      }
    })

    this.versions.forEach((version) => {
      if (version.parentVersionId && tree[version.parentVersionId]) {
        tree[version.parentVersionId].children.push({
          version,
          children: [],
        })
      }
    })

    return Object.values(tree)
  }
}
