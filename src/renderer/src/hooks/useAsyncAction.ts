import { useCallback, useState } from 'react'

export const getErrorMessage = (error: unknown, fallbackMessage: string): string => {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message
  }

  if (typeof error === 'string' && error.trim().length > 0) {
    return error
  }

  return fallbackMessage
}

interface UseAsyncActionResult {
  isRunning: boolean
  errorMessage: string | null
  clearError: () => void
  run: (action: () => Promise<void>, fallbackMessage: string) => Promise<boolean>
}

const useAsyncAction = (): UseAsyncActionResult => {
  const [isRunning, setIsRunning] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setErrorMessage(null)
  }, [])

  const run = useCallback(
    async (action: () => Promise<void>, fallbackMessage: string): Promise<boolean> => {
      if (isRunning) {
        return false
      }

      setIsRunning(true)
      setErrorMessage(null)

      try {
        await action()
        return true
      } catch (error) {
        setErrorMessage(getErrorMessage(error, fallbackMessage))
        return false
      } finally {
        setIsRunning(false)
      }
    },
    [isRunning]
  )

  return {
    isRunning,
    errorMessage,
    clearError,
    run
  }
}

export default useAsyncAction
