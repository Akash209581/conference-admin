import { prisma } from "@/lib/prisma/client";
import { ContentForm } from "@/components/admin/content-form";
import { FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ContentEditorPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams.slug;

  const conference = await prisma.conference.findFirst({
    where: {
      OR: [
        { slug: { equals: slug, mode: "insensitive" } },
        { id: slug }
      ],
      deletedAt: null
    },
    include: {
      venue: true,
      settings: true,
      speakers: {
        where: { deletedAt: null },
        include: { organization: true, imageAsset: true },
        orderBy: { sortOrder: "asc" }
      }
    }
  });


  const conferenceId = conference?.id || "";

  const homeSetting = conference?.settings?.find((s) => s.key === "page_content_home");
  const footerSetting = conference?.settings?.find((s) => s.key === "page_content_footer");
  const brandingSetting = conference?.settings?.find((s) => s.key === "branding_assets");
  const activeTheme = await prisma.themeSetting.findFirst({
    where: { conferenceId, isActive: true }
  });

  const brandingVal = (brandingSetting?.value as any) || {};
  const themeTokens = (activeTheme?.tokens as any) || {};
  const initialFaviconUrl = brandingVal.faviconUrl || themeTokens.faviconUrl || "/favicon.ico";

  const initialSections = (homeSetting?.value as any) || [];
  const initialFooter = (footerSetting?.value as any) || {
    tagline: conference?.fullName || "International Conference on Global Innovation and Technology",
    contactEmail: "secretariat@icgit2026.org",
    contactPhone: "+971 4 000 2026",
    contactAddress: "Dubai World Trade Centre, Dubai, United Arab Emirates",
    footerCopyright: "Copyright 2026 ICGIT. All rights reserved.",
    quickLinks: [
      { label: "Home", href: "/#home" },
      { label: "About", href: "/#about" },
      { label: "Brochure", href: "/#brochure" },
      { label: "Sessions", href: "/#sessions" },
      { label: "Speakers", href: "/#speakers" },
      { label: "Venue", href: "/#venue" },
      { label: "Contact Us", href: "/#contact" }
    ],
    resourceLinks: [
      { label: "Brochure", href: "/brochure" },
      { label: "Abstract Submission", href: "/abstracts" },
      { label: "Registration", href: "/registration" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" }
    ]
  };

  const initialSpeakers = (conference?.speakers || []).map((s) => ({
    id: s.id,
    name: s.name,
    role: s.role,
    topic: s.topic,
    bio: s.bio,
    organizationName: s.organization?.name || "Independent",
    imageAssetId: s.imageAsset?.storageKey || s.imageAssetId || null,
    sortOrder: s.sortOrder
  }));

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
          <FileText className="w-4 h-4" />
          <span>Live Website Content Editor</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Homepage Sections & Footer</h1>
        <p className="text-sm text-slate-500 mt-1">
          Customize and toggle all visible sections on the public portal for{" "}
          <span className="text-slate-900 font-semibold">{conference?.name}</span>.
        </p>
      </div>

      <ContentForm
        conferenceId={conferenceId}
        slug={slug}
        initialSections={initialSections}
        initialFooter={initialFooter}
        initialSpeakers={initialSpeakers}
        initialFaviconUrl={initialFaviconUrl}
      />
    </div>
  );
}
