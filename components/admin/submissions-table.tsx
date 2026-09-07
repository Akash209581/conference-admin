"use client";

import { useState } from "react";
import { Search, Download, FileText, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";
import { formatDateTime } from "@/lib/admin-utils";

interface SubmissionItem {
  id: string;
  title: string;
  abstract: string;
  keywords: string[];
  trackName: string;
  authorName: string;
  authorEmail: string;
  status: string;
  createdAt: string;
}

interface SubmissionsTableProps {
  submissions: SubmissionItem[];
  conferenceSlug: string;
}

export function SubmissionsTable({ submissions: initialData, conferenceSlug }: SubmissionsTableProps) {
  const [submissions, setSubmissions] = useState<SubmissionItem[]>(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = submissions.filter((sub) => {
    const matchesSearch =
      sub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.authorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.trackName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (submissionId: string, newStatus: string) => {
    setUpdatingId(submissionId);
    try {
      const res = await fetch(`/conference-admin/api/admin/submissions/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, status: newStatus })
      });

      if (!res.ok) throw new Error("Failed to update status");

      setSubmissions((prev) =>
        prev.map((s) => (s.id === submissionId ? { ...s, status: newStatus } : s))
      );
    } catch (err: any) {
      alert(err.message || "Failed to update submission status");
    } finally {
      setUpdatingId(null);
    }
  };

  const exportCSV = () => {
    const headers = ["Title", "Track", "Author Name", "Author Email", "Keywords", "Status", "Submitted At"];
    const rows = filtered.map((s) => [
      `"${s.title.replace(/"/g, '""')}"`,
      `"${s.trackName}"`,
      `"${s.authorName}"`,
      `"${s.authorEmail}"`,
      `"${s.keywords.join(", ")}"`,
      `"${s.status}"`,
      `"${formatDateTime(s.createdAt)}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `submissions_${conferenceSlug}.csv`);
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
              placeholder="Search by title, author, track..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-700 text-sm focus:outline-none focus:border-indigo-600"
          >
            <option value="ALL">All Statuses ({submissions.length})</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Rejected</option>
            <option value="REVISION_REQUIRED">Revision Required</option>
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

      {/* Submissions Table */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Title & Abstract</th>
                <th className="px-5 py-3.5">Track</th>
                <th className="px-5 py-3.5">Author</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? (
                filtered.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 max-w-sm">
                      <p className="font-semibold text-slate-900">{sub.title}</p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{sub.abstract}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {sub.keywords?.map((kw, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-medium text-slate-600"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
                        {sub.trackName}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">{sub.authorName}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{sub.authorEmail}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 text-[11px] font-semibold rounded-full border ${
                          sub.status === "ACCEPTED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : sub.status === "REJECTED"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : sub.status === "UNDER_REVIEW"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">
                      {formatDateTime(sub.createdAt)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <select
                        disabled={updatingId === sub.id}
                        value={sub.status}
                        onChange={(e) => handleStatusChange(sub.id, e.target.value)}
                        className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-600 disabled:opacity-50"
                      >
                        <option value="SUBMITTED">Submitted</option>
                        <option value="UNDER_REVIEW">Under Review</option>
                        <option value="ACCEPTED">Accept</option>
                        <option value="REVISION_REQUIRED">Request Revision</option>
                        <option value="REJECTED">Reject</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400 text-sm">
                    No submissions found matching your search.
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
