import { BrowserWindow } from 'electron'
import { lmuClient } from '../api/lmuApi'
import { telemetryBridge } from '../api/lmuTelemetryBridge'
import type { AppState, ConnectionStatus, TelemetrySnapshot } from '../../renderer/src/types/lmu'
import { registerIpcHandle } from './registerIpcHandle'

/* 
    -- registers all IPC handlers for LMU API client --
    -- call once during app startup, passing main window reference --
*/
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

  const safeSend = (win: BrowserWindow, channel: string, payload: unknown): void => {
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

  //* lmu:connect
  //* renderer calls: await window.api.connect(url, pollRate)
  registerIpcHandle(
    'lmu:connect',
    async (_event, url: unknown, pollRate: unknown): Promise<void> => {
      const baseUrl = typeof url === 'string' ? url : ''
      lmuClient.configure(baseUrl, toSafePollRate(pollRate))

      //* when state updates arrive from polling loop, push to renderer
      lmuClient.setStateUpdateCallback((state: AppState) => {
        BrowserWindow.getAllWindows().forEach((win) => {
          safeSend(win, 'lmu:stateUpdate', state)
        })
      })

      //* when connection status changes, push that too
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

  //* lmu:focusVehicle
  registerIpcHandle('lmu:focusVehicle', async (_event, slotId: number): Promise<void> => {
    await lmuClient.focusVehicle(slotId)
  })

  //* lmu:setCameraAngle
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

  //* lmu:disconnect
  registerIpcHandle('lmu:disconnect', (): void => {
    lmuClient.disconnect()
  })

  //* lmu:getState
  //* used on mount to hydrate renderer with any existing state
  registerIpcHandle('lmu:getState', (): AppState => {
    return lmuClient.getState()
  })

  registerIpcHandle('lmu:getTelemetry', (): TelemetrySnapshot => {
    return telemetryBridge.getLatestSnapshot()
  })
}
