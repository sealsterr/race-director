import { dialog, app, screen, BrowserWindow } from "electron";
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, extname, isAbsolute, normalize } from "node:path";
import type { OverlayConfig } from "../../renderer/src/store/overlayStore";
import { registerIpcHandle } from "./registerIpcHandle";

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
const MAX_PRESET_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_PRESET_EXTENSIONS = new Set([".rdpreset", ".json"]);

const ensureDir = (filePath: string): void => {
    const dir = dirname(filePath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
};

const overlayConfigCache = new Map<string, unknown>();

const resolvePresetPath = (rawPath: string): { path?: string; error?: string } => {
    const candidatePath = (rawPath || getDefaultSavePath()).trim();
    if (!candidatePath) {
        return { error: "Preset path is empty." };
    }

    const normalizedPath = normalize(candidatePath);
    if (!isAbsolute(normalizedPath)) {
        return { error: "Preset path must be absolute." };
    }

    const extension = extname(normalizedPath).toLowerCase();
    if (!ALLOWED_PRESET_EXTENSIONS.has(extension)) {
        return { error: "Only .rdpreset or .json files are allowed." };
    }

    return { path: normalizedPath };
};

const safeSendOverlayConfig = (win: BrowserWindow, config: unknown): void => {
    try {
        if (win.isDestroyed() || win.webContents.isDestroyed()) {
            return;
        }

        win.webContents.send("overlay:configUpdate", config);
    } catch (error) {
        console.warn("Failed to broadcast overlay config update:", error);
    }
};

export const registerOverlayHandlers = (): void => {
    registerIpcHandle("overlay:getDefaultSavePath", (): string => {
        return getDefaultSavePath();
    });

    registerIpcHandle(
        "overlay:savePreset",
        (_e, overlays: OverlayConfig[], savePath: string): { ok: boolean; error?: string } => {
            try {
                const resolved = resolvePresetPath(savePath);
                if (!resolved.path) {
                    return { ok: false, error: resolved.error ?? "Invalid preset path." };
                }

                ensureDir(resolved.path);
                const preset: PresetFile = {
                    version: 1,
                    savedAt: new Date().toISOString(),
                    savePath: resolved.path,
                    overlays,
                };
                writeFileSync(resolved.path, JSON.stringify(preset, null, 2), "utf-8");
                return { ok: true };
            } catch (err) {
                return { ok: false, error: String(err) };
            }
        }
    );

    registerIpcHandle(
        "overlay:loadPreset",
        (_e, savePath: string): { ok: boolean; data?: PresetFile; error?: string } => {
            try {
                const resolved = resolvePresetPath(savePath);
                if (!resolved.path) {
                    return { ok: false, error: resolved.error ?? "Invalid preset path." };
                }

                if (!existsSync(resolved.path)) {
                    return { ok: false, error: "File not found" };
                }

                const fileStats = statSync(resolved.path);
                if (fileStats.size > MAX_PRESET_FILE_SIZE_BYTES) {
                    return { ok: false, error: "Preset file is too large." };
                }

                const raw = readFileSync(resolved.path, "utf-8");
                const data: PresetFile = JSON.parse(raw);
                return { ok: true, data };
            } catch (err) {
                return { ok: false, error: String(err) };
            }
        }
    );

    registerIpcHandle(
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

    registerIpcHandle(
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

    // * -- display detection --
    registerIpcHandle("overlay:getDisplays", (): DisplayInfo[] => {
        const primary = screen.getPrimaryDisplay();
        return screen.getAllDisplays().map((d, i) => ({
            id: d.id,
            label: `Monitor ${i + 1}${d.id === primary.id ? " (Primary)" : ""}`,
            bounds: d.bounds,
            isPrimary: d.id === primary.id,
        }));
    });

    registerIpcHandle("overlay:getConfig", (_e, id: string): unknown | null => {
        return overlayConfigCache.get(id) ?? null;
    });

    registerIpcHandle("overlay:broadcastConfig", (_e, config: unknown): void => {
        const overlayId =
            typeof config === "object" &&
            config !== null &&
            "id" in config &&
            typeof (config as { id?: unknown }).id === "string"
                ? (config as { id: string }).id
                : null;

        if (overlayId) {
            overlayConfigCache.set(overlayId, config);
        }

        BrowserWindow.getAllWindows().forEach((win) => {
            safeSendOverlayConfig(win, config);
        });
    });
};
