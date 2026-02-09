export type Coord = { x: number; y: number }

export function inBounds(
  width: number,
  height: number,
  x: number,
  y: number,
): boolean {
  return x >= 0 && x < width && y >= 0 && y < height
}

export function xyToIndex(width: number, x: number, y: number): number {
  return y * width + x
}

export function indexToX(width: number, index: number): number {
  return index % width
}

export function indexToY(width: number, index: number): number {
  return Math.floor(index / width)
}

export function forEachNeighborIndex(
  width: number,
  height: number,
  index: number,
  fn: (neighborIndex: number) => void,
): void {
  const x0 = indexToX(width, index)
  const y0 = indexToY(width, index)
  for (let dy = -1; dy <= 1; dy += 1) {
    for (let dx = -1; dx <= 1; dx += 1) {
      if (dx === 0 && dy === 0) continue
      const x = x0 + dx
      const y = y0 + dy
      if (!inBounds(width, height, x, y)) continue
      fn(xyToIndex(width, x, y))
    }
  }
}

export function neighborIndices(
  width: number,
  height: number,
  index: number,
): number[] {
  const out: number[] = []
  forEachNeighborIndex(width, height, index, (n) => out.push(n))
  return out
}

