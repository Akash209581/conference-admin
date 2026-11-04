import { adminGuard } from "@/lib/admin-guard";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
export async function POST() {
  const denied = await adminGuard();
  if (denied) return denied;
  const store = await cookies();
  store.set("admin_session", "", { path: "/conference-admin", maxAge: 0 });
  store.set("admin_session", "", { path: "/", maxAge: 0 });
  return NextResponse.json({ success: true });
}
