export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  description: string
  action: () => void
}

export class KeyboardShortcutManager {
  private shortcuts: Map<string, KeyboardShortcut> = new Map()
  private enabled = true

  register(id: string, shortcut: KeyboardShortcut) {
    this.shortcuts.set(id, shortcut)
  }

  unregister(id: string) {
    this.shortcuts.delete(id)
  }

  handleKeyDown(event: KeyboardEvent): boolean {
    if (!this.enabled) return false

    for (const [id, shortcut] of this.shortcuts) {
      if (this.matchesShortcut(event, shortcut)) {
        event.preventDefault()
        shortcut.action()
        return true
      }
    }

    return false
  }

  private matchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
    if (event.key.toLowerCase() !== shortcut.key.toLowerCase()) return false
    if (!!event.ctrlKey !== !!shortcut.ctrl) return false
    if (!!event.shiftKey !== !!shortcut.shift) return false
    if (!!event.altKey !== !!shortcut.alt) return false
    if (!!event.metaKey !== !!shortcut.meta) return false
    return true
  }

  getShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values())
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled
  }
}
