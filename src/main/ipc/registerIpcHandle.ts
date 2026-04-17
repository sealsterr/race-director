import { ipcMain } from 'electron'

// Keeps IPC handler registration idempotent across reloads and re-bootstrap flows.
export const registerIpcHandle = <Args extends unknown[], Result>(
  channel: string,
  handler: (_event: Electron.IpcMainInvokeEvent, ...args: Args) => Result | Promise<Result>
): void => {
  ipcMain.removeHandler(channel)
  ipcMain.handle(channel, handler)
}
