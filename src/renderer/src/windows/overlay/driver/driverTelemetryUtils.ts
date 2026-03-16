import type { DriverStanding, DriverTelemetrySnapshot } from "../../../types/lmu";

interface TelemetryLookup {
    readonly byId: Map<number, DriverTelemetrySnapshot>;
    readonly byDriverAndCar: Map<string, DriverTelemetrySnapshot>;
    readonly byVehicle: Map<string, DriverTelemetrySnapshot[]>;
    readonly byCarNumber: Map<string, DriverTelemetrySnapshot[]>;
    readonly byDriver: Map<string, DriverTelemetrySnapshot[]>;
}

export function createTelemetryLookup(cars: DriverTelemetrySnapshot[]): TelemetryLookup {
    const byId = new Map<number, DriverTelemetrySnapshot>();
    const byDriverAndCar = new Map<string, DriverTelemetrySnapshot>();
    const byVehicle = new Map<string, DriverTelemetrySnapshot[]>();
    const byCarNumber = new Map<string, DriverTelemetrySnapshot[]>();
    const byDriver = new Map<string, DriverTelemetrySnapshot[]>();

    for (const car of cars) {
        byId.set(car.id, car);

        const driverKey = normalizeLookup(car.driverName);
        const carNumberKey = normalizeLookup(car.carNumber);
        const vehicleKey = normalizeLookup(cleanVehicleName(car.vehicleName));

        if (driverKey && carNumberKey) {
            byDriverAndCar.set(`${driverKey}:${carNumberKey}`, car);
        }

        pushLookupValue(byVehicle, vehicleKey, car);
        pushLookupValue(byCarNumber, carNumberKey, car);
        pushLookupValue(byDriver, driverKey, car);
    }

    return {
        byId,
        byDriverAndCar,
        byVehicle,
        byCarNumber,
        byDriver,
    };
}

export function findTelemetryForDriver(
    driver: DriverStanding,
    lookup: TelemetryLookup
): DriverTelemetrySnapshot | null {
    if (driver.telemetryId !== null) {
        const exact = lookup.byId.get(driver.telemetryId);
        if (exact) {
            return exact;
        }
    }

    const driverKey = normalizeLookup(driver.driverName);
    const carNumberKey = normalizeLookup(driver.carNumber);
    const vehicleKey = normalizeLookup(driver.carName);

    if (driverKey && carNumberKey) {
        const exact = lookup.byDriverAndCar.get(`${driverKey}:${carNumberKey}`);
        if (exact) {
            return exact;
        }
    }

    const byVehicle = getUniqueLookupValue(lookup.byVehicle, vehicleKey);
    if (byVehicle) {
        return byVehicle;
    }

    const byCarNumber = getUniqueLookupValue(lookup.byCarNumber, carNumberKey);
    if (byCarNumber) {
        return byCarNumber;
    }

    return getUniqueLookupValue(lookup.byDriver, driverKey);
}

function cleanVehicleName(value: string): string {
    return value.replace(/#\w+.*$/, "").trim();
}

function normalizeLookup(value: string): string {
    return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function pushLookupValue(
    map: Map<string, DriverTelemetrySnapshot[]>,
    key: string,
    value: DriverTelemetrySnapshot
): void {
    if (!key) {
        return;
    }

    const existing = map.get(key) ?? [];
    existing.push(value);
    map.set(key, existing);
}

function getUniqueLookupValue(
    map: Map<string, DriverTelemetrySnapshot[]>,
    key: string
): DriverTelemetrySnapshot | null {
    if (!key) {
        return null;
    }

    const matches = map.get(key);
    return matches?.length === 1 ? matches[0] : null;
}
