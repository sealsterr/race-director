export const CENTER_FLOW_ROWS = [
  { width: 262, packet: 122, y: -28, delay: 0, inset: 8 },
  { width: 198, packet: 88, y: -10, delay: 0.12, inset: 28 },
  { width: 292, packet: 136, y: 10, delay: 0.22, inset: 0 },
  { width: 214, packet: 96, y: 28, delay: 0.34, inset: 20 }
] as const

export function flowMask(side: 'left' | 'right'): string {
  return side === 'left'
    ? 'linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 78%, rgba(0,0,0,0.7) 90%, rgba(0,0,0,0) 100%)'
    : 'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 10%, rgba(0,0,0,1) 22%, rgba(0,0,0,1) 100%)'
}
