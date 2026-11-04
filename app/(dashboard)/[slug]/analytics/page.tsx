import { prisma } from "@/lib/prisma/client";
import { StatCard } from "@/components/admin/stat-card";
import { formatCurrency, formatDate } from "@/lib/admin-utils";
import {
  FileCheck2,
  Users,
  DollarSign,
  Calendar,
  LayoutDashboard,
  ArrowUpRight,
  FileText,
  Image as ImageIcon
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ConferenceDashboardPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const conference = await prisma.conference.findFirst({
    where: { slug, deletedAt: null },
    include: {
      venue: true,
      speakers: { where: { deletedAt: null } },
      submissions: { where: { deletedAt: null }, take: 5, orderBy: { createdAt: "desc" } },
      registrations: {
        where: { deletedAt: null },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { registrationPackage: true }
      }
    }
  });

  const totalSpeakers = conference?.speakers?.length || 0;

  const [totalSubmissions, totalRegistrations, totalPaymentRevenue] = await Promise.all([
    prisma.abstractSubmission.count({
      where: { conferenceId: conference?.id, deletedAt: null }
    }),
    prisma.registration.count({
      where: { conferenceId: conference?.id, deletedAt: null }
    }),
    prisma.payment.aggregate({
      where: {
        status: "PAID",
        deletedAt: null,
        registration: conference?.id ? { conferenceId: conference.id } : undefined
      },
      _sum: {
        amountCents: true
      }
    })
  ]);

  const totalRevenueCents = totalPaymentRevenue._sum.amountCents || 0;

  const acceptedSubmissionsCount = await prisma.abstractSubmission.count({
    where: {
      conferenceId: conference?.id,
      status: "ACCEPTED",
      deletedAt: null
    }
  });

  const pendingSubmissionsCount = await prisma.abstractSubmission.count({
    where: {
      conferenceId: conference?.id,
      status: "SUBMITTED",
      deletedAt: null
    }
  });

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 border border-indigo-500/30 p-6 lg:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-200 text-xs font-bold uppercase tracking-wider mb-2">
              <LayoutDashboard className="w-4 h-4" />
              <span>Conference Management Overview</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              {conference?.fullName || conference?.name || "Conference Portal"}
            </h1>
            <p className="mt-1 text-sm text-indigo-100">
              Dates: <span className="font-semibold text-white">{formatDate(conference?.startDate)} - {formatDate(conference?.endDate)}</span> | Mode: <span className="text-white font-semibold">{conference?.mode || "HYBRID"}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/${slug}/content`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-700 hover:bg-slate-100 text-sm font-semibold shadow-md transition-all"
            >
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Edit Content</span>
            </Link>
            <Link
              href={`/${slug}/media`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-800/80 hover:bg-indigo-800 text-white text-sm font-semibold border border-indigo-400/30 transition-all"
            >
              <ImageIcon className="w-4 h-4" />
              <span>Change Media / Favicon</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenueCents)}
          subtitle="Real-time verified payments"
          icon={DollarSign}
          variant="emerald"
          trend="Calculated from confirmed receipts"
        />
        <StatCard
          title="Abstract Submissions"
          value={totalSubmissions}
          subtitle={`${acceptedSubmissionsCount} Accepted | ${pendingSubmissionsCount} Pending`}
          icon={FileCheck2}
          variant="indigo"
          trend="Track papers & reviews"
        />
        <StatCard
          title="Registered Attendees"
          value={totalRegistrations}
          subtitle="Across all ticket packages"
          icon={Users}
          variant="violet"
          trend="Real-time participant count"
        />
        <StatCard
          title="Keynote Speakers"
          value={totalSpeakers}
          subtitle="Featured industry experts"
          icon={Calendar}
          variant="amber"
          trend="Managed in schedule"
        />
      </div>

      {/* Recent Submissions & Recent Registrations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submissions Box */}
        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Recent Abstract Submissions</h2>
            </div>
            <Link
              href={`/${slug}/submissions`}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {conference?.submissions && conference.submissions.length > 0 ? (
              conference.submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="text-sm font-semibold text-slate-900 truncate">{sub.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Keywords: {sub.keywords?.join(", ") || "General"}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 px-2.5 py-1 text-[11px] font-semibold rounded-full border ${
                      sub.status === "ACCEPTED"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : sub.status === "REJECTED"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {sub.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 text-sm">
                No abstract submissions recorded yet for this conference.
              </div>
            )}
          </div>
        </div>

        {/* Registrations Box */}
        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-violet-50 text-violet-600 border border-violet-100">
                <Users className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Recent Registrations</h2>
            </div>
            <Link
              href={`/${slug}/registrations`}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {conference?.registrations && conference.registrations.length > 0 ? (
              conference.registrations.map((reg) => (
                <div
                  key={reg.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="text-sm font-semibold text-slate-900 truncate">{reg.fullName}</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{reg.email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-indigo-600">
                      {reg.registrationPackage?.name || "Standard Pass"}
                    </p>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                        reg.status === "CONFIRMED"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {reg.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 text-sm">
                No registrations recorded yet for this conference.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
