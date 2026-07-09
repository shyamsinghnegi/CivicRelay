import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { db } from "../../lib/db";
import type { ReportStatus } from "../../lib/status";

const CreateReportSchema = z.object({
    title: z.string().min(3).max(120),
    description: z.string().min(3).max(1000),
    category: z.enum([
        "pothole", "streetlight", "garbage", "water",
        "drainage", "traffic", "dumping", "other",
    ]),
    location: z.string().optional(),
    imageUrl: z.string().optional(),
    imageUrls: z.array(z.string()).optional(),
    aiTags: z.array(z.string()).optional(),
    secondaryCategories: z.array(z.enum([
        "pothole", "streetlight", "garbage", "water",
        "drainage", "traffic", "dumping", "other",
    ])).optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
});

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const offset = Math.max(0, parseInt(searchParams.get("offset") ?? "0", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));

    const { resources } = await db.items
        .query({
            query: "SELECT * FROM c ORDER BY c._ts DESC OFFSET @offset LIMIT @limit",
            parameters: [
                { name: "@offset", value: offset },
                { name: "@limit", value: limit },
            ],
        })
        .fetchAll();

    return NextResponse.json({ items: resources, offset, limit, hasMore: resources.length === limit });
}

export async function POST(req: NextRequest) {
    const session = await getServerSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = CreateReportSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { error: parsed.error.issues },
            { status: 400 }
        );
    }

    const now = new Date().toISOString();
    const report = {
        id: `CR-${Date.now()}`,
        ...parsed.data,
        status: "submitted" as ReportStatus,
        upvoteCount: 0,
        submittedBy: session.user?.email ?? "anonymous",
        createdAt: now,
        updatedAt: now,
    };

    try {
        const { resource } = await db.items.create(report);
        return NextResponse.json(resource, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Failed to save report. Please try again." }, { status: 500 });
    }
}