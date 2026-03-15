import type { ReactElement } from "react";
import { motion } from "framer-motion";

export function DriverTelemetryBars({
    throttleLevel,
    brakeLevel,
}: {
    readonly throttleLevel: number;
    readonly brakeLevel: number;
}): ReactElement {
    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
            <PedalBar label="THROTTLE" value={throttleLevel} color="#22c55e" />
            <PedalBar label="BRAKE" value={brakeLevel} color="#ef4444" />
        </div>
    );
}

function PedalBar({
    label,
    value,
    color,
}: {
    readonly label: string;
    readonly value: number;
    readonly color: string;
}): ReactElement {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", color: "#8f93a8" }}>{label}</div>
            <div style={{ height: 7, borderRadius: 999, background: "rgba(68,74,93,0.42)", overflow: "hidden" }}>
                <motion.div
                    animate={{ width: `${value}%` }}
                    transition={{ type: "spring", stiffness: 90, damping: 18 }}
                    style={{ height: "100%", borderRadius: 999, background: color }}
                />
            </div>
        </div>
    );
}
