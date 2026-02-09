export function hashU32(n: number): number {
  // Murmur-inspired finalizer.
  let x = n >>> 0
  x ^= x >>> 16
  x = Math.imul(x, 0x7feb352d)
  x ^= x >>> 15
  x = Math.imul(x, 0x846ca68b)
  x ^= x >>> 16
  return x >>> 0
}

export function u32ToUnit(x: number): number {
  return (x >>> 0) / 4294967296
}

