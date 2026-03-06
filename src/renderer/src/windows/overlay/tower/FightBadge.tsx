import { motion, AnimatePresence } from "framer-motion";
import type { FightLabel } from "./constants";

interface FightBadgeProps {
    readonly label: FightLabel;
    readonly visible:  boolean;
}

export default function FightBadge({ label, visible }: FightBadgeProps) {
    return (
        <AnimatePresence>
            {visible && (
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
                        border: "1px solid #f59e0b",
                        marginBottom: 2,
                    }}
                >
                    <motion.span
                        animate={{ opacity: [1, 0.4, 1] }}
                        transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            backgroundColor: "#f59e0b",
                            display: "inline-block",
                        }}
                    />
                    <span
                        style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#f59e0b",
                            letterSpacing: "0.1em",
                            fontFamily: "inherit",
                        }}
                    >
                        {label}
                    </span>
                </motion.div>
            )}
        </AnimatePresence>
    );
}