import React from "react";
import { motion } from "framer-motion";
import {
  Table2,
  Monitor,
  Mic2,
  ExternalLink,
  Lock,
} from "lucide-react";
import type { WindowId, WindowItem } from "../../../types/dashboard";

interface SidebarProps {
  windows: WindowItem[];
  onLaunch: (id: WindowId) => void;
}

// -- icon map -- 
const WINDOW_DEFINITIONS: Omit<WindowItem, "isOpen">[] = [
  {
    id: "INFO",
    label: "Info Window",
    description: "Live timing & driver data",
    icon: Table2,
    isAvailable: true,
  },
  {
    id: "OVERLAY-CONTROL",
    label: "Overlay Dashboard",
    description: "Broadcast overlay control",
    icon: Monitor,
    isAvailable: false,
  },
  {
    id: "TELEPROMPTER",
    label: "Teleprompter",
    description: "AI commentary assistant",
    icon: Mic2,
    isAvailable: false,
  },
];

interface WindowButtonProps {
  item: WindowItem;
  onLaunch: (id: WindowId) => void;
}

const getButtonClass = (item: WindowItem): string => {
    if (item.isOpen) {
        return "border-rd-accent/40 bg-rd-accent/10 cursor-pointer";
    }
    if (item.isAvailable) {
        return "border-rd-border bg-rd-elevated hover:border-rd-border/80 hover:bg-rd-border/40 cursor-pointer";
    }
    return "border-rd-border/40 bg-rd-surface cursor-not-allowed opacity-50";
};

const getIconClass = (item: WindowItem): string => {
    if (item.isOpen) {
        return "bg-rd-accent/20 text-rd-accent";
    }
    return "bg-rd-border/50 text-rd-muted";
}

const getLabelClass = (item: WindowItem): string => {
    if (item.isOpen) {
        return "text-rd-accent";
    }
    return "text-rd-text";
};

const RightIndicator = ({ item }: { item: WindowItem }): React.ReactElement => {
    if (item.isAvailable) {
        if (item.isOpen) {
            return <div className="h-1.5 w-1.5 rounded-full bg-rd-accent" />;
        }
        return (<ExternalLink size={11} className="text-rd-subtle opacity-0 transition-opacity group-hover:opacity-100" />
        );
    }
    return <Lock size={11} className="text-rd-subtle" />;
};

const WindowButton = ({ item, onLaunch }: WindowButtonProps): React.ReactElement => {
  const Icon = item.icon;

  return (
    <motion.button
      whileHover={item.isAvailable ? { x: 2 } : {}}
      whileTap={item.isAvailable ? { scale: 0.98 } : {}}
      onClick={() => item.isAvailable && onLaunch(item.id)}
      disabled={!item.isAvailable}
      className={`
        group relative flex w-full items-center gap-3 rounded border p-3 text-left transition-colors duration-150
        ${getButtonClass(item)}
      `}
    >
      {/* -- icon -- */}
      <div
        className={`
          flex h-8 w-8 shrink-0 items-center justify-center rounded
          ${getIconClass(item)}
        `}
      >
        <Icon size={15} />
      </div>

      {/* -- labels -- */}
      <div className="min-w-0 flex-1">
        <p className={`text-xs font-semibold tracking-wide ${getLabelClass(item)}`}>
          {item.label}
        </p>
        <p className="text-xs leading-snug text-rd-subtle whitespace-normal break-words">{item.description}</p>
      </div>

      {/* -- right indicator -- */}
      <div className="shrink-0">
        <RightIndicator item={item} />
      </div>
    </motion.button>
  );
};

const Sidebar = ({ windows, onLaunch }: SidebarProps): React.ReactElement => {
  return (
    <div
      className="
        flex w-64 shrink-0 flex-col border-r border-rd-border
        bg-rd-surface
      "
    >
      {/* -- section header -- */}
      <div className="px-4 pb-2 pt-5">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-rd-subtle">
          Options
        </p>
      </div>

      {/* -- window buttons -- */}
      <div className="flex flex-col gap-1.5 px-3">
        {windows.map((item) => (
          <WindowButton key={item.id} item={item} onLaunch={onLaunch} />
        ))}
      </div>
    </div>
  );
};

export { WINDOW_DEFINITIONS };
export default Sidebar;