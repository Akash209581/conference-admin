import { prisma } from "@/lib/prisma/client";
import { SpeakersManager } from "@/components/admin/speakers-manager";
import { Mic2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SpeakersAdminPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const conference = await prisma.conference.findFirst({
    where: { slug, deletedAt: null },
    include: {
      speakers: {
        where: { deletedAt: null },
        include: { organization: true, imageAsset: true },
        orderBy: { sortOrder: "asc" }
      }
    }
  });

  const conferenceId = conference?.id || "";

  const formattedSpeakers = (conference?.speakers || []).map((s) => ({
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
          <Mic2 className="w-4 h-4" />
          <span>Speaker Profiles & Keynotes</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Speakers Management</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage conference speakers, topics, and portrait photos for{" "}
          <span className="text-slate-900 font-semibold">{conference?.name}</span>.
        </p>
      </div>

      <SpeakersManager
        conferenceId={conferenceId}
        slug={slug}
        initialSpeakers={formattedSpeakers}
      />
    </div>
  );
}
