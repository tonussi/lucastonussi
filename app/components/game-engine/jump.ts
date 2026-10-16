export function jumpVelocity(height: number, gravity: number, gravityScale: number) {
  return Math.sqrt(2 * Math.abs(gravity) * gravityScale * height)
}
