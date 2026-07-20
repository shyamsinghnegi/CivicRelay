import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { isAdmin } from "../../../../lib/admin";
import { db } from "../../../../lib/db";
import type { Report } from "../../../../lib/reports";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession();
    if (!session?.user?.email || !await isAdmin(session.user.email)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { resource } = await db.item(id, id).read<Report>();

    if (!resource) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(resource);
}
