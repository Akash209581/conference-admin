import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { validSession } from "./session";
export async function adminGuard() {
  const store = await cookies();
  if (
    !(await validSession(
      store.get("admin_session")?.value,
      process.env.ADMIN_SESSION_SECRET,
    ))
  )
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const h = await headers(),
    origin = h.get("origin");
  if (origin) {
    const expected =
      process.env.ADMIN_ORIGIN ||
      (h.get("x-forwarded-proto") || "http") + "://" + h.get("host");
    if (origin !== expected)
      return NextResponse.json(
        { error: "Invalid request origin" },
        { status: 403 },
      );
  }
  return null;
}
