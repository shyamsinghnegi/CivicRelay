import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { isAdmin } from "../../../lib/admin";

export async function GET() {
    const session = await getServerSession();
    if (!session?.user?.email) {
        return NextResponse.json({ isAdmin: false });
    }
    return NextResponse.json({ isAdmin: await isAdmin(session.user.email) });
}
