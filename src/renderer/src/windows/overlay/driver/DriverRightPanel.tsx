import type { ReactElement } from "react";
import type { BrandMark } from "./driverCardUtils";

export function DriverRightPanel({
    brandMark: _brandMark,
    modelName: _modelName,
    showCarLogo: _showCarLogo,
    showCarModel: _showCarModel,
}: {
    readonly brandMark: BrandMark;
    readonly modelName: string;
    readonly showCarLogo: boolean;
    readonly showCarModel: boolean;
}): ReactElement {
    return (
        <div
            style={{
                height: "100%",
                padding: 10,
                borderRadius: 11,
                border: "1px solid rgba(71,82,111,0.42)",
                background: "linear-gradient(180deg, rgba(24,27,39,0.96), rgba(20,22,32,0.9))",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
            }}
        />
    );
}
