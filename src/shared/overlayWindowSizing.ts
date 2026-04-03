export const GAP_OVERLAY_RENDER_SCALE = 0.8

export function getOverlayWindowScale(id: string): number {
  return id === 'OVERLAY-GAP' ? GAP_OVERLAY_RENDER_SCALE : 1
}
