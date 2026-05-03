export const SWATCHES = [
  'oklch(0.65 0.12 50)',
  'oklch(0.6 0.1 145)',
  'oklch(0.62 0.12 30)',
  'oklch(0.6 0.08 210)',
  'oklch(0.58 0.1 330)',
  'oklch(0.65 0.1 90)',
]

export function recipeSwatch(id: number): string {
  return SWATCHES[id % SWATCHES.length]
}
