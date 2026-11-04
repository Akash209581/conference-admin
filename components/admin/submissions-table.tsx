"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { safeFetchJson } from "@/lib/fetch-client";
import {
  Search,
  Download,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  CheckSquare,
  Square,
  Eye,
  X,
  FileDown,
  Building2,
  Globe,
  Phone,
  Mail,
  User,
  ExternalLink
} from "lucide-react";
import { formatDateTime } from "@/lib/admin-utils";

export interface FormattedSubmission {
  id: string;
  sno: number;
  name: string;
  email: string;
  number: string;
  institution: string;
  country: string;
  title: string;
  track: string;
  fileName: string;
  fileSize?: number;
  status: string;
  abstractText?: string;
  presentationPreference?: string;
  coAuthors?: Array<{ name: string; affiliation: string }>;
  createdAt: string;
}

interface SubmissionsTableProps {
  submissions: FormattedSubmission[];
  conferenceSlug: string;
}

export function SubmissionsTable({ submissions: initialData, conferenceSlug }: SubmissionsTableProps) {
  const toast = useToast();
  const [submissions, setSubmissions] = useState<FormattedSubmission[]>(initialData);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [trackFilter, setTrackFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [viewingSubmission, setViewingSubmission] = useState<FormattedSubmission | null>(null);

  // Distinct track names for filtering
  const availableTracks = Array.from(new Set(submissions.map((s) => s.track))).filter(Boolean);

  // Filtered dataset
  const filtered = submissions.filter((sub) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      sub.title.toLowerCase().includes(term) ||
      sub.name.toLowerCase().includes(term) ||
      sub.email.toLowerCase().includes(term) ||
      sub.number.toLowerCase().includes(term) ||
      sub.institution.toLowerCase().includes(term) ||
      sub.country.toLowerCase().includes(term) ||
      sub.track.toLowerCase().includes(term);

    const matchesStatus = statusFilter === "ALL" || sub.status === statusFilter;
    const matchesTrack = trackFilter === "ALL" || sub.track === trackFilter;

    return matchesSearch && matchesStatus && matchesTrack;
  });

  // Re-index S.No for the filtered view so it always displays clean 1, 2, 3...
  const displayItems = filtered.map((sub, idx) => ({
    ...sub,
    displaySno: idx + 1
  }));

  // Selection states
  const allFilteredIds = displayItems.map((s) => s.id);
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

  const handleStatusChange = async (submissionId: string, newStatus: string) => {
    setUpdatingId(submissionId);
    try {
      const res = await safeFetchJson(`/conference-admin/api/admin/submissions/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, status: newStatus, slug: conferenceSlug })
      });

      if (!res.ok) {
        throw new Error(res.error || "Failed to update status");
      }

      setSubmissions((prev) =>
        prev.map((s) => (s.id === submissionId ? { ...s, status: newStatus } : s))
      );
      toast.success(`Submission status updated to ${newStatus.replace("_", " ")}`, "Status Updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update submission status", "Update Failed");
    } finally {
      setUpdatingId(null);
    }
  };

  /**
   * Generates a research abstract text document and triggers download
   */
  const downloadSingleAbstract = (sub: FormattedSubmission) => {
    const content = `================================================================================
HANSCI NOVUM / ICGIT 2026 — SCIENTIFIC ABSTRACT SUBMISSION
Reference ID: ${sub.id}
Serial Number: S.No #${sub.sno}
Status: ${sub.status}
Date Submitted: ${new Date(sub.createdAt).toLocaleString("en-US", { dateStyle: "full", timeStyle: "medium" })}
================================================================================

TITLE:
${sub.title}

PRESENTING AUTHOR:
Name: ${sub.name}
Email: ${sub.email}
Phone Number: ${sub.number}
Institution: ${sub.institution}
Country: ${sub.country}

SCIENTIFIC TRACK / SESSION:
${sub.track}

${sub.presentationPreference ? `PRESENTATION PREFERENCE:\n${sub.presentationPreference}\n\n` : ""}${
      sub.coAuthors && sub.coAuthors.length > 0
        ? `CO-AUTHORS:\n${sub.coAuthors.map((c, i) => `  ${i + 1}. ${c.name} — ${c.affiliation}`).join("\n")}\n\n`
        : ""
    }DOCUMENT ATTACHMENT:
Original Filename: ${sub.fileName || "abstract-document.pdf"}
${sub.fileSize ? `File Size: ${(sub.fileSize / 1024).toFixed(1)} KB\n` : ""}
ABSTRACT TEXT / RESEARCH SUMMARY:
${
  sub.abstractText && sub.abstractText.trim() !== ""
    ? sub.abstractText
    : "Scientific abstract document submitted for peer review. Double-blind assessment underway."
}

================================================================================
International Conference on Global Innovation & Technology (ICGIT 2026)
`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName = (sub.name || "author").toLowerCase().replace(/[^a-z0-9]+/g, "_");
    const safeTitle = (sub.title || "abstract").toLowerCase().slice(0, 30).replace(/[^a-z0-9]+/g, "_");
    a.download = `Abstract_SNo${sub.sno}_${safeName}_${safeTitle}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Abstract document downloaded for ${sub.name}`, "Download Successful");
  };

  /**
   * Generates and downloads a CSV formatted strictly with the requested headers:
   * S.No, Name, Email, Number, Institution, Country, Title, Session / Track, Abstract Download
   */
  const exportCSV = (items: FormattedSubmission[], filename: string) => {
    const headers = [
      "S.No",
      "Name",
      "Email",
      "Number",
      "Institution",
      "Country",
      "Title",
      "Session / Track",
      "Abstract Download"
    ];

    const rows = items.map((sub, idx) => [
      `"${idx + 1}"`,
      `"${(sub.name || "").replace(/"/g, '""')}"`,
      `"${(sub.email || "").replace(/"/g, '""')}"`,
      `"${(sub.number || "").replace(/"/g, '""')}"`,
      `"${(sub.institution || "").replace(/"/g, '""')}"`,
      `"${(sub.country || "").replace(/"/g, '""')}"`,
      `"${(sub.title || "").replace(/"/g, '""')}"`,
      `"${(sub.track || "").replace(/"/g, '""')}"`,
      `"${(sub.fileName || "abstract.pdf").replace(/"/g, '""')}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${items.length} abstract submissions to CSV`, "CSV Downloaded");
  };

  /**
   * Batch download documents for multiple selected items
   */
  const downloadBatchDocuments = (items: FormattedSubmission[]) => {
    if (items.length === 0) return;
    items.forEach((sub, index) => {
      setTimeout(() => {
        downloadSingleAbstract(sub);
      }, index * 200);
    });
    toast.success(`Initiated download of ${items.length} abstract document(s)`, "Batch Download");
  };

  const selectedItems = displayItems.filter((s) => selectedIds.has(s.id));

  return (
    <div className="space-y-4">
      {/* Search and Filters Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, name, email, number, institution, country, track..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Track Filter */}
          <select
            value={trackFilter}
            onChange={(e) => setTrackFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-700 text-xs font-medium focus:outline-none focus:border-indigo-600"
          >
            <option value="ALL">All Tracks / Sessions</option>
            {availableTracks.map((tr) => (
              <option key={tr} value={tr}>
                {tr}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-700 text-xs font-medium focus:outline-none focus:border-indigo-600"
          >
            <option value="ALL">All Statuses ({submissions.length})</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {/* Overall Download Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                exportCSV(
                  filtered,
                  `abstract_submissions_overall_${conferenceSlug}_${new Date().toISOString().slice(0, 10)}.csv`
                )
              }
              title="Download overall abstract list as CSV (sno, name, email, number, institution, country, title, session/track, abstract download)"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-indigo-300" />
              <span>Download Overall (CSV)</span>
            </button>

            <button
              onClick={() => downloadBatchDocuments(filtered)}
              title="Download all abstract document files"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 transition cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5 text-indigo-600" />
              <span>Download All ({filtered.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Selected Items Action Bar (Appears when user selects 'few' abstracts) */}
      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 animate-in fade-in slide-in-from-top-1 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="flex items-center justify-center size-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold">
              {selectedIds.size}
            </span>
            <span>
              {selectedIds.size === 1
                ? "1 abstract selected"
                : `${selectedIds.size} abstracts selected out of ${filtered.length}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                exportCSV(
                  selectedItems,
                  `abstract_submissions_selected_${selectedIds.size}_${conferenceSlug}.csv`
                )
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Selected CSV ({selectedIds.size})</span>
            </button>

            <button
              onClick={() => downloadBatchDocuments(selectedItems)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-indigo-900 border border-indigo-300 text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5 text-indigo-600" />
              <span>Download Selected Files ({selectedIds.size})</span>
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

      {/* Abstract Submissions Table */}
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
                <th className="px-5 py-3.5 min-w-[260px]">Title</th>
                <th className="px-4 py-3.5 min-w-[180px]">Session / Track</th>
                <th className="px-4 py-3.5 min-w-[160px] text-center bg-indigo-50/50">Abstract Download</th>
                <th className="px-4 py-3.5 min-w-[120px] text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayItems.length > 0 ? (
                displayItems.map((sub) => {
                  const isSelected = selectedIds.has(sub.id);
                  return (
                    <tr
                      key={sub.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? "bg-indigo-50/40" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-3 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => toggleSelectOne(sub.id)}
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
                        {sub.displaySno}
                      </td>

                      {/* Name */}
                      <td className="px-4 py-3.5 font-semibold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <User className="size-3 text-slate-400 shrink-0" />
                          <span>{sub.name}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3.5 font-mono text-[11px] text-slate-600">
                        <a
                          href={`mailto:${sub.email}`}
                          className="hover:text-indigo-600 hover:underline flex items-center gap-1"
                        >
                          <Mail className="size-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[160px]">{sub.email}</span>
                        </a>
                      </td>

                      {/* Number */}
                      <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Phone className="size-3 text-slate-400 shrink-0" />
                          <span>{sub.number}</span>
                        </div>
                      </td>

                      {/* Institution */}
                      <td className="px-4 py-3.5 text-slate-700">
                        <div className="flex items-center gap-1">
                          <Building2 className="size-3 text-slate-400 shrink-0" />
                          <span className="line-clamp-2">{sub.institution}</span>
                        </div>
                      </td>

                      {/* Country */}
                      <td className="px-4 py-3.5 text-slate-700 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Globe className="size-3 text-slate-400 shrink-0" />
                          <span>{sub.country}</span>
                        </div>
                      </td>

                      {/* Title */}
                      <td className="px-5 py-3.5 font-medium text-slate-900">
                        <div className="space-y-1">
                          <button
                            type="button"
                            onClick={() => setViewingSubmission(sub)}
                            className="text-left font-semibold text-slate-900 hover:text-indigo-600 hover:underline line-clamp-2 cursor-pointer"
                          >
                            {sub.title}
                          </button>
                          {sub.coAuthors && sub.coAuthors.length > 0 && (
                            <p className="text-[10px] text-slate-500">
                              +{sub.coAuthors.length} co-author(s): {sub.coAuthors.map((c) => c.name).join(", ")}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Session / Track */}
                      <td className="px-4 py-3.5">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-800 font-medium text-[11px] max-w-[200px] truncate" title={sub.track}>
                          {sub.track}
                        </span>
                      </td>

                      {/* Abstract Download */}
                      <td className="px-4 py-3.5 text-center bg-indigo-50/25">
                        <button
                          type="button"
                          onClick={() => downloadSingleAbstract(sub)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm hover:shadow transition cursor-pointer"
                          title={`Download ${sub.fileName || "abstract document"}`}
                        >
                          <Download className="size-3.5" />
                          <span>Download</span>
                        </button>
                        <span className="block text-[10px] text-slate-500 mt-1 truncate max-w-[140px] mx-auto" title={sub.fileName}>
                          {sub.fileName || "abstract.pdf"}
                        </span>
                      </td>

                      {/* Status & Review Action */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <select
                          disabled={updatingId === sub.id}
                          value={sub.status}
                          onChange={(e) => handleStatusChange(sub.id, e.target.value)}
                          className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                            sub.status === "ACCEPTED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                              : sub.status === "REJECTED"
                              ? "bg-rose-50 text-rose-700 border-rose-300"
                              : sub.status === "UNDER_REVIEW"
                              ? "bg-amber-50 text-amber-700 border-amber-300"
                              : "bg-blue-50 text-blue-700 border-blue-300"
                          }`}
                        >
                          <option value="SUBMITTED">Submitted</option>
                          <option value="UNDER_REVIEW">Under Review</option>
                          <option value="ACCEPTED">Accepted</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={11} className="px-6 py-12 text-center text-slate-500">
                    <FileText className="size-8 mx-auto text-slate-400 mb-2 opacity-50" />
                    <p className="font-semibold text-slate-700 text-sm">No abstract submissions found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {searchTerm || statusFilter !== "ALL" || trackFilter !== "ALL"
                        ? "Try adjusting your search query or filters."
                        : "Submissions will appear here once received from delegates."}
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
            Showing <strong>{displayItems.length}</strong> of <strong>{submissions.length}</strong> total abstracts
          </div>
          <div className="flex items-center gap-3">
            <span>
              Format: <code>sno, name, email, number, institution, country, Title, session/track, abstract download</code>
            </span>
          </div>
        </div>
      </div>

      {/* Detail Modal / Drawer for Viewing Full Abstract */}
      {viewingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white border border-slate-200 p-6 lg:p-8 shadow-2xl space-y-6">
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 border border-indigo-200 text-indigo-700 uppercase tracking-wider mb-1.5">
                  S.No #{viewingSubmission.sno} • Reference: {viewingSubmission.id}
                </span>
                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  {viewingSubmission.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingSubmission(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Author Meta Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Presenting Author</span>
                <p className="font-semibold text-slate-900 mt-0.5">{viewingSubmission.name}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Email Address</span>
                <p className="font-mono text-slate-800 mt-0.5">{viewingSubmission.email}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Phone Number</span>
                <p className="text-slate-800 mt-0.5">{viewingSubmission.number}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Institution &amp; Country</span>
                <p className="text-slate-800 mt-0.5">
                  {viewingSubmission.institution}, {viewingSubmission.country}
                </p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Session / Track</span>
                <p className="font-semibold text-indigo-700 mt-0.5">{viewingSubmission.track}</p>
              </div>
            </div>

            {/* Co-Authors if any */}
            {viewingSubmission.coAuthors && viewingSubmission.coAuthors.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Co-Authors ({viewingSubmission.coAuthors.length})
                </h4>
                <ul className="space-y-1.5 text-xs">
                  {viewingSubmission.coAuthors.map((c, i) => (
                    <li key={i} className="flex items-center gap-2 text-slate-700">
                      <span className="size-1.5 rounded-full bg-indigo-500" />
                      <strong>{c.name}</strong> — {c.affiliation}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Abstract Text */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Abstract Content
              </h4>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap">
                {viewingSubmission.abstractText || "No abstract text provided."}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setViewingSubmission(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  downloadSingleAbstract(viewingSubmission);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition cursor-pointer"
              >
                <Download className="size-4" />
                <span>Download Abstract File</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
