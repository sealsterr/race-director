import type { ReactElement } from "react";
import type { DriverStanding } from "../../../types/lmu";
import { DriverSpeedometer } from "./DriverSpeedometer";
import { useDriverSpeedometer } from "./useDriverSpeedometer";

export function DriverRightPanel({
    driver,
    isPreview,
}: {
    readonly driver: DriverStanding;
    readonly isPreview: boolean;
}): ReactElement {
    const speedometer = useDriverSpeedometer(driver, isPreview);

    return (
        <DriverSpeedometer
            speedKph={speedometer.speedKph}
            rpm={speedometer.rpm}
            fuelLevel={speedometer.fuelLevel}
            veLevel={speedometer.veLevel}
            throttleLevel={speedometer.throttleLevel}
            brakeLevel={speedometer.brakeLevel}
        />
    );
}
