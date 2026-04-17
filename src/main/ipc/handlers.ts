import { BrowserWindow } from 'electron'
import { lmuClient } from '../api/lmuApi'
import { telemetryBridge } from '../api/lmuTelemetryBridge'
import type { AppState, ConnectionStatus, TelemetrySnapshot } from '../../shared/types'
import { registerIpcHandle } from './registerIpcHandle'

interface LmuRendererEventPayloads {
  'lmu:stateUpdate': AppState
  'lmu:connectionChange': ConnectionStatus
  'lmu:telemetryUpdate': TelemetrySnapshot
}

export const registerIpcHandlers = (
  _mainWindow: BrowserWindow,
  onConnectionLost?: () => void
): void => {
  let previousStatus: ConnectionStatus = lmuClient.getState().connection
  const DEFAULT_POLL_RATE_MS = 200
  const MIN_POLL_RATE_MS = 50
  const MAX_POLL_RATE_MS = 2_000

  const toSafePollRate = (value: unknown): number => {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return DEFAULT_POLL_RATE_MS
    }

    const rounded = Math.round(value)
    return Math.max(MIN_POLL_RATE_MS, Math.min(MAX_POLL_RATE_MS, rounded))
  }

  const safeSend = <Channel extends keyof LmuRendererEventPayloads>(
    win: BrowserWindow,
    channel: Channel,
    payload: LmuRendererEventPayloads[Channel]
  ): void => {
    try {
      if (win.isDestroyed() || win.webContents.isDestroyed()) {
        return
      }

      win.webContents.send(channel, payload)
    } catch (error) {
      console.warn(`Failed to send ${channel} to renderer:`, error)
    }
  }

  telemetryBridge.setSnapshotCallback((snapshot: TelemetrySnapshot) => {
    BrowserWindow.getAllWindows().forEach((win) => {
      safeSend(win, 'lmu:telemetryUpdate', snapshot)
    })
  })

  registerIpcHandle(
    'lmu:connect',
    async (_event, url: unknown, pollRate: unknown): Promise<void> => {
      const baseUrl = typeof url === 'string' ? url : ''
      lmuClient.configure(baseUrl, toSafePollRate(pollRate))

      lmuClient.setStateUpdateCallback((state: AppState) => {
        BrowserWindow.getAllWindows().forEach((win) => {
          safeSend(win, 'lmu:stateUpdate', state)
        })
      })

      lmuClient.setConnectionCallback((status: ConnectionStatus) => {
        BrowserWindow.getAllWindows().forEach((win) => {
          safeSend(win, 'lmu:connectionChange', status)
        })

        const lostConnection =
          previousStatus === 'CONNECTED' && (status === 'DISCONNECTED' || status === 'ERROR')

        previousStatus = status

        if (lostConnection) {
          onConnectionLost?.()
        }
      })

      await lmuClient.connect()
    }
  )

  registerIpcHandle('lmu:focusVehicle', async (_event, slotId: number): Promise<void> => {
    await lmuClient.focusVehicle(slotId)
  })

  registerIpcHandle(
    'lmu:setCameraAngle',
    async (
      _event,
      cameraType: number,
      trackSideGroup: number,
      shouldAdvance: boolean
    ): Promise<void> => {
      await lmuClient.setCameraAngle(cameraType, trackSideGroup, shouldAdvance)
    }
  )

  registerIpcHandle('lmu:disconnect', (): void => {
    lmuClient.disconnect()
  })

  registerIpcHandle('lmu:getState', (): AppState => {
    return lmuClient.getState()
  })

  registerIpcHandle('lmu:getTelemetry', (): TelemetrySnapshot => {
    return telemetryBridge.getLatestSnapshot()
  })
}
