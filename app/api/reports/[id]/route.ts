import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { db } from "../../../lib/db";
import { isAdmin } from "../../../lib/admin";
import type { Report } from "../../../lib/reports";

const PatchSchema = z.object({
    status: z.enum(["submitted", "acknowledged", "progress", "resolved", "rejected"]),
});

const eventLabels: Record<string, string> = {
    acknowledged: "Report acknowledged",
    progress: "Report in progress",
    resolved: "Issue resolved",
    rejected: "Report rejected",
};

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!await isAdmin(session.user.email)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const parsed = PatchSchema.safeParse(await req.json());
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    const { resource: report } = await db.item(id, id).read<Report>();
    if (!report) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const newStatus = parsed.data.status;
    const now = new Date().toISOString();

    // Update the report
    await db.item(id, id).replace({
        ...report,
        status: newStatus,
        updatedAt: now,
    });

    // Write a notification for the report's submitter (if status changed and has a label)
    if (report.submittedBy && eventLabels[newStatus] && report.submittedBy !== session.user.email) {
        const notifId = `NOTIF-${Date.now()}`;
        await db.items.create({
            id: notifId,
            type: "notification",
            userId: report.submittedBy,
            reportId: id,
            reportTitle: report.title,
            event: newStatus,
            title: eventLabels[newStatus],
            body: `Your ${report.category} report "${report.title}" has been updated.`,
            read: false,
            createdAt: now,
        });
    }

    return NextResponse.json({ status: newStatus });
}
