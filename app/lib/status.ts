import { CircleDot, Eye, Wrench, CheckCircle2, XCircle, type LucideIcon } from "lucide-react";

export type ReportStatus =
    | "submitted"
    | "acknowledged"
    | "progress"
    | "resolved"
    | "rejected";

type StatusConfig = {
    label: string;
    color: string;
    bg: string;
    icon: LucideIcon;
};

export const statusConfig: Record<ReportStatus, StatusConfig> = {
    submitted: {
        label: "Submitted",
        color: "var(--color-status-submitted)",
        bg: "var(--color-status-submitted-bg)",
        icon: CircleDot,
    },
    acknowledged: {
        label: "Acknowledged",
        color: "var(--color-status-acknowledged)",
        bg: "var(--color-status-acknowledged-bg)",
        icon: Eye,
    },
    progress: {
        label: "In Progress",
        color: "var(--color-status-progress)",
        bg: "var(--color-status-progress-bg)",
        icon: Wrench,
    },
    resolved: {
        label: "Resolved",
        color: "var(--color-status-resolved)",
        bg: "var(--color-status-resolved-bg)",
        icon: CheckCircle2,
    },
    rejected: {
        label: "Rejected",
        color: "var(--color-status-rejected)",
        bg: "var(--color-status-rejected-bg)",
        icon: XCircle,
    },
};
