import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { isAdmin } from "../../../lib/admin";
import { db } from "../../../lib/db";

export async function GET() {
    const session = await getServerSession();
    if (!session?.user?.email || !await isAdmin(session.user.email)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch all non-notification docs (reports only)
    const { resources } = await db.items
        .query({
            query: "SELECT c.status, c.category FROM c WHERE (NOT IS_DEFINED(c.type) OR c.type != 'notification')",
        })
        .fetchAll();

    const byStatus: Record<string, number> = {};
    const byCategory: Record<string, number> = {};

    for (const r of resources) {
        if (r.status) byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
        if (r.category) byCategory[r.category] = (byCategory[r.category] ?? 0) + 1;
    }

    return NextResponse.json({
        total: resources.length,
        byStatus,
        byCategory,
    });
}
