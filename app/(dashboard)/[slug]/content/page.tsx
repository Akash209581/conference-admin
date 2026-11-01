import { prisma } from "@/lib/prisma/client";
import { ContentForm } from "@/components/admin/content-form";
import { FileText } from "lucide-react";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export default async function ContentEditorPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams.slug;

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

  let conference: any = null;
  let activeTheme: any = null;

  try {
    conference = await prisma.conference.findFirst({
      where: isUUID
        ? { OR: [{ id: slug }, { slug: { equals: slug, mode: "insensitive" } }], deletedAt: null }
        : { slug: { equals: slug, mode: "insensitive" }, deletedAt: null },
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

    if (conference?.id) {
      activeTheme = await prisma.themeSetting.findFirst({
        where: { conferenceId: conference.id, isActive: true }
      });
    }
  } catch (err) {
    console.warn("DB offline or connection issue in ContentEditorPage:", err);
  }

  // Fallback to local settings file if available
  let localSettings: any = null;
  try {
    const candidatePaths = [
      path.join(process.cwd(), "storage", "settings.json"),
      path.join(process.cwd(), "..", "mainweb", "storage", "settings.json"),
      "C:\\Users\\banda\\Desktop\\mainweb\\storage\\settings.json"
    ];
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        localSettings = JSON.parse(fs.readFileSync(p, "utf8"));
        break;
      }
    }
  } catch {}

  const conferenceId = conference?.id || "default-conf-id";

  const homeSetting = conference?.settings?.find((s: any) => s.key === "page_content_home");
  const footerSetting = conference?.settings?.find((s: any) => s.key === "page_content_footer");
  const brandingSetting = conference?.settings?.find((s: any) => s.key === "branding_assets");
  const navSetting = conference?.settings?.find((s: any) => s.key === "navigation_menu");
  const committeeSetting = conference?.settings?.find((s: any) => s.key === "organizing_committee");
  const tracksSetting = conference?.settings?.find((s: any) => s.key === "scientific_tracks");
  const pricingSetting = conference?.settings?.find((s: any) => s.key === "registration_pricing");
  const abstractSetting = conference?.settings?.find((s: any) => s.key === "abstract_settings");
  const policiesSetting = conference?.settings?.find((s: any) => s.key === "policies");

  const brandingVal = (brandingSetting?.value as any) || localSettings?.branding || {};
  const themeTokens = (activeTheme?.tokens as any) || {};
  const initialFaviconUrl = brandingVal.faviconUrl || themeTokens.faviconUrl || "/favicon.ico";

  const initialSections = (homeSetting?.value as any) || localSettings?.sections || [];
  const initialNavbar = (navSetting?.value as any) || localSettings?.navigation || [
    { label: "Home", href: "/" },
    { label: "About", href: "/#about" },
    { label: "Brochure", href: "/brochure" },
    { label: "Tracks", href: "/sessions" },
    { label: "Committee", href: "/#committee" },
    { label: "Speakers", href: "/#speakers" },
    { label: "Abstracts", href: "/abstracts" },
    { label: "Registration", href: "/registration" },
    { label: "Contact Us", href: "/#contact" }
  ];

  const initialCommittee = (committeeSetting?.value as any) || localSettings?.committee || undefined;
  const initialTracks = (tracksSetting?.value as any) || localSettings?.tracks || undefined;
  const initialPricing = (pricingSetting?.value as any) || (localSettings?.registration ? {
    label: localSettings.registration.label || "Early-bird delegate rates",
    note: localSettings.registration.note || "",
    student: localSettings.registration.student || { EUR: 199, USD: 219, GBP: 179 },
    academic: localSettings.registration.academic || { EUR: 399, USD: 439, GBP: 359 },
    industry: localSettings.registration.industry || { EUR: 499, USD: 549, GBP: 449 },
    accommodation: localSettings.accommodation || {
      single: { EUR: 120, USD: 135, GBP: 105 },
      double: { EUR: 160, USD: 180, GBP: 140 }
    }
  } : undefined);
  const initialAbstractSettings = (abstractSetting?.value as any) || localSettings?.abstract || undefined;
  const initialPolicies = (policiesSetting?.value as any) || localSettings?.policies || undefined;

  const initialFooter = (footerSetting?.value as any) || localSettings?.footer || {
    tagline: conference?.fullName || "International Conference on Global Innovation and Technology",
    contactEmail: "secretariat@icgit2026.org",
    contactPhone: "+971 4 000 2026",
    contactAddress: "Dubai World Trade Centre, Dubai, United Arab Emirates",
    footerCopyright: "Copyright 2026 ICGIT. All rights reserved.",
    quickLinks: [
      { label: "Home", href: "/#home" },
      { label: "About", href: "/#about" },
      { label: "Brochure", href: "/brochure" },
      { label: "Sessions", href: "/#sessions" },
      { label: "Committee", href: "/#committee" },
      { label: "Speakers", href: "/#speakers" },
      { label: "Contact Us", href: "/#contact" }
    ],
    resourceLinks: [
      { label: "Brochure", href: "/brochure" },
      { label: "Abstract Submission", href: "/abstracts" },
      { label: "Registration", href: "/registration" },
      { label: "Committee", href: "/committee" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" }
    ]
  };

  const initialSpeakers = (conference?.speakers || []).map((s: any) => ({
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
          Customize, reorder navigation items, and toggle all visible sections on the public portal for{" "}
          <span className="text-slate-900 font-semibold">{conference?.name || "ICGIT 2026"}</span>.
        </p>
      </div>

      <ContentForm
        conferenceId={conferenceId}
        slug={slug}
        initialSections={initialSections}
        initialFooter={initialFooter}
        initialSpeakers={initialSpeakers}
        initialFaviconUrl={initialFaviconUrl}
        initialNavbar={initialNavbar}
        initialCommittee={initialCommittee}
        initialTracks={initialTracks}
        initialPricing={initialPricing}
        initialAbstractSettings={initialAbstractSettings}
        initialPolicies={initialPolicies}
      />
    </div>
  );
}
