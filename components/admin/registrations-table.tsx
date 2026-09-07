"use client";

import { useState } from "react";
import { Search, Download, Users, Mail, Building, MapPin, DollarSign, CheckCircle2, Clock } from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/admin-utils";

interface RegistrationItem {
  id: string;
  fullName: string;
  email: string;
  organization: string;
  packageName: string;
  packagePriceCents: number;
  packageCurrency: string;
  attendanceMode: string;
  status: string;
  countryName: string;
  createdAt: string;
}

interface RegistrationsTableProps {
  registrations: RegistrationItem[];
  conferenceSlug: string;
}

export function RegistrationsTable({ registrations: initialData, conferenceSlug }: RegistrationsTableProps) {
  const [registrations, setRegistrations] = useState<RegistrationItem[]>(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [modeFilter, setModeFilter] = useState("ALL");

  const filtered = registrations.filter((reg) => {
    const matchesSearch =
      reg.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.packageName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || reg.status === statusFilter;
    const matchesMode = modeFilter === "ALL" || reg.attendanceMode === modeFilter;

    return matchesSearch && matchesStatus && matchesMode;
  });

  const exportCSV = () => {
    const headers = [
      "Full Name",
      "Email",
      "Organization",
      "Country",
      "Package",
      "Price",
      "Mode",
      "Status",
      "Registered At"
    ];
    const rows = filtered.map((r) => [
      `"${r.fullName.replace(/"/g, '""')}"`,
      `"${r.email}"`,
      `"${r.organization}"`,
      `"${r.countryName}"`,
      `"${r.packageName}"`,
      `"${formatCurrency(r.packagePriceCents, r.packageCurrency)}"`,
      `"${r.attendanceMode}"`,
      `"${r.status}"`,
      `"${formatDateTime(r.createdAt)}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendees_${conferenceSlug}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, organization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-700 text-sm focus:outline-none focus:border-indigo-600"
          >
            <option value="ALL">All Statuses ({registrations.length})</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PENDING">Pending</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            className="px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-700 text-sm focus:outline-none focus:border-indigo-600"
          >
            <option value="ALL">All Modes</option>
            <option value="ONSITE">Onsite</option>
            <option value="VIRTUAL">Virtual</option>
          </select>

          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold border border-slate-300 transition-all shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Registrations Table */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Attendee Name & Email</th>
                <th className="px-5 py-3.5">Organization & Country</th>
                <th className="px-5 py-3.5">Package & Mode</th>
                <th className="px-5 py-3.5">Price</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? (
                filtered.map((reg) => (
                  <tr key={reg.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">{reg.fullName}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{reg.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-slate-800 font-medium">{reg.organization || "Independent"}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{reg.countryName || "N/A"}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-indigo-700">{reg.packageName}</p>
                      <span className="inline-block mt-0.5 text-[11px] font-medium text-slate-500">
                        {reg.attendanceMode}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {formatCurrency(reg.packagePriceCents, reg.packageCurrency)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 text-[11px] font-semibold rounded-full border ${
                          reg.status === "CONFIRMED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : reg.status === "CANCELLED"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {reg.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">
                      {formatDateTime(reg.createdAt)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400 text-sm">
                    No registrations found matching your filters.
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
