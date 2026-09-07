"use client";

import { useState } from "react";
import { Save, CheckCircle2, AlertCircle, Globe2, Search } from "lucide-react";

interface SeoFormProps {
  conferenceId: string;
  slug: string;
  initialData: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    canonicalUrl: string;
    googleAnalyticsId: string;
  };
}

export function SeoForm({ conferenceId, slug, initialData }: SeoFormProps) {
  const [formData, setFormData] = useState(initialData);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus("idle");

    try {
      const res = await fetch(`/conference-admin/api/admin/seo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conferenceId, slug, seo: formData })
      });

      if (!res.ok) throw new Error("Failed to save SEO settings");

      setStatus("success");
      setMessage("SEO & Metadata settings updated successfully!");
      setTimeout(() => setStatus("idle"), 4000);
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Failed to save SEO");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {status === "success" && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium animate-in fade-in shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium animate-in fade-in shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Google Search Result Preview */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 lg:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 text-indigo-700 font-bold text-base pb-3 border-b border-slate-100">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
            <Search className="w-5 h-5" />
          </div>
          <span>Google Search SERP Preview</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1 max-w-2xl font-sans">
          <h3 className="text-base font-semibold text-blue-700 hover:underline cursor-pointer truncate">
            {formData.metaTitle || "ICGIT 2026 - Global Innovation & Technology Summit"}
          </h3>
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {formData.metaDescription || "Join global leaders, researchers, and engineers at ICGIT 2026 in Dubai."}
          </p>
        </div>
      </div>

      {/* SEO Fields */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 lg:p-8 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 text-indigo-700 font-bold text-base pb-3 border-b border-slate-100">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
            <Globe2 className="w-5 h-5" />
          </div>
          <span>Page Metadata Configuration</span>
        </div>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Meta Title Tag</label>
              <span className="text-[11px] text-slate-400">{formData.metaTitle.length} / 60 chars</span>
            </div>
            <input
              type="text"
              name="metaTitle"
              value={formData.metaTitle}
              onChange={handleChange}
              placeholder="e.g. ICGIT 2026 - International Conference on Global Innovation & Technology"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Meta Description</label>
              <span className="text-[11px] text-slate-400">{formData.metaDescription.length} / 160 chars</span>
            </div>
            <textarea
              name="metaDescription"
              rows={3}
              value={formData.metaDescription}
              onChange={handleChange}
              placeholder="Concise summary for search engines and social cards..."
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Meta Keywords (comma-separated)</label>
            <input
              type="text"
              name="metaKeywords"
              value={formData.metaKeywords}
              onChange={handleChange}
              placeholder="AI, Innovation, Technology, Robotics, Dubai Conference"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 sticky bottom-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-xl">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Saving SEO..." : "Save SEO & Meta Tags"}</span>
        </button>
      </div>
    </form>
  );
}
