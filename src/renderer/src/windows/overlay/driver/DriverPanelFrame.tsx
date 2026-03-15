import type { ReactElement, ReactNode } from "react";
import { motion } from "framer-motion";

export function DriverPanelFrame({
    children,
    width,
    disableEnterAnimation = false,
}: {
    readonly children: ReactNode;
    readonly width: number;
    readonly disableEnterAnimation?: boolean;
}): ReactElement {
    return (
        <motion.div
            layout
            initial={
                disableEnterAnimation
                    ? false
                    : { opacity: 0, width: 0, scale: 0.98 }
            }
            animate={{ opacity: 1, width, scale: 1 }}
            exit={{ opacity: 0, width: 0, scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            style={{
                flex: `0 0 ${width}px`,
                width,
                minWidth: width,
                flexShrink: 0,
                alignSelf: "stretch",
                overflow: "hidden",
            }}
        >
            {children}
        </motion.div>
    );
}
