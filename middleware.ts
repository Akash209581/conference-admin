import { NextResponse, type NextRequest } from "next/server";
import { validSession } from "@/lib/session";
import { isValidOrigin } from "@/lib/origin";

export async function middleware(request: NextRequest) {
  const pathname =
    request.nextUrl.pathname.replace(/^\/conference-admin(?=\/|$)/, "") || "/";
  const api = pathname.startsWith("/api/");
  if (api && !["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    const origin = request.headers.get("origin");
    const host =
      request.headers.get("x-forwarded-host") ||
      request.headers.get("host") ||
      request.nextUrl.host;
    const proto =
      request.headers.get("x-forwarded-proto") ||
      request.nextUrl.protocol.replace(":", "");

    if (!isValidOrigin(origin, host, proto, request.nextUrl.origin)) {
      return NextResponse.json(
        { error: "Invalid request origin" },
        { status: 403 },
      );
    }
  }
  if (
    pathname === "/login" ||
    pathname === "/api/auth/login" ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico"
  )
    return NextResponse.next();
  if (
    !(await validSession(
      request.cookies.get("admin_session")?.value,
      process.env.ADMIN_SESSION_SECRET,
    ))
  ) {
    if (api)
      return NextResponse.json(
        { error: "Session expired or unauthorized." },
        { status: 401 },
      );
    return NextResponse.redirect(
      new URL("/conference-admin/login", request.url),
    );
  }
  const response = NextResponse.next();
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "same-origin");
  return response;
}
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
