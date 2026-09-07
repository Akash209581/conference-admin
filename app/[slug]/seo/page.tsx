import { prisma } from "@/lib/prisma/client";
import { SeoForm } from "@/components/admin/seo-form";
import { Globe2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SeoPage({
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

  const seoSetting = conference?.settings?.find((s) => s.key === "seo_metadata");
  const seoVal = (seoSetting?.value as any) || {};

  const initialData = {
    metaTitle: seoVal.metaTitle || `${conference?.name || "ICGIT 2026"} - Global Innovation & Technology Summit`,
    metaDescription: seoVal.metaDescription || conference?.description || "Explore international innovation and technology keynotes, research tracks, and workshops.",
    metaKeywords: seoVal.metaKeywords || "AI, Innovation, Technology, Robotics, Dubai Conference",
    canonicalUrl: seoVal.canonicalUrl || "https://hanscinovum.com/ICGIT",
    googleAnalyticsId: seoVal.googleAnalyticsId || ""
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
          <Globe2 className="w-4 h-4" />
          <span>Search Engine Optimization</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">SEO & Social Metadata</h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure search engine title tags, meta descriptions, and canonical URLs for{" "}
          <span className="text-slate-900 font-semibold">{conference?.name}</span>.
        </p>
      </div>

      <SeoForm conferenceId={conferenceId} slug={slug} initialData={initialData} />
    </div>
  );
}
