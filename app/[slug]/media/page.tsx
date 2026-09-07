import { prisma } from "@/lib/prisma/client";
import { MediaForm } from "@/components/admin/media-form";
import { Image as ImageIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MediaPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const conference = await prisma.conference.findFirst({
    where: { slug, deletedAt: null },
    include: {
      settings: true
    }
  });

  const conferenceId = conference?.id || "";

  const activeTheme = await prisma.themeSetting.findFirst({
    where: {
      isActive: true,
      ...(conferenceId ? { conferenceId } : {})
    }
  });

  const themeTokens = (activeTheme?.tokens as any) || {};

  const initialMedia = {
    heroBannerUrl: themeTokens.heroBannerUrl || "/about_banner.avif",
    faviconUrl: themeTokens.faviconUrl || "/favicon.ico",
    headerLogoUrl: themeTokens.headerLogoUrl || "",
    footerLogoUrl: themeTokens.footerLogoUrl || "",
    ogImageUrl: themeTokens.ogImageUrl || ""
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
          <ImageIcon className="w-4 h-4" />
          <span>Brand Assets & Visual Media</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Media & Branding</h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload and manage your Hero banner, browser favicon, brand logos, and social share previews for{" "}
          <span className="text-slate-900 font-semibold">{conference?.name}</span>.
        </p>
      </div>

      <MediaForm conferenceId={conferenceId} slug={slug} initialMedia={initialMedia} />
    </div>
  );
}
