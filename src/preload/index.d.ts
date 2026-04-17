import type { ElectronAPI as ElectronToolkitAPI } from '@electron-toolkit/preload'
import type { ElectronAPI as RaceDirectorAPI } from './index'

declare global {
  interface Window {
    electron: ElectronToolkitAPI
    api: RaceDirectorAPI
  }
}
