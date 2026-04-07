/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { AnimatePresence, motion } from 'framer-motion'
import type { TowerSettings } from '../../../store/overlayStore'
import type { SectorTime } from '../../../types/lmu'
import { getClassColor, CLASS_LABELS, ANIMATION_DURATION } from './constants'
import type { FightGroup } from './useFightDetection'
import type { TowerRow, TowerSection as TowerSectionData } from './useTowerData'
import FightGroupBlock from './FightGroupBlock'
import TowerRowComponent from './TowerRow'

interface TowerSectionProps {
  readonly section: TowerSectionData
  readonly settings: TowerSettings
  readonly fightGroups: FightGroup[]
  readonly overtakingSlots: Map<number, 'gained' | 'lost'>
  readonly sessionBestSectors: SectorTime
  readonly isQuali: boolean
  readonly statusEarGutter: number
  readonly isLast: boolean
}

type RenderBlock =
  | { key: string; type: 'row'; row: TowerRow }
  | { key: string; type: 'fight'; group: FightGroup; rows: TowerRow[] }

function buildRenderBlocks(rows: TowerRow[], fightGroups: FightGroup[]): RenderBlock[] {
  const indexBySlotId = new Map(rows.map((row, index) => [row.standing.slotId, index]))
  const groupByStartIndex = new Map<number, Extract<RenderBlock, { type: 'fight' }>>()

  for (const group of fightGroups) {
    const indices = group.slotIds
      .map((slotId) => indexBySlotId.get(slotId))
      .filter((index): index is number => index !== undefined)
      .sort((a, b) => a - b)

    if (indices.length === 0) {
      continue
    }

    const startIndex = indices[0]
    const endIndex = indices[indices.length - 1]
    groupByStartIndex.set(startIndex, {
      key: group.id,
      type: 'fight',
      group,
      rows: rows.slice(startIndex, endIndex + 1)
    })
  }

  const blocks: RenderBlock[] = []
  for (let index = 0; index < rows.length; index += 1) {
    const groupBlock = groupByStartIndex.get(index)
    if (groupBlock) {
      blocks.push(groupBlock)
      index += groupBlock.rows.length - 1
      continue
    }

    const row = rows[index]
    blocks.push({ key: row.key, type: 'row', row })
  }

  return blocks
}

export default function TowerSection({
  section,
  settings,
  fightGroups,
  overtakingSlots,
  sessionBestSectors,
  isQuali,
  statusEarGutter,
  isLast
}: TowerSectionProps) {
  const classColor = getClassColor(section.carClass, settings)
  const animDuration = ANIMATION_DURATION[settings.animationSpeed]
  const renderBlocks = buildRenderBlocks(section.rows, fightGroups)
  const rowPositionByKey = new Map(
    section.rows.map((row, index) => [
      row.key,
      {
        isFirstRow: index === 0,
        isLastRow: index === section.rows.length - 1
      }
    ])
  )
  const classBestLapTime = section.rows.reduce<number | null>((best, row) => {
    const lap = row.standing.bestLapTime
    if (lap === null) return best
    if (best === null || lap < best) return lap
    return best
  }, null)
  const classLabel = CLASS_LABELS[section.carClass]

  return (
    <div
      style={{
        marginBottom: isLast ? 0 : 8,
        paddingRight: statusEarGutter,
        overflow: 'visible'
      }}
    >
      <div
        style={{
          borderRadius: 6,
          overflow: 'hidden',
          backgroundColor: 'rgba(8, 9, 14, 0.75)',
          backdropFilter: 'blur(18px) saturate(1.4) brightness(0.7)',
          WebkitBackdropFilter: 'saturate(1.4) brightness(0.7)',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '0',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            height: 28,
            background: `linear-gradient(90deg, transparent 0%, ${classColor}22 40%, ${classColor}22 60%, transparent 100%)`,
            borderTop: `2px solid ${classColor}`,
            borderBottom: `2px solid ${classColor}44`,
            paddingInline: 8
          }}
        >
          <HeaderRail side="left" color={classColor} />
          <span
            style={{
              flexShrink: 0,
              paddingInline: 2,
              fontSize: 15,
              fontWeight: 900,
              color: classColor,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              textShadow: `0 0 16px ${classColor}88, 0 0 4px ${classColor}44`
            }}
          >
            {classLabel}
          </span>
          <HeaderRail side="right" color={classColor} />
        </div>

        <AnimatePresence initial={false}>
          {renderBlocks.map((block) => (
            <motion.div
              key={block.key}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: animDuration }}
            >
              {block.type === 'fight' ? (
                <FightGroupBlock
                  group={block.group}
                  rows={block.rows}
                  settings={settings}
                  rowPositionByKey={rowPositionByKey}
                  overtakingSlots={overtakingSlots}
                  sessionBestSectors={sessionBestSectors}
                  isQuali={isQuali}
                  classBestLapTime={classBestLapTime}
                />
              ) : (
                <TowerRowComponent
                  row={block.row}
                  settings={settings}
                  isFirstRow={rowPositionByKey.get(block.row.key)?.isFirstRow ?? false}
                  isLastRow={rowPositionByKey.get(block.row.key)?.isLastRow ?? false}
                  isOvertaking={overtakingSlots.get(block.row.standing.slotId) ?? null}
                  sessionBestSectors={sessionBestSectors}
                  isQuali={isQuali}
                  classBestLapTime={classBestLapTime}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

function HeaderRail({ side, color }: { readonly side: 'left' | 'right'; readonly color: string }) {
  const innerGradient =
    side === 'left'
      ? `linear-gradient(90deg, transparent 0%, ${color} 100%)`
      : `linear-gradient(270deg, transparent 0%, ${color} 100%)`

  return (
    <div style={{ flex: 1, minWidth: 28, display: 'grid', alignItems: 'center' }}>
      <div
        style={{
          height: 3,
          background: innerGradient,
          opacity: 0.95,
          boxShadow: `0 0 10px ${color}40`
        }}
      />
    </div>
  )
}
