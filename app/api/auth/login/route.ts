import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { timingSafeEqual, createHash } from "crypto";
import { createSession } from "@/lib/session";
const attempts = new Map<string, { count: number; until: number }>();
const equal = (a: string, b: string) =>
  timingSafeEqual(
    createHash("sha256").update(a).digest(),
    createHash("sha256").update(b).digest(),
  );
export async function POST(request: Request) {
  try {
    const secret = process.env.ADMIN_SESSION_SECRET,
      email = process.env.ADMIN_EMAIL,
      password = process.env.ADMIN_PASSWORD;
    if (!secret || secret.length < 32 || !email || !password)
      return NextResponse.json(
        {
          error:
            "Configure admin credentials and an ADMIN_SESSION_SECRET of at least 32 characters.",
        },
        { status: 503 },
      );
    const now = Date.now();
    for (const [key, value] of attempts)
      if (value.until < now) attempts.delete(key);
    const key = "login";
    const attempt = attempts.get(key) || { count: 0, until: now + 60000 };
    if (attempt.count >= 10)
      return NextResponse.json(
        { error: "Too many login attempts. Try again shortly." },
        { status: 429 },
      );
    attempt.count++;
    attempts.set(key, attempt);
    const body = await request.json();
    if (
      typeof body.email !== "string" ||
      typeof body.password !== "string" ||
      body.email.length > 180 || body.password.length > 1024 ||
      !equal(body.email.trim().toLowerCase(), email.trim().toLowerCase()) ||
      !equal(body.password, password)
    )
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    attempts.delete(key);
    (await cookies()).set("admin_session", await createSession(secret), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 8 * 60 * 60,
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 400 },
    );
  }
}
