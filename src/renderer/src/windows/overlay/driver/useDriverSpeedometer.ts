import { useEffect, useMemo, useState } from "react";
import type { DriverStanding } from "../../../types/lmu";

interface DriverSpeedometerData {
    readonly speedKph: number;
    readonly rpm: number;
    readonly fuelLevel: number;
    readonly veLevel: number;
    readonly throttleLevel: number;
    readonly brakeLevel: number;
}

const CLASS_SPEED_LIMITS = {
    HYPERCAR: 338,
    LMP2: 318,
    LMP3: 288,
    LMGT3: 292,
    GTE: 298,
    UNKNOWN: 280,
} as const;

export function useDriverSpeedometer(
    driver: DriverStanding,
    isPreview: boolean
): DriverSpeedometerData {
    if (isPreview) {
        return {
            speedKph: 320,
            rpm: 10000,
            fuelLevel: 100,
            veLevel: 100,
            throttleLevel: 100,
            brakeLevel: 100,
        };
    }

    const limit = CLASS_SPEED_LIMITS[driver.carClass] ?? CLASS_SPEED_LIMITS.UNKNOWN;
    const seed = useMemo(() => {
        return driver.slotId * 0.37 + driver.position * 0.21 + driver.lapsCompleted * 0.13;
    }, [driver.lapsCompleted, driver.position, driver.slotId]);
    const [tick, setTick] = useState(0);

    useEffect(() => {
        setTick(0);
        const interval = globalThis.setInterval(() => {
            setTick((value) => value + 1);
        }, isPreview ? 2200 : 1800);

        return () => globalThis.clearInterval(interval);
    }, [isPreview, seed]);

    const phase = tick * (isPreview ? 0.9 : 1.15) + seed;
    const speedWave = (Math.sin(phase) + 1) / 2;
    const detailWave = (Math.sin(phase * 1.63 + 0.45) + 1) / 2;
    const blended = Math.min(1, 0.22 + speedWave * 0.54 + detailWave * 0.18);
    const speedKph = Math.round(limit * blended);
    const rpm = Math.round(6100 + blended * 6600);
    const throttleLevel = Math.round(Math.min(100, 24 + blended * 72));
    const brakePulse = (Math.sin(phase * 1.37 + 2.2) + 1) / 2;
    const brakeLevel = Math.round(Math.max(0, (1 - speedWave) * 38 + brakePulse * 22));
    const fuelTrend = 86 - (driver.lapsCompleted % 18) * 2.1 - tick * 0.4;
    const fuelLevel = Math.max(9, Math.min(99, Math.round(fuelTrend)));
    const veLevel = Math.max(18, Math.min(99, Math.round(44 + detailWave * 38 - speedWave * 10)));

    return {
        speedKph,
        rpm,
        fuelLevel,
        veLevel,
        throttleLevel,
        brakeLevel,
    };
}
