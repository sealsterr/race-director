import { useEffect, useRef } from 'react'
import type { LogType, WindowId } from '../../../types/dashboard'
import type { DashboardSettings } from '../settings/types'

interface UseDashboardStartupParams {
  settings: DashboardSettings
  onLog: (message: string, type?: LogType) => void
  onWindowOpenStatus: (id: WindowId, isOpen: boolean) => void
}

const STARTUP_WINDOWS: Array<{ enabled: boolean; id: WindowId; label: string }> = []

const useDashboardStartup = ({
  settings,
  onLog,
  onWindowOpenStatus
}: UseDashboardStartupParams): void => {
  const hasAppliedStartupRef = useRef(false)

  useEffect(() => {
    if (hasAppliedStartupRef.current) return
    hasAppliedStartupRef.current = true

    const startupWindows = [
      {
        enabled: settings.overlay.startupInfoWindow,
        id: 'INFO' as const,
        label: 'Info Window'
      },
      {
        enabled: settings.overlay.startupOverlayDashboard,
        id: 'OVERLAY-CONTROL' as const,
        label: 'Overlay Dashboard'
      },
      ...STARTUP_WINDOWS
    ]

    const run = async (): Promise<void> => {
      for (const startupWindow of startupWindows) {
        if (!startupWindow.enabled) continue
        await globalThis.api.windows.open(startupWindow.id)
        onWindowOpenStatus(startupWindow.id, true)
        onLog(`Startup opened ${startupWindow.label}.`, 'SYSTEM')
      }

      if (!settings.network.autoConnectOnLaunch) return
      onLog(
        `Startup connecting to ${settings.network.apiUrl} (${settings.network.pollRateMs}ms).`,
        'SYSTEM'
      )
      try {
        await globalThis.api.connect(settings.network.apiUrl, settings.network.pollRateMs)
      } catch (error) {
        console.warn('Startup auto-connect attempt failed:', error)
        onLog('Startup auto-connect attempt failed.', 'WARNING')
      }
    }

    void run()
  }, [
    onLog,
    onWindowOpenStatus,
    settings.network.apiUrl,
    settings.network.autoConnectOnLaunch,
    settings.network.pollRateMs,
    settings.overlay.startupInfoWindow,
    settings.overlay.startupOverlayDashboard
  ])
}

export default useDashboardStartup
