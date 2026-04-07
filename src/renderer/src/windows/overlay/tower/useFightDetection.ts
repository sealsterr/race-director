/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from 'react'
import type { TowerSection } from './useTowerData'
import { FIGHT_CLEAR_POLLS, FIGHT_TIMEOUT_MS, getFightLabel } from './constants'
import type { FightLabel } from './constants'

export interface FightGroup {
  id: string
  slotIds: number[]
  classPositions: number[]
  label: FightLabel
  startedAt: number
  clearPollCount: number
}

interface UseFightDetectionOptions {
  sections: TowerSection[]
  thresholdSeconds: number
  holdSeconds: number
  requireSameLap: boolean
  ignorePitAndFinished: boolean
  enabled: boolean
}

interface TrackedFight extends FightGroup {
  firstSeenAt: number
}

function areFightListsEqual(current: FightGroup[], next: FightGroup[]): boolean {
  if (current.length !== next.length) {
    return false
  }

  for (let index = 0; index < current.length; index += 1) {
    const left = current[index]
    const right = next[index]

    if (
      left.id !== right.id ||
      left.label !== right.label ||
      left.startedAt !== right.startedAt ||
      left.clearPollCount !== right.clearPollCount ||
      left.slotIds.length !== right.slotIds.length ||
      left.classPositions.length !== right.classPositions.length
    ) {
      return false
    }

    for (let slotIndex = 0; slotIndex < left.slotIds.length; slotIndex += 1) {
      if (left.slotIds[slotIndex] !== right.slotIds[slotIndex]) {
        return false
      }
    }

    for (let positionIndex = 0; positionIndex < left.classPositions.length; positionIndex += 1) {
      if (left.classPositions[positionIndex] !== right.classPositions[positionIndex]) {
        return false
      }
    }
  }

  return true
}

function isEligibleStatus(status: TowerSection['rows'][number]['standing']['status']): boolean {
  return status !== 'PITTING' && status !== 'FINISHED'
}

function detectFightPairs(
  rows: TowerSection['rows'],
  thresholdSeconds: number,
  requireSameLap: boolean,
  ignorePitAndFinished: boolean
): FightGroup[] {
  const pairs: FightGroup[] = []

  for (let index = 1; index < rows.length; index += 1) {
    const ahead = rows[index - 1]
    const behind = rows[index]
    const interval = behind.intervalSeconds

    if (interval === null || interval > thresholdSeconds) {
      continue
    }

    if (
      ignorePitAndFinished &&
      (!isEligibleStatus(ahead.standing.status) || !isEligibleStatus(behind.standing.status))
    ) {
      continue
    }

    if (requireSameLap && ahead.standing.lapsDown !== behind.standing.lapsDown) {
      continue
    }

    pairs.push({
      id: `${ahead.standing.slotId}-${behind.standing.slotId}`,
      slotIds: [ahead.standing.slotId, behind.standing.slotId],
      classPositions: [ahead.classPosition, behind.classPosition],
      label: getFightLabel(ahead.classPosition),
      startedAt: 0,
      clearPollCount: 0
    })
  }

  return pairs
}

function trackFights(
  detected: FightGroup[],
  existing: Map<string, TrackedFight>,
  holdMs: number,
  now: number
): Map<string, TrackedFight> {
  const next = new Map<string, TrackedFight>()

  for (const fight of detected) {
    const previous = existing.get(fight.id)
    const firstSeenAt = previous?.firstSeenAt ?? now
    const becameActive =
      previous?.startedAt && previous.startedAt > 0
        ? previous.startedAt
        : now - firstSeenAt >= holdMs
          ? now
          : 0

    if (previous?.startedAt && now - previous.startedAt >= FIGHT_TIMEOUT_MS) {
      continue
    }

    next.set(fight.id, {
      ...fight,
      firstSeenAt,
      startedAt: previous?.startedAt && previous.startedAt > 0 ? previous.startedAt : becameActive,
      clearPollCount: 0
    })
  }

  for (const [id, trackedFight] of existing.entries()) {
    if (next.has(id) || trackedFight.startedAt === 0) {
      continue
    }

    const updated = {
      ...trackedFight,
      clearPollCount: trackedFight.clearPollCount + 1
    }

    if (updated.clearPollCount < FIGHT_CLEAR_POLLS) {
      next.set(id, updated)
    }
  }

  return next
}

export function useFightDetection({
  sections,
  thresholdSeconds,
  holdSeconds,
  requireSameLap,
  ignorePitAndFinished,
  enabled
}: UseFightDetectionOptions): FightGroup[] {
  const [fights, setFights] = useState<FightGroup[]>([])
  const fightsRef = useRef<Map<string, TrackedFight>>(new Map())

  useEffect(() => {
    if (!enabled) {
      setFights([])
      fightsRef.current.clear()
      return
    }

    const now = Date.now()
    const detected = sections.flatMap((section) =>
      detectFightPairs(section.rows, thresholdSeconds, requireSameLap, ignorePitAndFinished)
    )

    const tracked = trackFights(detected, fightsRef.current, holdSeconds * 1000, now)
    const activeFights = Array.from(tracked.values()).filter((fight) => fight.startedAt > 0)

    fightsRef.current = tracked
    setFights((current) => (areFightListsEqual(current, activeFights) ? current : activeFights))
  }, [enabled, holdSeconds, ignorePitAndFinished, requireSameLap, sections, thresholdSeconds])

  return fights
}
