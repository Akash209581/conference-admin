import { prisma } from "@/lib/prisma/client";
import { SettingsForm } from "@/components/admin/settings-form";
import { Settings } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const conference = await prisma.conference.findFirst({
    where: { slug, deletedAt: null },
    include: {
      venue: true
    }
  });

  const conferenceId = conference?.id || "";

  const initialData = {
    name: conference?.name || "ICGIT 2026",
    fullName: conference?.fullName || "International Conference on Global Innovation and Technology",
    description: conference?.description || "",
    mode: (conference?.mode as any) || "HYBRID",
    startDate: conference?.startDate ? conference.startDate.toISOString().split("T")[0] : "2026-12-08",
    endDate: conference?.endDate ? conference.endDate.toISOString().split("T")[0] : "2026-12-10",
    venueName: conference?.venue?.name || "Dubai World Trade Centre",
    venueAddress: conference?.venue?.address || "Sheikh Zayed Road",
    venueCity: conference?.venue?.city || "Dubai"
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
          <Settings className="w-4 h-4" />
          <span>Core Configuration</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Conference & Venue Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Update event names, dates, event format mode, and physical venue address coordinates for{" "}
          <span className="text-slate-900 font-semibold">{conference?.name}</span>.
        </p>
      </div>

      <SettingsForm conferenceId={conferenceId} slug={slug} initialData={initialData} />
    </div>
  );
}
