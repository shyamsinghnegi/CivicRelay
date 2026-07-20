import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { isAdmin } from "../../../lib/admin";
import { db } from "../../../lib/db";

export async function GET(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.user?.email || !await isAdmin(session.user.email)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const offset = Math.max(0, parseInt(searchParams.get("offset") ?? "0", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "25", 10)));
    const status = searchParams.get("status") ?? "";
    const category = searchParams.get("category") ?? "";

    const conditions: string[] = ["(NOT IS_DEFINED(c.type) OR c.type != 'notification')"];
    const parameters: { name: string; value: string | number }[] = [
        { name: "@offset", value: offset },
        { name: "@limit", value: limit },
    ];

    if (status) {
        conditions.push("c.status = @status");
        parameters.push({ name: "@status", value: status });
    }
    if (category) {
        conditions.push("c.category = @category");
        parameters.push({ name: "@category", value: category });
    }

    const where = conditions.join(" AND ");
    const query = `SELECT * FROM c WHERE ${where} ORDER BY c._ts DESC OFFSET @offset LIMIT @limit`;

    const { resources } = await db.items.query({ query, parameters }).fetchAll();

    return NextResponse.json({
        items: resources,
        offset,
        limit,
        hasMore: resources.length === limit,
    });
}
