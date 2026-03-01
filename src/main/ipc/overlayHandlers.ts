import { ipcMain, dialog, app, screen } from "electron";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import type { OverlayConfig } from "../../renderer/src/store/overlayStore";

interface PresetFile {
    version: 1;
    savedAt: string;
    savePath: string;
    overlays: OverlayConfig[];
}

export interface DisplayInfo {
    id: number;
    label: string;
    bounds: { x: number; y: number; width: number; height: number };
    isPrimary: boolean;
}

const getDefaultSavePath = (): string =>
    join(app.getPath("userData"), "presets", "default.rdpreset");

const ensureDir = (filePath: string): void => {
    const dir = dirname(filePath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
};

export const registerOverlayHandlers = (): void => {
    ipcMain.handle("overlay:getDefaultSavePath", (): string => {
        return getDefaultSavePath();
    });

    ipcMain.handle(
        "overlay:savePreset",
        (_e, overlays: OverlayConfig[], savePath: string): { ok: boolean; error?: string } => {
            try {
                const path = savePath || getDefaultSavePath();
                ensureDir(path);
                const preset: PresetFile = {
                    version: 1,
                    savedAt: new Date().toISOString(),
                    savePath: path,
                    overlays,
                };
                writeFileSync(path, JSON.stringify(preset, null, 2), "utf-8");
                return { ok: true };
            } catch (err) {
                return { ok: false, error: String(err) };
            }
        }
    );

    ipcMain.handle(
        "overlay:loadPreset",
        (_e, savePath: string): { ok: boolean; data?: PresetFile; error?: string } => {
            try {
                const path = savePath || getDefaultSavePath();
                if (!existsSync(path)) return { ok: false, error: "File not found" };
                const raw = readFileSync(path, "utf-8");
                const data: PresetFile = JSON.parse(raw);
                return { ok: true, data };
            } catch (err) {
                return { ok: false, error: String(err) };
            }
        }
    );

    ipcMain.handle(
        "overlay:pickSavePath",
        async (): Promise<{ ok: boolean; path?: string }> => {
            const result = await dialog.showSaveDialog({
                title: "Save RaceDirector Preset",
                defaultPath: getDefaultSavePath(),
                filters: [
                    { name: "RaceDirector Preset", extensions: ["rdpreset"] },
                    { name: "JSON", extensions: ["json"] },
                ],
            });
            if (result.canceled || !result.filePath) return { ok: false };
            return { ok: true, path: result.filePath };
        }
    );

    ipcMain.handle(
        "overlay:pickLoadPath",
        async (): Promise<{ ok: boolean; path?: string }> => {
            const result = await dialog.showOpenDialog({
                title: "Load RaceDirector Preset",
                filters: [
                    { name: "RaceDirector Preset", extensions: ["rdpreset"] },
                    { name: "JSON", extensions: ["json"] },
                ],
                properties: ["openFile"],
            });
            if (result.canceled || !result.filePaths[0]) return { ok: false };
            return { ok: true, path: result.filePaths[0] };
        }
    );

    // -- display detection --
    ipcMain.handle("overlay:getDisplays", (): DisplayInfo[] => {
        const primary = screen.getPrimaryDisplay();
        return screen.getAllDisplays().map((d, i) => ({
            id: d.id,
            label: `Monitor ${i + 1}${d.id === primary.id ? " (Primary)" : ""}`,
            bounds: d.bounds,
            isPrimary: d.id === primary.id,
        }));
    });
};