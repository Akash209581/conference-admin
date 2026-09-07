import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const validEmail = process.env.ADMIN_EMAIL;
    const validPassword = process.env.ADMIN_PASSWORD;
    const sessionSecret = process.env.ADMIN_SESSION_SECRET || "authenticated_super_admin_session_key";

    if (!validEmail || !validPassword) {
      return NextResponse.json(
        { success: false, error: "ADMIN_EMAIL and ADMIN_PASSWORD must be configured in .env on the server." },
        { status: 500 }
      );
    }

    if (
      email &&
      password &&
      email.trim().toLowerCase() === validEmail.trim().toLowerCase() &&
      password === validPassword
    ) {
      const cookieStore = await cookies();
      cookieStore.set("admin_session", sessionSecret, {
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
