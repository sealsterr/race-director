export interface AppUpdaterState {
  currentVersion: string;
  latestVersion: string | null;
  hasUpdate: boolean;
  checking: boolean;
  downloading: boolean;
  downloaded: boolean;
  downloadProgress: number | null;
  error: string | null;
}
