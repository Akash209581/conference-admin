"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import {
  Search,
  Download,
  Users,
  Mail,
  Building2,
  MapPin,
  Phone,
  User,
  CheckSquare,
  Square,
  X,
  FileDown,
  Receipt,
  CreditCard,
  Eye,
  FileCheck2,
  ExternalLink
} from "lucide-react";
import { formatDateTime } from "@/lib/admin-utils";

export interface FormattedAttendee {
  id: string;
  sno: number;
  name: string;
  email: string;
  number: string;
  institution: string;
  country: string;
  title: string;
  currencyAndRegAmount: string;
  currency: string;
  regAmount: number;
  address: string;
  status: string;
  attendanceMode: string;
  createdAt: string;
}

interface RegistrationsTableProps {
  registrations: FormattedAttendee[];
  conferenceSlug: string;
}

export function RegistrationsTable({ registrations: initialData, conferenceSlug }: RegistrationsTableProps) {
  const toast = useToast();
  const [registrations, setRegistrations] = useState<FormattedAttendee[]>(initialData);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currencyFilter, setCurrencyFilter] = useState("ALL");
  const [viewingAttendee, setViewingAttendee] = useState<FormattedAttendee | null>(null);

  // Distinct currencies
  const availableCurrencies = Array.from(new Set(registrations.map((r) => r.currency))).filter(Boolean);

  // Filtered dataset
  const filtered = registrations.filter((reg) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      reg.name.toLowerCase().includes(term) ||
      reg.email.toLowerCase().includes(term) ||
      reg.number.toLowerCase().includes(term) ||
      reg.institution.toLowerCase().includes(term) ||
      reg.country.toLowerCase().includes(term) ||
      reg.title.toLowerCase().includes(term) ||
      reg.address.toLowerCase().includes(term);

    const matchesStatus = statusFilter === "ALL" || reg.status === statusFilter;
    const matchesCurrency = currencyFilter === "ALL" || reg.currency === currencyFilter;

    return matchesSearch && matchesStatus && matchesCurrency;
  });

  // Re-index S.No for the active filtered view (1, 2, 3...)
  const displayItems = filtered.map((r, idx) => ({
    ...r,
    displaySno: idx + 1
  }));

  // Selection states
  const allFilteredIds = displayItems.map((r) => r.id);
  const isAllSelected =
    allFilteredIds.length > 0 && allFilteredIds.every((id) => selectedIds.has(id));
  const isSomeSelected = selectedIds.size > 0 && !isAllSelected;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allFilteredIds));
    }
  };

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  /**
   * Generates a delegate confirmation pass & invoice receipt document for download
   */
  const downloadSinglePass = (attendee: FormattedAttendee) => {
    const content = `================================================================================
HANSCI NOVUM / ICGIT 2026 — OFFICIAL ATTENDEE DELEGATE PASS & RECEIPT
Reference ID: ${attendee.id}
Serial Number: S.No #${attendee.sno}
Status: ${attendee.status}
Issue Date: ${new Date(attendee.createdAt).toLocaleString("en-US", { dateStyle: "full", timeStyle: "medium" })}
================================================================================

DELEGATE INFORMATION:
Name: ${attendee.name}
Title / Role: ${attendee.title}
Email: ${attendee.email}
Phone Number: ${attendee.number}
Institution / Organization: ${attendee.institution}
Country: ${attendee.country}

BILLING & REGISTRATION FEE:
Registration Fee: ${attendee.currencyAndRegAmount} (${attendee.currency} ${attendee.regAmount})
Billing / Participant Address:
${attendee.address}

EVENT PARTICIPATION:
Conference: International Conference on Global Innovation & Technology (ICGIT 2026)
Location: Dubai World Trade Centre, Dubai, United Arab Emirates
Dates: December 8–10, 2026
Attendance Mode: ${attendee.attendanceMode}

================================================================================
Present this digital or printed pass at the conference registration secretariat.
`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName = attendee.name.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    a.download = `Attendee_Pass_SNo${attendee.sno}_${safeName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Delegate pass downloaded for ${attendee.name}`, "Download Successful");
  };

  /**
   * Generates and downloads a CSV formatted strictly with the requested headers:
   * S.No, Name, Email, Number, Institution, Country, Title, Currency and Reg Amount, Address
   */
  const exportCSV = (items: FormattedAttendee[], filename: string) => {
    const headers = [
      "S.No",
      "Name",
      "Email",
      "Number",
      "Institution",
      "Country",
      "Title",
      "Currency and Reg Amount",
      "Address"
    ];

    const rows = items.map((r, idx) => [
      `"${idx + 1}"`,
      `"${(r.name || "").replace(/"/g, '""')}"`,
      `"${(r.email || "").replace(/"/g, '""')}"`,
      `"${(r.number || "").replace(/"/g, '""')}"`,
      `"${(r.institution || "").replace(/"/g, '""')}"`,
      `"${(r.country || "").replace(/"/g, '""')}"`,
      `"${(r.title || "").replace(/"/g, '""')}"`,
      `"${(r.currencyAndRegAmount || "").replace(/"/g, '""')}"`,
      `"${(r.address || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${items.length} attendee records to CSV`, "CSV Downloaded");
  };

  /**
   * Batch download passes for multiple selected attendees
   */
  const downloadBatchPasses = (items: FormattedAttendee[]) => {
    if (items.length === 0) return;
    items.forEach((item, index) => {
      setTimeout(() => {
        downloadSinglePass(item);
      }, index * 200);
    });
    toast.success(`Initiated download of ${items.length} attendee pass(es)`, "Batch Download");
  };

  const selectedItems = displayItems.filter((r) => selectedIds.has(r.id));

  return (
    <div className="space-y-4">
      {/* Search and Filters Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search attendees by name, email, number, institution, country, title, address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
          />
        </div>

        {/* Filter Dropdowns and Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Currency Filter */}
          <select
            value={currencyFilter}
            onChange={(e) => setCurrencyFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-700 text-xs font-medium focus:outline-none focus:border-indigo-600"
          >
            <option value="ALL">All Currencies</option>
            {availableCurrencies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-700 text-xs font-medium focus:outline-none focus:border-indigo-600"
          >
            <option value="ALL">All Statuses ({registrations.length})</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PENDING">Pending</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Overall Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                exportCSV(
                  filtered,
                  `attendees_overall_${conferenceSlug}_${new Date().toISOString().slice(0, 10)}.csv`
                )
              }
              title="Download overall attendee list as CSV (sno, name, email, number, institution, country, Title, currency and reg amount, address)"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-indigo-300" />
              <span>Download Overall (CSV)</span>
            </button>

            <button
              onClick={() => downloadBatchPasses(filtered)}
              title="Download all delegate passes and receipts"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 transition cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5 text-indigo-600" />
              <span>Download All Passes ({filtered.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Selected Items Action Bar (Appears when user selects 'few' attendees) */}
      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 animate-in fade-in slide-in-from-top-1 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="flex items-center justify-center size-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold">
              {selectedIds.size}
            </span>
            <span>
              {selectedIds.size === 1
                ? "1 attendee selected"
                : `${selectedIds.size} attendees selected out of ${filtered.length}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                exportCSV(
                  selectedItems,
                  `attendees_selected_${selectedIds.size}_${conferenceSlug}.csv`
                )
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Selected CSV ({selectedIds.size})</span>
            </button>

            <button
              onClick={() => downloadBatchPasses(selectedItems)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-indigo-900 border border-indigo-300 text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5 text-indigo-600" />
              <span>Download Selected Passes ({selectedIds.size})</span>
            </button>

            <button
              onClick={() => setSelectedIds(new Set())}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-indigo-100/60 text-xs transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      )}

      {/* Attendees Table */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-3 py-3.5 w-10 text-center">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    title={isAllSelected ? "Deselect All" : "Select All"}
                    className="cursor-pointer text-slate-500 hover:text-indigo-600 inline-flex items-center justify-center"
                  >
                    {isAllSelected ? (
                      <CheckSquare className="size-4 text-indigo-600" />
                    ) : (
                      <Square className="size-4" />
                    )}
                  </button>
                </th>
                <th className="px-3 py-3.5 w-14 text-center">S.No</th>
                <th className="px-4 py-3.5 min-w-[150px]">Name</th>
                <th className="px-4 py-3.5 min-w-[170px]">Email</th>
                <th className="px-4 py-3.5 min-w-[130px]">Number</th>
                <th className="px-4 py-3.5 min-w-[170px]">Institution</th>
                <th className="px-4 py-3.5 min-w-[120px]">Country</th>
                <th className="px-5 py-3.5 min-w-[170px]">Title</th>
                <th className="px-4 py-3.5 min-w-[150px] bg-indigo-50/50">Currency &amp; Reg Amount</th>
                <th className="px-5 py-3.5 min-w-[200px]">Address</th>
                <th className="px-4 py-3.5 min-w-[130px] text-center bg-slate-50">Pass Download</th>
                <th className="px-4 py-3.5 min-w-[100px] text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayItems.length > 0 ? (
                displayItems.map((attendee) => {
                  const isSelected = selectedIds.has(attendee.id);
                  return (
                    <tr
                      key={attendee.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? "bg-indigo-50/40" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-3 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => toggleSelectOne(attendee.id)}
                          className="cursor-pointer text-slate-400 hover:text-indigo-600 inline-flex items-center justify-center"
                        >
                          {isSelected ? (
                            <CheckSquare className="size-4 text-indigo-600" />
                          ) : (
                            <Square className="size-4" />
                          )}
                        </button>
                      </td>

                      {/* S.No */}
                      <td className="px-3 py-3.5 text-center font-bold text-slate-800">
                        {attendee.displaySno}
                      </td>

                      {/* Name */}
                      <td className="px-4 py-3.5 font-semibold text-slate-900">
                        <button
                          type="button"
                          onClick={() => setViewingAttendee(attendee)}
                          className="hover:text-indigo-600 hover:underline flex items-center gap-1.5 text-left cursor-pointer"
                        >
                          <User className="size-3 text-slate-400 shrink-0" />
                          <span>{attendee.name}</span>
                        </button>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3.5 font-mono text-[11px] text-slate-600">
                        <a
                          href={`mailto:${attendee.email}`}
                          className="hover:text-indigo-600 hover:underline flex items-center gap-1"
                        >
                          <Mail className="size-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[160px]">{attendee.email}</span>
                        </a>
                      </td>

                      {/* Number */}
                      <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Phone className="size-3 text-slate-400 shrink-0" />
                          <span>{attendee.number}</span>
                        </div>
                      </td>

                      {/* Institution */}
                      <td className="px-4 py-3.5 text-slate-700">
                        <div className="flex items-center gap-1">
                          <Building2 className="size-3 text-slate-400 shrink-0" />
                          <span className="line-clamp-2">{attendee.institution}</span>
                        </div>
                      </td>

                      {/* Country */}
                      <td className="px-4 py-3.5 text-slate-700 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <MapPin className="size-3 text-slate-400 shrink-0" />
                          <span>{attendee.country}</span>
                        </div>
                      </td>

                      {/* Title */}
                      <td className="px-5 py-3.5 font-medium text-slate-900">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-semibold">
                          {attendee.title}
                        </span>
                      </td>

                      {/* Currency and Reg Amount */}
                      <td className="px-4 py-3.5 bg-indigo-50/25 whitespace-nowrap font-bold text-indigo-900">
                        <div className="flex items-center gap-1">
                          <CreditCard className="size-3.5 text-indigo-600 shrink-0" />
                          <span>{attendee.currencyAndRegAmount}</span>
                        </div>
                      </td>

                      {/* Address */}
                      <td className="px-5 py-3.5 text-slate-600">
                        <span className="line-clamp-2 text-[11px]" title={attendee.address}>
                          {attendee.address}
                        </span>
                      </td>

                      {/* Pass Download */}
                      <td className="px-4 py-3.5 text-center bg-slate-50/50">
                        <button
                          type="button"
                          onClick={() => downloadSinglePass(attendee)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm hover:shadow transition cursor-pointer"
                          title={`Download delegate pass for ${attendee.name}`}
                        >
                          <Download className="size-3.5" />
                          <span>Download Pass</span>
                        </button>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            attendee.status === "CONFIRMED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                              : attendee.status === "PENDING"
                              ? "bg-amber-50 text-amber-700 border-amber-300"
                              : "bg-rose-50 text-rose-700 border-rose-300"
                          }`}
                        >
                          {attendee.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={12} className="px-6 py-12 text-center text-slate-500">
                    <Users className="size-8 mx-auto text-slate-400 mb-2 opacity-50" />
                    <p className="font-semibold text-slate-700 text-sm">No attendee records found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {searchTerm || statusFilter !== "ALL" || currencyFilter !== "ALL"
                        ? "Try adjusting your search query or filters."
                        : "Registered delegates will appear here once confirmed."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Summary */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-600">
          <div>
            Showing <strong>{displayItems.length}</strong> of <strong>{registrations.length}</strong> total attendees
          </div>
          <div className="flex items-center gap-3">
            <span>
              Format: <code>sno, name, email, number, institution, country, Title, currency and reg amount, address</code>
            </span>
          </div>
        </div>
      </div>

      {/* Attendee Details Modal */}
      {viewingAttendee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white border border-slate-200 p-6 lg:p-8 shadow-2xl space-y-6">
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 border border-indigo-200 text-indigo-700 uppercase tracking-wider mb-1.5">
                  S.No #{viewingAttendee.sno} • Reference: {viewingAttendee.id}
                </span>
                <h3 className="text-xl font-bold text-slate-900">{viewingAttendee.name}</h3>
                <p className="text-xs text-indigo-600 font-semibold">{viewingAttendee.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setViewingAttendee(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Attendee Detail Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Email Address</span>
                <p className="font-mono text-slate-800 mt-0.5">{viewingAttendee.email}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Phone Number</span>
                <p className="text-slate-800 mt-0.5">{viewingAttendee.number}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Institution</span>
                <p className="font-semibold text-slate-800 mt-0.5">{viewingAttendee.institution}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Country</span>
                <p className="text-slate-800 mt-0.5">{viewingAttendee.country}</p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Registration Fee</span>
                <p className="text-sm font-bold text-indigo-700 mt-0.5">
                  {viewingAttendee.currencyAndRegAmount} ({viewingAttendee.currency} {viewingAttendee.regAmount})
                </p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Billing / Participant Address</span>
                <p className="text-slate-800 mt-0.5 whitespace-pre-wrap">{viewingAttendee.address}</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setViewingAttendee(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => downloadSinglePass(viewingAttendee)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition cursor-pointer"
              >
                <Download className="size-4" />
                <span>Download Pass &amp; Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
