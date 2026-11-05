"use client";
import { usePathname, useParams } from "next/navigation";
import { AdminSidebar } from "./admin-sidebar";
import { AdminHeader } from "./admin-header";
import "@/components/reference/style.css";
import "./reference-theme.css";
export function LegacyShell({
  children,
  conferences,
}: {
  children: React.ReactNode;
  conferences: Array<{ id: string; name: string; slug: string }>;
}) {
  const params = useParams();
  const slug = String(params?.slug || conferences[0]?.slug || "icgit-2026");
  const pathname = usePathname().replace(/^\/conference-admin/, "");
  if (pathname === "/" + slug) return <>{children}</>;
  return (
    <div className="admin unified-portal legacy-portal">
      <AdminSidebar slug={slug} />
      <div className="workspace">
        <AdminHeader conferences={conferences} currentSlug={slug} />
        <main>{children}</main>
      </div>
    </div>
  );
}
