import React from 'react';

// -- activity log --
export type LogType = 
    | "INFO"
    | "SUCCESS"
    | "WARNING"
    | "ERROR"
    | "SYSTEM";

export interface LogEntry {
    id: string;
    timestamp: Date;
    type: LogType;
    message: string;
}

// -- window registry -- 

export type WindowId = 
    | "INFO"
    | "OVERLAY-CONTROL"
    | "TELEPROMPTER";

export interface WindowItem {
    id: WindowId;
    label: string;
    description: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    isOpen: boolean;
    isAvailable: boolean;
}