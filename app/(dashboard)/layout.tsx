import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { validSession } from "@/lib/session";
import { prisma } from "@/lib/prisma/client";
import { LegacyShell } from "@/components/admin/layout/legacy-shell";
export const dynamic = "force-dynamic";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (
    !(await validSession(
      (await cookies()).get("admin_session")?.value,
      process.env.ADMIN_SESSION_SECRET,
    ))
  )
    redirect("/login");
  let conferences: Array<{ id: string; name: string; slug: string }> = [];
  try {
    conferences = await prisma.conference.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, slug: true },
      orderBy: { startDate: "desc" },
    });
  } catch {}
  return <LegacyShell conferences={conferences}>{children}</LegacyShell>;
}
