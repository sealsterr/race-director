import type { ReactElement } from "react";
import { motion } from "framer-motion";
import { DriverTelemetryBars } from "./DriverTelemetryBars";

interface DriverSpeedometerProps {
    readonly speedKph: number;
    readonly rpm: number;
    readonly fuelLevel: number;
    readonly veLevel: number;
    readonly throttleLevel: number;
    readonly brakeLevel: number;
}

const MAX_RPM = 10000;
const ARC_PATH = "M 17 56 A 71 71 0 0 1 159 56";

export function DriverSpeedometer({
    speedKph,
    rpm,
    fuelLevel,
    veLevel,
    throttleLevel,
    brakeLevel,
}: DriverSpeedometerProps): ReactElement {
    const progress = Math.max(0, Math.min(1, rpm / MAX_RPM));

    return (
        <div style={panelStyle}>
            <div style={topRowStyle}>
                <TopMetric label="FUEL" value={`${fuelLevel}%`} tone="#f6ad2e" />
                <TopMetric label="VE" value={`${veLevel}%`} tone="#5ad1c7" />
            </div>
            <div style={gaugeWrapStyle}>
                <svg width="100%" height="122" viewBox="0 0 176 122" style={{ overflow: "visible" }}>
                    <defs>
                        <linearGradient id="driver-speed-track" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#21b26f" />
                            <stop offset="62%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#ef4444" />
                        </linearGradient>
                    </defs>
                    <path
                        d={ARC_PATH}
                        fill="none"
                        stroke="rgba(74,81,103,0.5)"
                        strokeWidth="12"
                        strokeLinecap="round"
                        pathLength={1}
                    />
                    <motion.path
                        d={ARC_PATH}
                        fill="none"
                        stroke="url(#driver-speed-track)"
                        strokeWidth="12"
                        strokeLinecap="round"
                        pathLength={1}
                        initial={false}
                        animate={{ pathLength: progress }}
                        transition={{ type: "spring", stiffness: 88, damping: 20 }}
                        style={{ filter: "drop-shadow(0 0 12px rgba(239,68,68,0.14))" }}
                    />
                </svg>
                <div style={readoutStyle}>
                    <motion.div
                        key={speedKph}
                        initial={{ opacity: 0.65, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        style={speedValueStyle}
                    >
                        {speedKph}
                    </motion.div>
                    <div style={speedUnitStyle}>KM/H</div>
                    <motion.div
                        key={rpm}
                        initial={{ opacity: 0.65, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        style={rpmStyle}
                    >
                        {rpm.toLocaleString()} RPM
                    </motion.div>
                </div>
            </div>
            <DriverTelemetryBars throttleLevel={throttleLevel} brakeLevel={brakeLevel} />
        </div>
    );
}

function TopMetric({
    label,
    value,
    tone,
}: {
    readonly label: string;
    readonly value: string;
    readonly tone: string;
}): ReactElement {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <span style={labelStyle}>{label}</span>
            <motion.span
                key={value}
                initial={{ opacity: 0.7, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                style={{ ...valueStyle, color: tone }}
            >
                {value}
            </motion.span>
        </div>
    );
}

const panelStyle = {
    width: "100%",
    height: "100%",
    borderRadius: 11,
    border: "1px solid rgba(71,82,111,0.42)",
    background: "linear-gradient(180deg, rgba(24,27,39,0.96), rgba(20,22,32,0.9))",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
    padding: "12px 12px 10px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
} as const;

const topRowStyle = {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
} as const;

const gaugeWrapStyle = {
    position: "relative",
    height: 122,
    marginTop: 0,
} as const;

const readoutStyle = {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 34,
} as const;

const speedValueStyle = {
    fontSize: 43,
    fontWeight: 800,
    lineHeight: 0.88,
    color: "#f8fafc",
    fontVariantNumeric: "tabular-nums",
} as const;

const speedUnitStyle = {
    marginTop: 2,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.08em",
    color: "#d8dee9",
} as const;

const rpmStyle = {
    marginTop: 13,
    fontSize: 14,
    fontWeight: 600,
    color: "#97a1b6",
    fontVariantNumeric: "tabular-nums",
} as const;

const labelStyle = {
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: "0.08em",
    color: "#8f93a8",
} as const;

const valueStyle = {
    fontSize: 14,
    fontWeight: 700,
    lineHeight: 1,
    fontVariantNumeric: "tabular-nums",
} as const;
