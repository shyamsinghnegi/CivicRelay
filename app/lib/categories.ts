import {
  Construction,
  Lightbulb,
  Trash2,
  Droplets,
  Waves,
  TrafficCone,
  Trash,
  CircleHelp,
  type LucideIcon,
} from "lucide-react";

export type IssueCategory =
  | "pothole"
  | "streetlight"
  | "garbage"
  | "water"
  | "drainage"
  | "traffic"
  | "dumping"
  | "other";

type CategoryConfig = {
  label: string;
  color: string;
  bg: string;
  icon: LucideIcon;
};

export const categoryConfig: Record<IssueCategory, CategoryConfig> = {
  pothole: {
    label: "Pothole",
    color: "var(--color-cat-pothole)",
    bg: "var(--color-cat-pothole-bg)",
    icon: Construction,
  },
  streetlight: {
    label: "Streetlight",
    color: "var(--color-cat-streetlight)",
    bg: "var(--color-cat-streetlight-bg)",
    icon: Lightbulb,
  },
  garbage: {
    label: "Garbage",
    color: "var(--color-cat-garbage)",
    bg: "var(--color-cat-garbage-bg)",
    icon: Trash2,
  },
  water: {
    label: "Water Leakage",
    color: "var(--color-cat-water)",
    bg: "var(--color-cat-water-bg)",
    icon: Droplets,
  },
  drainage: {
    label: "Drainage",
    color: "var(--color-cat-drainage)",
    bg: "var(--color-cat-drainage-bg)",
    icon: Waves,
  },
  traffic: {
    label: "Traffic Signal",
    color: "var(--color-cat-traffic)",
    bg: "var(--color-cat-traffic-bg)",
    icon: TrafficCone,
  },
  dumping: {
    label: "Illegal Dumping",
    color: "var(--color-cat-dumping)",
    bg: "var(--color-cat-dumping-bg)",
    icon: Trash,
  },
  other: {
    label: "Other",
    color: "var(--color-cat-other)",
    bg: "var(--color-cat-other-bg)",
    icon: CircleHelp,
  },
};
