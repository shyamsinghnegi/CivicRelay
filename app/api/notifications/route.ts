import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "../../lib/db";

export async function GET() {
    const session = await getServerSession();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resources } = await db.items.query({
        query: `SELECT * FROM c WHERE c.type = "notification" AND c.userId = @email ORDER BY c.createdAt DESC OFFSET 0 LIMIT 50`,
        parameters: [{ name: "@email", value: session.user.email }],
    }).fetchAll();

    return NextResponse.json({ items: resources });
}

// Mark all notifications as read for this user
export async function PATCH() {
    const session = await getServerSession();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resources } = await db.items.query({
        query: `SELECT * FROM c WHERE c.type = "notification" AND c.userId = @email AND c.read = false`,
        parameters: [{ name: "@email", value: session.user.email }],
    }).fetchAll();

    await Promise.all(
        resources.map((n) => db.item(n.id, n.id).replace({ ...n, read: true }))
    );

    return NextResponse.json({ marked: resources.length });
}
