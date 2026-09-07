import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  return NextResponse.json({ success: true, message: "Logged out successfully" });
}

export async function GET() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  return NextResponse.redirect(new URL("/conference-admin/login", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3005"));
}
