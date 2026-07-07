import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/app/lib/db";
import type { Report } from "@/app/lib/reports";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorised " }, { status: 401 });
    }

    const { id } = await params;

    const { resource: report } = await db.item(id, id).read<Report>();
    if (!report) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { resource: updated } = await db.item(id, id).replace({
        ...report,
        upvoteCount: (report.upvoteCount ?? 0) + 1,
        updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ upvoteCount: updated?.upvoteCount });
}