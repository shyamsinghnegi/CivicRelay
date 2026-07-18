import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "../../../lib/db";

export async function GET() {
    const session = await getServerSession();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resources } = await db.items.query({
        query: "SELECT * FROM c WHERE c.submittedBy = @email ORDER BY c._ts DESC OFFSET 0 LIMIT 100",
        parameters: [{ name: "@email", value: session.user.email }],
    }).fetchAll();

    return NextResponse.json({ items: resources });
}
