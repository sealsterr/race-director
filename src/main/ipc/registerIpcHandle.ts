import { ipcMain } from "electron";

// * -- ipc registration helper --
// Keeps handlers idempotent across reloads and re-bootstrap flows.
export const registerIpcHandle = <Args extends unknown[], Result>(
  channel: string,
  handler: (_event: Electron.IpcMainInvokeEvent, ...args: Args) => Result | Promise<Result>
): void => {
  // TODO: Add optional runtime payload validation per channel.
  ipcMain.removeHandler(channel);
  ipcMain.handle(channel, handler);
};
