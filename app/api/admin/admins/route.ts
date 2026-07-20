import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { isAdmin, invalidateAdminCache } from "../../../lib/admin";
import { adminsDb } from "../../../lib/db";
import { z } from "zod";

const AddSchema = z.object({
    email: z.string().email(),
});

export async function GET() {
    const session = await getServerSession();
    if (!session?.user?.email || !await isAdmin(session.user.email)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { resources } = await adminsDb.items
        .query("SELECT c.id, c.email, c.addedAt FROM c ORDER BY c.addedAt ASC")
        .fetchAll();

    return NextResponse.json({ items: resources });
}

export async function POST(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.user?.email || !await isAdmin(session.user.email)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const parsed = AddSchema.safeParse(await req.json());
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();
    const id = `ADMIN-${email}`;

    await adminsDb.items.upsert({
        id,
        email,
        addedAt: new Date().toISOString(),
        addedBy: session.user.email,
    });

    invalidateAdminCache(email);
    return NextResponse.json({ id, email }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.user?.email || !await isAdmin(session.user.email)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

    // Prevent removing yourself
    if (email.toLowerCase() === session.user.email.toLowerCase()) {
        return NextResponse.json({ error: "Cannot remove yourself" }, { status: 400 });
    }

    const id = `ADMIN-${email.toLowerCase()}`;
    await adminsDb.item(id, email.toLowerCase()).delete();

    invalidateAdminCache(email);
    return NextResponse.json({ ok: true });
}
