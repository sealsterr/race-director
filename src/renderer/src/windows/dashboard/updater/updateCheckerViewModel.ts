import type { AppUpdaterState } from '../../../types/updater'

type UpdateCheckerAction = 'check' | 'download' | 'install'

interface UpdateCheckerButtonControl {
  label: string
  action: UpdateCheckerAction
  disabled: boolean
  busy?: boolean
  title: string
}

export interface UpdateCheckerViewModel {
  description: string
  statusNote: string | null
  control: UpdateCheckerButtonControl
}

const formatLastChecked = (checkedAt: string | null): string => {
  if (!checkedAt) return 'Last checked: never'

  const parsed = new Date(checkedAt)
  if (Number.isNaN(parsed.getTime())) return 'Last checked: unknown'

  return `Last checked: ${parsed.toLocaleString([], {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`
}

export const getUpdateCheckerViewModel = (
  state: AppUpdaterState | null
): UpdateCheckerViewModel => {
  if (!state) {
    return {
      description: 'Last checked: loading...',
      statusNote: null,
      control: {
        label: 'Loading',
        action: 'check',
        disabled: true,
        busy: true,
        title: 'Loading updater status.'
      }
    }
  }

  const lastChecked = formatLastChecked(state.checkedAt)

  if (!state.enabled) {
    return {
      description: lastChecked,
      statusNote: null,
      control: {
        label: 'Unavailable',
        action: 'check',
        disabled: true,
        title: state.message ?? 'Automatic updates are unavailable in this build.'
      }
    }
  }

  if (state.downloaded) {
    return {
      description: lastChecked,
      statusNote:
        state.message ??
        `Version ${state.latestVersion ?? state.currentVersion} is ready to install.`,
      control: {
        label: 'Restart',
        action: 'install',
        disabled: false,
        title: 'Apply the downloaded update and restart the app.'
      }
    }
  }

  if (state.downloading) {
    const progressLabel =
      typeof state.downloadProgress === 'number'
        ? `Downloading ${state.downloadProgress}%`
        : 'Downloading...'

    return {
      description: lastChecked,
      statusNote:
        state.message ?? `Downloading version ${state.latestVersion ?? state.currentVersion}.`,
      control: {
        label: progressLabel,
        action: 'download',
        disabled: true,
        busy: true,
        title: 'Downloading the latest Race Director update.'
      }
    }
  }

  if (state.hasUpdate) {
    return {
      description: lastChecked,
      statusNote: `Version ${state.latestVersion ?? state.currentVersion} is available.`,
      control: {
        label: 'Download',
        action: 'download',
        disabled: false,
        title: 'Download the latest Race Director update.'
      }
    }
  }

  if (state.checking) {
    return {
      description: lastChecked,
      statusNote: null,
      control: {
        label: 'Checking...',
        action: 'check',
        disabled: true,
        busy: true,
        title: 'Checking for updates now.'
      }
    }
  }

  if (state.status === 'up-to-date') {
    return {
      description: lastChecked,
      statusNote: null,
      control: {
        label: 'Up to Date',
        action: 'check',
        disabled: true,
        title: `Race Director ${state.currentVersion} is up to date.`
      }
    }
  }

  if (state.status === 'error') {
    return {
      description: lastChecked,
      statusNote: state.message ?? 'The last update check failed.',
      control: {
        label: 'Check Failed',
        action: 'check',
        disabled: true,
        title: state.message ?? 'The last update check failed.'
      }
    }
  }

  return {
    description: lastChecked,
    statusNote: null,
    control: {
      label: 'Up to Date',
      action: 'check',
      disabled: true,
      title: `Race Director ${state.currentVersion} is up to date.`
    }
  }
}
