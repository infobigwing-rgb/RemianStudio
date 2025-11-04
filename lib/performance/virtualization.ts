export interface VirtualItem {
  index: number
  start: number
  size: number
  end: number
}

export class VirtualScroller {
  private scrollTop = 0
  private containerHeight = 0
  private itemHeight: number
  private itemCount: number
  private overscan: number

  constructor(itemHeight: number, itemCount: number, overscan = 3) {
    this.itemHeight = itemHeight
    this.itemCount = itemCount
    this.overscan = overscan
  }

  setScrollTop(scrollTop: number) {
    this.scrollTop = scrollTop
  }

  setContainerHeight(height: number) {
    this.containerHeight = height
  }

  getVirtualItems(): VirtualItem[] {
    const startIndex = Math.max(0, Math.floor(this.scrollTop / this.itemHeight) - this.overscan)
    const endIndex = Math.min(
      this.itemCount - 1,
      Math.ceil((this.scrollTop + this.containerHeight) / this.itemHeight) + this.overscan,
    )

    const items: VirtualItem[] = []
    for (let i = startIndex; i <= endIndex; i++) {
      items.push({
        index: i,
        start: i * this.itemHeight,
        size: this.itemHeight,
        end: (i + 1) * this.itemHeight,
      })
    }

    return items
  }

  getTotalSize(): number {
    return this.itemCount * this.itemHeight
  }
}
