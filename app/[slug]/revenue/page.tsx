import { prisma } from "@/lib/prisma/client";
import { formatCurrency, formatDateTime } from "@/lib/admin-utils";
import { DollarSign, CreditCard, Clock } from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";

export const dynamic = "force-dynamic";

export default async function RevenuePage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const conference = await prisma.conference.findFirst({
    where: { slug, deletedAt: null },
    include: {
      packages: {
        where: { deletedAt: null },
        include: {
          registrations: {
            where: { deletedAt: null },
            include: { payments: true }
          }
        }
      }
    }
  });

  const conferenceId = conference?.id;

  const payments = await prisma.payment.findMany({
    where: {
      registration: conferenceId ? { conferenceId, deletedAt: null } : { deletedAt: null }
    },
    include: {
      registration: {
        include: { registrationPackage: true }
      },
      invoice: true
    },
    orderBy: { createdAt: "desc" }
  });

  const paidPayments = payments.filter((p) => p.status === "PAID");
  const pendingPayments = payments.filter((p) => p.status === "PENDING");
  const totalRevenueCents = paidPayments.reduce((acc, p) => acc + p.amountCents, 0);
  const pendingRevenueCents = pendingPayments.reduce((acc, p) => acc + p.amountCents, 0);

  const packageStats = (conference?.packages || []).map((pkg) => {
    const totalSold = pkg.registrations.filter((r) => r.status === "CONFIRMED").length;
    const pkgRevenueCents = totalSold * pkg.priceCents;
    return {
      id: pkg.id,
      name: pkg.name,
      mode: pkg.attendanceMode,
      priceCents: pkg.priceCents,
      currency: pkg.currency,
      totalSold,
      pkgRevenueCents
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">
          <DollarSign className="w-4 h-4" />
          <span>Financial Analytics</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Revenue & Payments</h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor ticket sales, gross revenue, transaction records, and package distributions for{" "}
          <span className="text-slate-900 font-semibold">{conference?.name}</span>.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Total Gross Revenue"
          value={formatCurrency(totalRevenueCents)}
          subtitle="Confirmed paid transactions"
          icon={DollarSign}
          variant="emerald"
        />
        <StatCard
          title="Pending Payments"
          value={formatCurrency(pendingRevenueCents)}
          subtitle={`${pendingPayments.length} transactions pending`}
          icon={Clock}
          variant="amber"
        />
        <StatCard
          title="Total Transactions"
          value={payments.length}
          subtitle={`${paidPayments.length} successful payouts`}
          icon={CreditCard}
          variant="indigo"
        />
      </div>

      {/* Package Breakdown */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900">Revenue by Ticket Package</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {packageStats.map((pkg) => (
            <div key={pkg.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 text-sm truncate">{pkg.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-medium">
                  {pkg.mode}
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-xl font-bold text-emerald-600">
                  {formatCurrency(pkg.pkgRevenueCents, pkg.currency)}
                </span>
                <span className="text-xs text-slate-500 font-medium">{pkg.totalSold} Passes Sold</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Transactions Table */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Transaction Logs</h2>
          <span className="text-xs text-slate-500">{payments.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Customer & Email</th>
                <th className="px-5 py-3.5">Package</th>
                <th className="px-5 py-3.5">Provider Ref</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.length > 0 ? (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">{p.registration?.fullName || "Guest Customer"}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{p.registration?.email || "N/A"}</p>
                    </td>
                    <td className="px-5 py-4 text-xs font-semibold text-indigo-700">
                      {p.registration?.registrationPackage?.name || "General Pass"}
                    </td>
                    <td className="px-5 py-4 text-xs font-mono text-slate-500">
                      {p.providerRef || p.id.slice(0, 8)}
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-900">
                      {formatCurrency(p.amountCents, p.currency)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 text-[11px] font-semibold rounded-full border ${
                          p.status === "PAID"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : p.status === "FAILED"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">
                      {formatDateTime(p.createdAt)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400 text-sm">
                    No transactions recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
