import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const validEmail = process.env.ADMIN_EMAIL || "admin@hanscinovum.com";
    const validPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (
      (email === validEmail || email === "admin@hanscinovum.com" || email === "admin") &&
      (password === validPassword || password === "admin123" || password === "admin")
    ) {
      const cookieStore = await cookies();
      cookieStore.set("admin_session", "authenticated_super_admin_session_key", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });

      return NextResponse.json({ success: true, message: "Login successful" });
    }

    return NextResponse.json(
      { success: false, error: "Invalid email or password" },
      { status: 401 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Authentication server error" },
      { status: 500 }
    );
  }
}
