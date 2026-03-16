import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

interface PlayerProfile {
    readonly playerName: string | null;
    readonly playerNick: string | null;
    readonly vehicleNumber: string | null;
    readonly nationalityCode: string | null;
}

const SETTINGS_PATH_CANDIDATES = [
    join("C:", "Program Files (x86)", "Steam", "steamapps", "common", "Le Mans Ultimate", "UserData", "player", "Settings.JSON"),
    join("C:", "Program Files", "Steam", "steamapps", "common", "Le Mans Ultimate", "UserData", "player", "Settings.JSON"),
    join("D:", "SteamLibrary", "steamapps", "common", "Le Mans Ultimate", "UserData", "player", "Settings.JSON"),
    join("E:", "SteamLibrary", "steamapps", "common", "Le Mans Ultimate", "UserData", "player", "Settings.JSON"),
    join("F:", "SteamLibrary", "steamapps", "common", "Le Mans Ultimate", "UserData", "player", "Settings.JSON"),
];

interface RawSettingsFile {
    DRIVER?: {
        "Player Name"?: string;
        "Player Nick"?: string;
        Nationality?: string;
    };
    CUSTOMLIVERY?: {
        vehicleNumber?: string;
    };
}

export function loadPlayerProfile(): PlayerProfile | null {
    const path = SETTINGS_PATH_CANDIDATES.find((candidate) => existsSync(candidate));
    if (!path) {
        return null;
    }

    try {
        const raw = JSON.parse(readFileSync(path, "utf8")) as RawSettingsFile;
        return {
            playerName: cleanValue(raw.DRIVER?.["Player Name"]),
            playerNick: cleanValue(raw.DRIVER?.["Player Nick"]),
            vehicleNumber: cleanValue(raw.CUSTOMLIVERY?.vehicleNumber),
            nationalityCode: cleanValue(raw.DRIVER?.Nationality)?.toUpperCase() ?? null,
        };
    } catch {
        return null;
    }
}

function cleanValue(value: string | undefined): string | null {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
}
