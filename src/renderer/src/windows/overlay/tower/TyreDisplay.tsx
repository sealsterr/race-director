import type { TowerSettings } from "../../../store/overlayStore";
import type { TyreCompound, TyreSet } from "../../../types/lmu";
import {
    TYRE_INFO,
    getTyreColor,
    normalizeTyreCompound,
    type TyreCompoundKey,
} from "./constants";

interface TyreDisplayProps {
    readonly tyreCompound: TyreCompound;
    readonly tyreSet: TyreSet | null;
    readonly settings: TowerSettings;
}

function TyreGlyph({
    compound,
    settings,
    compact,
}: {
    readonly compound: TyreCompoundKey;
    readonly settings: TowerSettings;
    readonly compact: boolean;
}) {
    const color = getTyreColor(compound, settings);

    return (
        <span
            style={{
                width: compact ? 15 : 24,
                height: compact ? 15 : 24,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: compact ? 0 : "999px",
                backgroundColor: compact ? "transparent" : `${color}22`,
                border: compact ? "none" : `1px solid ${color}55`,
                color,
                boxSizing: "border-box",
                fontSize: compact ? 13 : 15,
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: "0.04em",
            }}
        >
            {TYRE_INFO[compound].initial}
        </span>
    );
}

function getTyreLayout(
    tyreCompound: TyreCompound,
    tyreSet: TyreSet | null
): TyreCompoundKey[] {
    if (tyreSet) {
        return [
            normalizeTyreCompound(tyreSet.frontLeft),
            normalizeTyreCompound(tyreSet.frontRight),
            normalizeTyreCompound(tyreSet.rearLeft),
            normalizeTyreCompound(tyreSet.rearRight),
        ];
    }

    const compound = normalizeTyreCompound(tyreCompound);
    return [compound, compound, compound, compound];
}

export default function TyreDisplay({
    tyreCompound,
    tyreSet,
    settings,
}: TyreDisplayProps) {
    const layout = getTyreLayout(tyreCompound, tyreSet);
    const firstCompound = layout[0];
    const allSame = layout.every((compound) => compound === firstCompound);

    if (allSame) {
        return (
            <div style={footprintStyle}>
                <TyreGlyph compound={firstCompound} settings={settings} compact={false} />
            </div>
        );
    }

    return (
        <div style={footprintStyle}>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 15px)",
                    gridTemplateRows: "repeat(2, 15px)",
                    columnGap: 5,
                    rowGap: 3,
                    justifyItems: "center",
                    alignItems: "center",
                }}
            >
                {layout.map((compound, index) => (
                    <TyreGlyph
                        key={`${compound}-${index}`}
                        compound={compound}
                        settings={settings}
                        compact
                    />
                ))}
            </div>
        </div>
    );
}

const footprintStyle = {
    width: 35,
    minWidth: 35,
    height: 33,
    display: "grid",
    placeItems: "center",
} as const;
