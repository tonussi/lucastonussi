const UINT32_RANGE = 4294967296

export function createRandom(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let mixed = Math.imul(state ^ (state >>> 15), state | 1)
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61)
    return ((mixed ^ (mixed >>> 14)) >>> 0) / UINT32_RANGE
  }
}

export function between(random: () => number, min: number, max: number) {
  return min + random() * (max - min)
}

export function clampRange(value: number, { min, max }: { min: number; max: number }) {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min))
}

export function clampIntegerRange(value: number, range: { min: number; max: number }) {
  return Math.round(clampRange(value, range))
}
