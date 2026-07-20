import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Middleware runs in the Edge runtime — no Cosmos SDK available here.
// We only check that the user is authenticated. The admin role check
// (Cosmos admins container) happens in the admin layout server component,
// which redirects non-admins to /.
export async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token?.email) {
        return NextResponse.redirect(new URL("/auth/signin", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};
