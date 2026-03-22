export type AppUpdaterStatus =
  | "disabled"
  | "idle"
  | "checking"
  | "up-to-date"
  | "available"
  | "downloading"
  | "downloaded"
  | "error";

export type AppUpdaterErrorContext = "check" | "download" | "install" | null;

export interface AppUpdaterState {
  currentVersion: string;
  latestVersion: string | null;
  hasUpdate: boolean;
  checking: boolean;
  downloading: boolean;
  downloaded: boolean;
  downloadProgress: number | null;
  error: string | null;
  enabled: boolean;
  status: AppUpdaterStatus;
  message: string | null;
  checkedAt: string | null;
  errorContext: AppUpdaterErrorContext;
  canRetry: boolean;
}

export interface AppUpdaterActionResult {
  accepted: boolean;
  completed: boolean;
  state: AppUpdaterState;
}
