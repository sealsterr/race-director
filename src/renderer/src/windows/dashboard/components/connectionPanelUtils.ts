import type { ConnectionStatus } from '../../../types/lmu'

export const MIN_POLL_RATE_MS = 50
export const MAX_POLL_RATE_MS = 2000
export const DEFAULT_POLL_RATE_MS = 250

export interface ConnectionValidationResult {
  apiUrl: string
  pollRate: number
  errorMessage: string | null
}

export const normalizeApiUrl = (value: string): string => {
  const trimmed = value.trim()
  if (!trimmed) return ''

  return /^[a-z]+:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`
}

export const parsePollRate = (value: string): number | null => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    return null
  }

  return Math.round(parsed)
}

export const clampPollRate = (value: number): number =>
  Math.min(MAX_POLL_RATE_MS, Math.max(MIN_POLL_RATE_MS, value))

export const validateConnectionFields = (
  apiUrlInput: string,
  pollRateInput: string
): ConnectionValidationResult => {
  const apiUrl = normalizeApiUrl(apiUrlInput)
  if (!apiUrl) {
    return {
      apiUrl: '',
      pollRate: DEFAULT_POLL_RATE_MS,
      errorMessage: 'Enter an LMU API host or URL before connecting.'
    }
  }

  try {
    new URL(apiUrl)
  } catch {
    return {
      apiUrl,
      pollRate: DEFAULT_POLL_RATE_MS,
      errorMessage: 'The LMU API address is not a valid URL.'
    }
  }

  const parsedPollRate = parsePollRate(pollRateInput)
  if (parsedPollRate === null) {
    return {
      apiUrl,
      pollRate: DEFAULT_POLL_RATE_MS,
      errorMessage: 'Poll rate must be a whole number (milliseconds).'
    }
  }

  if (parsedPollRate < MIN_POLL_RATE_MS || parsedPollRate > MAX_POLL_RATE_MS) {
    return {
      apiUrl,
      pollRate: clampPollRate(parsedPollRate),
      errorMessage: `Poll rate must stay between ${MIN_POLL_RATE_MS} and ${MAX_POLL_RATE_MS} ms.`
    }
  }

  return {
    apiUrl,
    pollRate: parsedPollRate,
    errorMessage: null
  }
}

export const getConnectionStatusValue = (connection: ConnectionStatus): string => {
  if (connection === 'CONNECTED') return 'Active'
  if (connection === 'CONNECTING') return 'Connecting...'
  if (connection === 'ERROR') return 'Error'
  return 'Offline'
}

export const getConnectionButtonClass = (connection: ConnectionStatus): string => {
  if (connection === 'CONNECTED') {
    return 'bg-rd-success/20 text-rd-success hover:bg-rd-success/30 border border-rd-success/30'
  }
  if (connection === 'CONNECTING' || connection === 'ERROR') {
    return 'cursor-not-allowed bg-rd-gold/10 text-rd-gold border border-rd-gold/30'
  }
  return 'bg-rd-accent/20 text-rd-accent hover:bg-rd-accent/30 border border-rd-accent/30'
}

export const getConnectionButtonLabel = (connection: ConnectionStatus): string => {
  if (connection === 'CONNECTED') return 'Disconnect'
  if (connection === 'CONNECTING') return 'Connecting...'
  return 'Connect to LMU'
}
