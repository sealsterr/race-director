import { useEffect } from 'react'
import {
  DASHBOARD_SETTINGS_STORAGE_KEY,
  loadDashboardSettingsFromStorage
} from '../windows/dashboard/settings/defaults'
import { applyGlobalUiPayload, toGlobalUiPayload } from '../windows/dashboard/settings/globalUi'
import type { GlobalUiSettingsPayload } from '../../../shared/globalUi'

const useGlobalUiSettings = (): void => {
  useEffect(() => {
    const applyFromStorage = (): void => {
      const settings = loadDashboardSettingsFromStorage(globalThis.localStorage)
      const payload = toGlobalUiPayload(settings)
      applyGlobalUiPayload(payload)
      void globalThis.api.settings.applyGlobalUi(payload)
    }

    applyFromStorage()

    const unsub = globalThis.api.settings.onGlobalUiChanged((payload: GlobalUiSettingsPayload) => {
      applyGlobalUiPayload(payload)
    })

    const onStorage = (event: StorageEvent): void => {
      if (event.key !== DASHBOARD_SETTINGS_STORAGE_KEY) return
      applyFromStorage()
    }

    const onLocalSettingsChanged = (): void => {
      applyFromStorage()
    }

    globalThis.addEventListener('storage', onStorage)
    globalThis.addEventListener('rd:settingsChanged', onLocalSettingsChanged)

    return () => {
      unsub()
      globalThis.removeEventListener('storage', onStorage)
      globalThis.removeEventListener('rd:settingsChanged', onLocalSettingsChanged)
    }
  }, [])
}

export default useGlobalUiSettings
