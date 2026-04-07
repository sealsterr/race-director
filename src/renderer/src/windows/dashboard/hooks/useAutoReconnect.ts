import { useEffect, useRef } from 'react'
import type { ConnectionStatus } from '../../../types/lmu'
import type { LogType } from '../../../types/dashboard'
import type { DashboardSettings } from '../settings/types'

interface UseAutoReconnectParams {
  connection: ConnectionStatus
  settings: DashboardSettings
  onLog: (message: string, type?: LogType) => void
}

const useAutoReconnect = ({ connection, settings, onLog }: UseAutoReconnectParams): void => {
  const previousConnectionRef = useRef<ConnectionStatus>(connection)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const previous = previousConnectionRef.current
    previousConnectionRef.current = connection

    const droppedFromConnected =
      previous === 'CONNECTED' && (connection === 'DISCONNECTED' || connection === 'ERROR')

    if (!droppedFromConnected || !settings.network.autoReconnectOnDrop) {
      return
    }

    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
    }

    reconnectTimerRef.current = setTimeout(() => {
      onLog('Auto reconnect: retrying LMU connection.', 'WARNING')
      void globalThis.api
        .connect(settings.network.apiUrl, settings.network.pollRateMs)
        .catch(() => {
          onLog('Auto reconnect failed.', 'ERROR')
        })
    }, settings.network.reconnectDelayMs)

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current)
        reconnectTimerRef.current = null
      }
    }
  }, [
    connection,
    onLog,
    settings.network.apiUrl,
    settings.network.autoReconnectOnDrop,
    settings.network.pollRateMs,
    settings.network.reconnectDelayMs
  ])
}

export default useAutoReconnect
