import type { TyreCompound, TyreSet } from '../../../types/lmu'
import { normalizeTyreCompound, type TyreCompoundKey } from '../tower/constants'

export function getGapTyreLayout(
  tyreCompound: TyreCompound,
  tyreSet: TyreSet | null
): readonly TyreCompoundKey[] {
  if (tyreSet) {
    return [
      normalizeTyreCompound(tyreSet.frontLeft),
      normalizeTyreCompound(tyreSet.frontRight),
      normalizeTyreCompound(tyreSet.rearLeft),
      normalizeTyreCompound(tyreSet.rearRight)
    ]
  }

  const compound = normalizeTyreCompound(tyreCompound)
  return [compound, compound, compound, compound]
}

export function hasMixedGapTyres(layout: readonly TyreCompoundKey[]): boolean {
  return layout.some((compound) => compound !== layout[0])
}
