import type { ReportStatus } from "./status";
import type { IssueCategory } from "./categories";

export type Report = {
    id: string;
    category: IssueCategory;
    title: string;
    description: string;
    distanceKm: number;
    status: ReportStatus;
    upvoteCount: number;
    location?: string;
    aiTags?: string[];
};


export const mockNearbyReports: Report[] = [
    {
        id: "CR-4471",
        category: "pothole",
        title: "Deep pothole on main road",
        description:
            "Large pothole near the bus stop, causing vehicles to swerve into oncoming traffic.",
        distanceKm: 0.2,
        status: "progress",
        upvoteCount: 47,
        location: "Main Road, near City Bus Stand",
        aiTags: ["road-damage", "pothole", "infrastructure"],
    },
    {
        id: "CR-4468",
        category: "streetlight",
        title: "Streetlight not working",
        description: "Has been dark for over a week, making the lane unsafe at night.",
        distanceKm: 0.4,
        status: "acknowledged",
        upvoteCount: 19,
        location: "MG Road, near Junction Crossing",
        aiTags: ["streetlight", "low-light", "infrastructure"],
    },
    {
        id: "CR-4455",
        category: "garbage",
        title: "Overflowing garbage bin",
        description: "Bin hasn't been collected in days, attracting stray animals.",
        distanceKm: 0.7,
        status: "submitted",
        upvoteCount: 12,
        location: "Lalpur Colony, Sector 4",
        aiTags: ["garbage", "waste", "sanitation"],
    },
];