import { BrowserWindow } from 'electron'
import type { RaceControlManualFlag, RaceControlState } from '../../shared/raceControl'
import {
  DEFAULT_RACE_CONTROL_STATE,
  isRaceControlFlagType
} from '../../shared/raceControl'
import { registerIpcHandle } from './registerIpcHandle'

let raceControlState: RaceControlState = DEFAULT_RACE_CONTROL_STATE

function cloneManualFlag(flag: RaceControlManualFlag | null): RaceControlManualFlag | null {
  return flag ? { ...flag } : null
}

function cloneRaceControlState(): RaceControlState {
  return {
    manualFlag: cloneManualFlag(raceControlState.manualFlag),
    updatedAt: raceControlState.updatedAt
  }
}

function isValidRaceControlManualFlag(
  value: RaceControlManualFlag | null | undefined
): value is RaceControlManualFlag {
  if (!value) return false

  return (
    isRaceControlFlagType(value.type) &&
    value.source === 'race-control' &&
    Number.isFinite(value.lap) &&
    Number.isFinite(value.sessionElapsedSeconds) &&
    typeof value.timestamp === 'string' &&
    typeof value.note === 'string'
  )
}

function broadcastRaceControlState(): void {
  const payload = cloneRaceControlState()

  BrowserWindow.getAllWindows().forEach((win) => {
    try {
      if (win.isDestroyed() || win.webContents.isDestroyed()) {
        return
      }

      win.webContents.send('raceControl:state', payload)
    } catch (error) {
      console.warn('Failed to broadcast race control state:', error)
    }
  })
}

export const registerRaceControlHandlers = (): void => {
  registerIpcHandle('raceControl:getState', (): RaceControlState => {
    return cloneRaceControlState()
  })

  registerIpcHandle(
    'raceControl:setManualFlag',
    (_event, flag: RaceControlManualFlag): RaceControlState => {
      if (!isValidRaceControlManualFlag(flag)) {
        throw new Error('Invalid race control manual flag payload.')
      }

      raceControlState = {
        manualFlag: cloneManualFlag(flag),
        updatedAt: Date.now()
      }
      broadcastRaceControlState()
      return cloneRaceControlState()
    }
  )

  registerIpcHandle('raceControl:clearManualFlag', (): RaceControlState => {
    raceControlState = {
      manualFlag: null,
      updatedAt: Date.now()
    }
    broadcastRaceControlState()
    return cloneRaceControlState()
  })
}
