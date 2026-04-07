import type { AppUpdaterState } from '../../../types/updater'

type UpdateCheckerAction = 'check' | 'download' | 'install'
type UpdateCheckerTone = 'neutral' | 'accent' | 'warning'

interface UpdateCheckerStatusControl {
  kind: 'status'
  label: string
  tone: UpdateCheckerTone
}

interface UpdateCheckerButtonControl {
  kind: 'button'
  label: string
  action: UpdateCheckerAction
  disabled: boolean
  busy?: boolean
  title: string
}

export interface UpdateCheckerViewModel {
  description: string
  statusNote: string | null
  lastCheckedLabel: string
  control: UpdateCheckerStatusControl | UpdateCheckerButtonControl
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
      description: 'Check for updates.',
      statusNote: null,
      lastCheckedLabel: 'Last checked: loading...',
      control: {
        kind: 'status',
        label: 'Loading',
        tone: 'neutral'
      }
    }
  }

  const lastChecked = formatLastChecked(state.checkedAt)

  if (!state.enabled) {
    return {
      description: 'Check for updates.',
      statusNote: null,
      lastCheckedLabel: lastChecked,
      control: {
        kind: 'button',
        label: 'Unavailable',
        action: 'check',
        disabled: true,
        title: state.message ?? 'Automatic updates are unavailable in this build.'
      }
    }
  }

  if (state.downloaded) {
    return {
      description: 'Check for updates.',
      statusNote:
        state.message ??
        `Version ${state.latestVersion ?? state.currentVersion} is ready to install.`,
      lastCheckedLabel: lastChecked,
      control: {
        kind: 'button',
        label: 'Restart to Update',
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
      description: 'Check for updates.',
      statusNote:
        state.message ?? `Downloading version ${state.latestVersion ?? state.currentVersion}.`,
      lastCheckedLabel: lastChecked,
      control: {
        kind: 'button',
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
      description: 'Check for updates.',
      statusNote: `Version ${state.latestVersion ?? state.currentVersion} is available.`,
      lastCheckedLabel: lastChecked,
      control: {
        kind: 'button',
        label: 'Download Update',
        action: 'download',
        disabled: false,
        title: 'Download the latest Race Director update.'
      }
    }
  }

  if (state.checking) {
    return {
      description: 'Check for updates.',
      statusNote: 'Checking for Race Director updates.',
      lastCheckedLabel: lastChecked,
      control: {
        kind: 'button',
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
      description: 'Check for updates.',
      statusNote: `Race Director ${state.currentVersion} is up to date.`,
      lastCheckedLabel: lastChecked,
      control: {
        kind: 'button',
        label: 'Up to Date',
        action: 'check',
        disabled: false,
        title: 'Check again for updates.'
      }
    }
  }

  if (state.status === 'error') {
    return {
      description: 'Check for updates.',
      statusNote: state.message ?? 'The last update check failed.',
      lastCheckedLabel: lastChecked,
      control: {
        kind: 'button',
        label: 'Retry Check',
        action: 'check',
        disabled: false,
        title: 'Check again for updates.'
      }
    }
  }

  return {
    description: 'Check for updates.',
    statusNote: null,
    lastCheckedLabel: lastChecked,
    control: {
      kind: 'button',
      label: 'Check for Updates',
      action: 'check',
      disabled: false,
      title: 'Check for updates now.'
    }
  }
}

export type { UpdateCheckerTone }
