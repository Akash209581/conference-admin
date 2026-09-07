import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login page, auth API routes, and static assets
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  // Check for admin_session cookie
  const session = request.cookies.get("admin_session");
  const expectedSecret = process.env.ADMIN_SESSION_SECRET || "authenticated_super_admin_session_key";

  if (!session || session.value !== expectedSecret) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Session expired or unauthorized. Please log in to your admin account." },
        { status: 401 }
      );
    }
    const loginUrl = new URL("/conference-admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};

