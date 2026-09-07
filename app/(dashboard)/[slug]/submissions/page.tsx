import { prisma } from "@/lib/prisma/client";
import { SubmissionsTable } from "@/components/admin/submissions-table";
import { FileCheck2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SubmissionsPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const conference = await prisma.conference.findFirst({
    where: { slug, deletedAt: null },
    include: {
      submissions: {
        where: { deletedAt: null },
        include: {
          track: true,
          author: { include: { profile: true } }
        },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  const formattedSubmissions = (conference?.submissions || []).map((s) => ({
    id: s.id,
    title: s.title,
    abstract: s.abstractText,
    keywords: s.keywords || [],
    trackName: s.track?.name || "General Track",
    authorName: `${s.author?.firstName || ""} ${s.author?.lastName || ""}`.trim() || "Anonymous Author",
    authorEmail: s.author?.email || "N/A",
    status: s.status,
    createdAt: s.createdAt.toISOString()
  }));

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
          <FileCheck2 className="w-4 h-4" />
          <span>Peer Review & Scientific Submissions</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Abstract Submissions</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review, evaluate, and accept research abstracts submitted to{" "}
          <span className="text-slate-900 font-semibold">{conference?.name}</span>.
        </p>
      </div>

      <SubmissionsTable submissions={formattedSubmissions} conferenceSlug={slug} />
    </div>
  );
}
