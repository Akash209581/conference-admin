import { prisma } from "@/lib/prisma/client";
import {
  History,
  Clock,
  FileText,
  Mic2,
  Image as ImageIcon,
  Globe2,
  Layers,
  Calendar,
  CheckCircle2,
  ExternalLink,
  ShieldAlert
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/admin-utils";

export const dynamic = "force-dynamic";

export default async function HistoryPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams.slug;

  const conference = await prisma.conference.findFirst({
    where: { slug, deletedAt: null },
    select: { id: true, name: true, fullName: true }
  });

  const auditLogs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: {
        select: { firstName: true, lastName: true, email: true }
      }
    }
  });

  const totalLogs = auditLogs.length;
  const contentUpdates = auditLogs.filter((l) => l.action.startsWith("content")).length;
  const speakerUpdates = auditLogs.filter((l) => l.action.startsWith("speaker")).length;
  const mediaUploads = auditLogs.filter((l) => l.action.startsWith("file") || l.action.startsWith("media")).length;

  const getActionBadge = (action: string) => {
    switch (action) {
      case "content.updated":
        return {
          label: "Content Published",
          color: "bg-indigo-50 text-indigo-700 border-indigo-200",
          icon: FileText
        };
      case "speaker.created":
        return {
          label: "Speaker Added",
          color: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: Mic2
        };
      case "speaker.updated":
        return {
          label: "Speaker Modified",
          color: "bg-amber-50 text-amber-700 border-amber-200",
          icon: Mic2
        };
      case "speaker.deleted":
        return {
          label: "Speaker Removed",
          color: "bg-rose-50 text-rose-700 border-rose-200",
          icon: Mic2
        };
      case "file.uploaded":
        return {
          label: "Photo/File Upload",
          color: "bg-violet-50 text-violet-700 border-violet-200",
          icon: ImageIcon
        };
      case "media.updated":
        return {
          label: "Media Branding",
          color: "bg-cyan-50 text-cyan-700 border-cyan-200",
          icon: Layers
        };
      case "seo.updated":
        return {
          label: "SEO Metadata",
          color: "bg-teal-50 text-teal-700 border-teal-200",
          icon: Globe2
        };
      default:
        return {
          label: action,
          color: "bg-slate-50 text-slate-700 border-slate-200",
          icon: History
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
            <History className="w-4 h-4" />
            <span>Audit & Change Logs</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
            Activity & Modification History
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time audit trail of all content updates, speaker modifications, and photo uploads for{" "}
            <span className="text-slate-900 font-semibold">{conference?.name || slug}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/${slug}`}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-sm transition-all"
          >
            Back to Overview
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Recorded Events</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <History className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-3">{totalLogs}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Audit log entries</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Content Publications</span>
            <div className="p-2 rounded-xl bg-violet-50 text-violet-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-3">{contentUpdates}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Hero, About, & Venue updates</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Speaker Actions</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Mic2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-3">{speakerUpdates}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Added, edited, or removed</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Photo & File Uploads</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <ImageIcon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-3">{mediaUploads}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Assets stored in system</span>
        </div>
      </div>

      {/* History Log Timeline & Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-bold text-slate-900">Recent Modifications Log</h2>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Showing latest {auditLogs.length} actions
          </span>
        </div>

        {auditLogs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <History className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">No modification history recorded yet</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              When you publish content, update speakers, or upload media in the admin portal, the actions will be tracked here in real-time.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {auditLogs.map((log) => {
              const badge = getActionBadge(log.action);
              const Icon = badge.icon;
              const meta: any = log.metadata || {};

              return (
                <div key={log.id} className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className={`p-2.5 rounded-xl border ${badge.color} shrink-0 mt-0.5 sm:mt-0 shadow-sm`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.color}`}>
                            {badge.label}
                          </span>
                          <span className="text-xs font-bold text-slate-800">
                            {log.entity ? `Entity: ${log.entity}` : "System Event"}
                          </span>
                        </div>

                        {/* Metadata Details Display */}
                        <div className="text-xs text-slate-600 flex items-center gap-2 flex-wrap">
                          {log.action === "file.uploaded" && meta.fileName && (
                            <span>
                              File: <strong className="text-slate-900">{meta.fileName}</strong> ({meta.folder || "general"})
                              {meta.url && (
                                <a
                                  href={meta.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-2 inline-flex items-center gap-1 text-indigo-600 hover:underline font-semibold"
                                >
                                  View File <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </span>
                          )}

                          {log.action === "speaker.created" && meta.name && (
                            <span>
                              Speaker: <strong className="text-slate-900">{meta.name}</strong> ({meta.role || "Speaker"})
                            </span>
                          )}

                          {log.action === "speaker.updated" && meta.name && (
                            <span>
                              Updated Speaker: <strong className="text-slate-900">{meta.name}</strong> ({meta.topic || "Topic modified"})
                            </span>
                          )}

                          {log.action === "content.updated" && (
                            <span>
                              Updated sections: <span className="font-semibold text-indigo-700">{meta.updatedSections?.join(", ") || "Homepage Sections"}</span>
                            </span>
                          )}

                          {log.action === "media.updated" && (
                            <span>Updated brand assets, hero banner & logos.</span>
                          )}

                          {log.action === "seo.updated" && meta.metaTitle && (
                            <span>
                              Title: <strong className="text-slate-900">{meta.metaTitle}</strong>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Timestamp & User */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                      <span className="text-xs font-semibold text-slate-800">
                        {new Date(log.createdAt).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {new Date(log.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
