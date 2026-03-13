import { AnimatePresence, motion } from "framer-motion";
import type { FightLabel } from "./constants";

interface FightBadgeProps {
    readonly label: FightLabel;
}

export default function FightBadge({ label }: FightBadgeProps) {
    return (
        <AnimatePresence>
            <motion.div
                key={label}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "2px 8px",
                    borderRadius: 3,
                    backgroundColor: "#1e1e2e",
                    border: "1px solid #facc15",
                }}
            >
                <motion.span
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        backgroundColor: "#facc15",
                        display: "inline-block",
                    }}
                />
                <span
                    style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#facc15",
                        letterSpacing: "0.1em",
                        fontFamily: "inherit",
                    }}
                >
                    {label}
                </span>
            </motion.div>
        </AnimatePresence>
    );
}
