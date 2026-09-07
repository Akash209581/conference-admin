"use client";

import { useState } from "react";
import { Save, CheckCircle2, AlertCircle, Image as ImageIcon, Upload, Loader2, Palette, } from "lucide-react";

interface MediaFormProps {
  conferenceId: string;
  slug: string;
  initialMedia: {
    heroBannerUrl: string;
    faviconUrl: string;
    headerLogoUrl: string;
    footerLogoUrl: string;
    ogImageUrl: string;
  };
}

export function MediaForm({ conferenceId, slug, initialMedia }: MediaFormProps) {
  const [formData, setFormData] = useState(initialMedia);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string, folder: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(fieldName);
    setStatus("idle");

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("folder", folder);

      const res = await fetch("/conference-admin/api/admin/upload", {
        method: "POST",
        body: data
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Upload failed");

      setFormData((prev) => ({
        ...prev,
        [fieldName]: result.url
      }));

      setStatus("success");
      setMessage(`Image uploaded successfully: ${result.url}`);
      setTimeout(() => setStatus("idle"), 4000);
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Failed to upload image");
    } finally {
      setUploadingField(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus("idle");

    try {
      const res = await fetch(`/conference-admin/api/admin/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conferenceId, slug, media: formData })
      });

      if (!res.ok) throw new Error("Failed to save media assets");

      setStatus("success");
      setMessage("Media branding & image locations updated in database successfully!");
      setTimeout(() => setStatus("idle"), 4000);
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Failed to save media");
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

      {/* Hero Banner Image */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 lg:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5 text-indigo-700 font-bold text-base">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <ImageIcon className="w-5 h-5" />
            </div>
            <span>Hero Background Banner Image</span>
          </div>
          <span className="text-xs text-slate-500 font-medium">Stored dynamically in DB</span>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Hero Image Location / Path</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                name="heroBannerUrl"
                value={formData.heroBannerUrl}
                onChange={handleChange}
                placeholder="/uploads/hero/... or https://..."
                className="flex-1 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
              <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold cursor-pointer border border-indigo-200/80 transition shadow-sm shrink-0">
                {uploadingField === "heroBannerUrl" ? (
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                ) : (
                  <Upload className="w-4 h-4 text-indigo-600" />
                )}
                <span>Upload New Hero Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "heroBannerUrl", "hero")}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {formData.heroBannerUrl && (
            <div className="relative h-56 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center shadow-inner">
              <img
                src={formData.heroBannerUrl}
                alt="Hero banner preview"
                className="w-full h-full object-cover"
                onError={(e) => ((e.target as HTMLElement).style.display = "none")}
              />
              <div className="absolute inset-0 bg-slate-900/40 flex items-end p-4">
                <span className="text-xs font-semibold text-white bg-slate-900/80 px-3 py-1.5 rounded-lg backdrop-blur-md">
                  Active Hero Image: {formData.heroBannerUrl}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Favicon & Logos */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 lg:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-2.5 text-indigo-700 font-bold text-base pb-4 border-b border-slate-100">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
            <Palette className="w-5 h-5" />
          </div>
          <span>Browser Favicon (Tab Icon) & Brand Logos</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Favicon */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Browser Favicon Location (Tab Icon)</span>
              {formData.faviconUrl && (
                <img
                  src={formData.faviconUrl}
                  alt="Favicon preview"
                  className="w-6 h-6 rounded object-contain bg-slate-100 p-0.5 border border-slate-200"
                  onError={(e) => ((e.target as HTMLElement).style.display = "none")}
                />
              )}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="faviconUrl"
                value={formData.faviconUrl}
                onChange={handleChange}
                placeholder="/favicon.ico or /uploads/favicon/..."
                className="flex-1 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
              <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer border border-slate-300 shrink-0 transition">
                {uploadingField === "faviconUrl" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                <span>Upload</span>
                <input
                  type="file"
                  accept="image/*,.ico"
                  onChange={(e) => handleFileUpload(e, "faviconUrl", "favicon")}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-[11px] text-slate-500">Only the image path location is saved to the database.</p>
          </div>

          {/* Header Logo */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Header Logo Location</span>
              {formData.headerLogoUrl && (
                <img
                  src={formData.headerLogoUrl}
                  alt="Header logo preview"
                  className="h-6 max-w-[100px] object-contain"
                  onError={(e) => ((e.target as HTMLElement).style.display = "none")}
                />
              )}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="headerLogoUrl"
                value={formData.headerLogoUrl}
                onChange={handleChange}
                placeholder="/uploads/branding/..."
                className="flex-1 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
              <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer border border-slate-300 shrink-0 transition">
                {uploadingField === "headerLogoUrl" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                <span>Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, "headerLogoUrl", "branding")}
                  className="hidden"
                />
              </label>
            </div>
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
          <span>{saving ? "Saving Media..." : "Save Media Assets to Database"}</span>
        </button>
      </div>
    </form>
  );
}
