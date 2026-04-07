import type { AppUpdaterState } from '../shared/updater'

//* updater reducer state
// Pure transitions keep main-process updater logic predictable.
type UpdaterStatePatch = Partial<AppUpdaterState> & Pick<AppUpdaterState, 'status'>

const toIsoNow = (): string => new Date().toISOString()

const withLegacyFlags = (state: AppUpdaterState, patch: UpdaterStatePatch): AppUpdaterState => {
  const status = patch.status
  const merged: AppUpdaterState = {
    ...state,
    ...patch,
    status
  }

  const hasUpdate =
    status === 'available' || status === 'downloading' || status === 'downloaded'
      ? true
      : status === 'idle' || status === 'up-to-date' || status === 'disabled'
        ? false
        : state.hasUpdate
  const checking = status === 'checking'
  const downloading = status === 'downloading'
  const downloaded =
    status === 'downloaded'
      ? true
      : status === 'available' ||
          status === 'downloading' ||
          status === 'idle' ||
          status === 'up-to-date' ||
          status === 'disabled'
        ? false
        : state.downloaded

  return {
    ...merged,
    hasUpdate,
    checking,
    downloading,
    downloaded,
    error: merged.message
  }
}

export const createInitialUpdaterState = (currentVersion: string): AppUpdaterState => ({
  currentVersion,
  latestVersion: currentVersion,
  hasUpdate: false,
  checking: false,
  downloading: false,
  downloaded: false,
  downloadProgress: null,
  error: null,
  enabled: false,
  status: 'disabled',
  message: null,
  checkedAt: null,
  errorContext: null,
  canRetry: false
})

export const setUpdaterEnabled = (state: AppUpdaterState, enabled: boolean): AppUpdaterState =>
  withLegacyFlags(state, {
    enabled,
    status: enabled ? 'idle' : 'disabled',
    message: null,
    errorContext: null,
    canRetry: false,
    downloadProgress: null
  })

export const reduceUpdaterStateOnCheckStart = (state: AppUpdaterState): AppUpdaterState =>
  withLegacyFlags(state, {
    status: 'checking',
    checkedAt: toIsoNow(),
    message: null,
    errorContext: null,
    canRetry: false,
    downloadProgress: null
  })

export const reduceUpdaterStateOnCheckFailure = (
  state: AppUpdaterState,
  message: string
): AppUpdaterState =>
  withLegacyFlags(state, {
    status: 'error',
    checkedAt: toIsoNow(),
    message,
    errorContext: 'check',
    canRetry: true,
    downloadProgress: null
  })

export const reduceUpdaterStateOnUpdateAvailable = (
  state: AppUpdaterState,
  version: string | null
): AppUpdaterState =>
  withLegacyFlags(state, {
    status: 'available',
    latestVersion: version ?? state.latestVersion,
    checkedAt: toIsoNow(),
    message: null,
    errorContext: null,
    canRetry: false,
    downloadProgress: null
  })

export const reduceUpdaterStateOnNoUpdate = (
  state: AppUpdaterState,
  version: string | null
): AppUpdaterState =>
  withLegacyFlags(state, {
    status: 'up-to-date',
    latestVersion: version ?? state.currentVersion,
    checkedAt: toIsoNow(),
    message: null,
    errorContext: null,
    canRetry: false,
    downloadProgress: null
  })

export const reduceUpdaterStateOnDownloadStart = (state: AppUpdaterState): AppUpdaterState =>
  withLegacyFlags(state, {
    status: 'downloading',
    message: null,
    errorContext: null,
    canRetry: false,
    downloadProgress: 0
  })

const nextStatusAfterDownloadFailure = (state: AppUpdaterState): AppUpdaterState['status'] => {
  return state.hasUpdate ? 'available' : 'error'
}

export const reduceUpdaterStateOnDownloadFailure = (
  state: AppUpdaterState,
  message: string
): AppUpdaterState =>
  withLegacyFlags(state, {
    status: nextStatusAfterDownloadFailure(state),
    message,
    errorContext: 'download',
    canRetry: state.hasUpdate,
    downloadProgress: null
  })

export const reduceUpdaterStateOnDownloadProgress = (
  state: AppUpdaterState,
  percent: number
): AppUpdaterState =>
  withLegacyFlags(state, {
    status: 'downloading',
    downloadProgress: percent,
    message: null,
    errorContext: null,
    canRetry: false
  })

export const reduceUpdaterStateOnDownloadComplete = (
  state: AppUpdaterState,
  version: string | null
): AppUpdaterState =>
  withLegacyFlags(state, {
    status: 'downloaded',
    latestVersion: version ?? state.latestVersion,
    downloadProgress: 100,
    message: null,
    errorContext: null,
    canRetry: true
  })

export const reduceUpdaterStateOnInstallFailure = (
  state: AppUpdaterState,
  message: string
): AppUpdaterState =>
  withLegacyFlags(state, {
    status: 'downloaded',
    message,
    errorContext: 'install',
    canRetry: true
  })

export const shouldBroadcastDownloadProgress = (
  currentState: AppUpdaterState,
  nextPercent: number
): boolean => {
  if (currentState.status !== 'downloading') return true
  if (currentState.downloadProgress === null) return true
  const previousStep = Math.floor(currentState.downloadProgress / 10)
  const nextStep = Math.floor(nextPercent / 10)
  return previousStep !== nextStep || nextPercent === 100
}

export const getAutoUpdateDisabledReason = (args: {
  isPackaged: boolean
  platform: NodeJS.Platform
  appImage?: string | undefined
  disabledByEnv: boolean
}): string | null => {
  // TODO: Add signed-build checks if distribution policy requires it.
  if (!args.isPackaged) {
    return 'Automatic updates are only available in packaged production builds.'
  }

  if (args.disabledByEnv) {
    return 'Automatic updates are disabled by environment settings.'
  }

  if (args.platform === 'linux' && !args.appImage) {
    return 'Automatic updates on Linux require running the AppImage build.'
  }

  return null
}
