export function randomSeed(): string {
  // URL-safe-ish: hex only.
  const buf = new Uint32Array(2)
  crypto.getRandomValues(buf)
  return `${buf[0].toString(16).padStart(8, '0')}${buf[1].toString(16).padStart(8, '0')}`
}

