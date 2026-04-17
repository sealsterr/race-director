import { useCallback, useEffect, useState } from 'react'
import useAsyncAction from '../../../hooks/useAsyncAction'

export interface UseSystemPopupsResult {
  showDisconnectNotice: boolean
  showQuitConfirm: boolean
  dontAskAgain: boolean
  isBusy: boolean
  errorMessage: string | null
  setDontAskAgain: (value: boolean) => void
  clearError: () => void
  dismissDisconnectNotice: () => Promise<void>
  cancelQuit: () => Promise<void>
  confirmQuit: () => Promise<void>
}

const useSystemPopups = (): UseSystemPopupsResult => {
  const [showDisconnectNotice, setShowDisconnectNotice] = useState(false)
  const [showQuitConfirm, setShowQuitConfirm] = useState(false)
  const [dontAskAgain, setDontAskAgain] = useState(false)
  const { isRunning, errorMessage, clearError, run } = useAsyncAction()

  const refreshQuitPreference = useCallback(async () => {
    try {
      const showConfirm = await globalThis.api.system.getQuitConfirmPreference()
      setDontAskAgain(!showConfirm)
    } catch (error) {
      console.warn('Failed to load quit confirmation preference:', error)
      setDontAskAgain(false)
    }
  }, [])

  useEffect(() => {
    const hydrateTimer = globalThis.setTimeout(() => {
      void refreshQuitPreference()
    }, 0)

    const unsubDisconnect = globalThis.api.system.onDisconnectNoticeVisibilityChange(
      (isVisible) => {
        clearError()
        setShowDisconnectNotice(isVisible)
      }
    )

    const unsubQuit = globalThis.api.system.onQuitConfirmVisibilityChange((isVisible) => {
      clearError()
      setShowQuitConfirm(isVisible)
      if (isVisible) {
        void refreshQuitPreference()
      }
    })

    return () => {
      globalThis.clearTimeout(hydrateTimer)
      unsubDisconnect()
      unsubQuit()
    }
  }, [clearError, refreshQuitPreference])

  const dismissDisconnectNotice = useCallback(async () => {
    const ok = await run(async () => {
      await globalThis.api.system.ackDisconnect()
      setShowDisconnectNotice(false)
    }, 'Unable to dismiss the disconnect notice.')

    if (ok) {
      clearError()
    }
  }, [clearError, run])

  const cancelQuit = useCallback(async () => {
    const ok = await run(async () => {
      await globalThis.api.system.cancelQuit()
      setShowQuitConfirm(false)
    }, 'Unable to cancel the quit request.')

    if (ok) {
      clearError()
    }
  }, [clearError, run])

  const confirmQuit = useCallback(async () => {
    const ok = await run(async () => {
      await globalThis.api.system.confirmQuit(dontAskAgain)
      setShowQuitConfirm(false)
    }, 'Unable to quit RaceDirector right now.')

    if (ok) {
      clearError()
    }
  }, [clearError, dontAskAgain, run])

  return {
    showDisconnectNotice,
    showQuitConfirm,
    dontAskAgain,
    isBusy: isRunning,
    errorMessage,
    setDontAskAgain,
    clearError,
    dismissDisconnectNotice,
    cancelQuit,
    confirmQuit
  }
}

export default useSystemPopups
