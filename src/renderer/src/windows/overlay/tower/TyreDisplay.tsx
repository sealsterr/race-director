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
                minWidth: compact ? 14 : 18,
                height: compact ? 14 : 18,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: compact ? 3 : "999px",
                backgroundColor: `${color}22`,
                border: `1px solid ${color}55`,
                color,
                fontSize: compact ? 9 : 14,
                fontWeight: 900,
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
        return <TyreGlyph compound={firstCompound} settings={settings} compact={false} />;
    }

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: 3,
                justifyItems: "end",
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
    );
}
