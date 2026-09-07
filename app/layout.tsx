import type { Metadata } from "next";
import "./globals.css";
import { prisma } from "@/lib/prisma/client";
import { AdminSidebar } from "@/components/admin/layout/admin-sidebar";
import { AdminHeader } from "@/components/admin/layout/admin-header";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Portal - Multi-Conference Management",
  description: "Super Admin Dashboard for real-time conference management."
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  let conferences: Array<{ id: string; name: string; slug: string }> = [];
  try {
    conferences = await prisma.conference.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, slug: true },
      orderBy: { startDate: "desc" }
    });
  } catch (err) {
    console.error("Admin layout DB error:", err);
  }

  const currentSlug = conferences[0]?.slug || "icgit-2026";

  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen antialiased flex font-sans">
        <AdminSidebar slug={currentSlug} />
        <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto bg-slate-50">
          <AdminHeader conferences={conferences} currentSlug={currentSlug} />
          <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
