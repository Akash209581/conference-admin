"use client";

import { useState } from "react";
import {
  Save,
  Trash2,
  Edit2,
  Plus,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Mic2,
  User
} from "lucide-react";

interface SpeakerItem {
  id: string;
  name: string;
  role: string;
  topic: string;
  bio: string | null;
  organizationName: string;
  imageAssetId: string | null;
  sortOrder: number;
}

interface SpeakersManagerProps {
  conferenceId: string;
  slug: string;
  initialSpeakers: SpeakerItem[];
}

export function SpeakersManager({ conferenceId, slug, initialSpeakers }: SpeakersManagerProps) {
  const [speakers, setSpeakers] = useState<SpeakerItem[]>(initialSpeakers);
  const [editingSpeaker, setEditingSpeaker] = useState<Partial<SpeakerItem> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleCreateNew = () => {
    setEditingSpeaker({
      name: "",
      role: "",
      topic: "",
      organizationName: "",
      bio: "",
      imageAssetId: null,
      sortOrder: speakers.length
    });
    setIsNew(true);
  };

  const handleEdit = (sp: SpeakerItem) => {
    setEditingSpeaker({ ...sp });
    setIsNew(false);
  };

  const handleCancel = () => {
    setEditingSpeaker(null);
    setIsNew(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("folder", "speakers");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: data
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Photo upload failed");

      setEditingSpeaker((prev) => ({
        ...prev,
        imageAssetId: result.url
      }));

      setStatus("success");
      setMessage(`Speaker photo uploaded: ${result.url}`);
      setTimeout(() => setStatus("idle"), 4000);
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveSpeaker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSpeaker) return;

    setSaving(true);
    setStatus("idle");

    try {
      const res = await fetch("/api/admin/speakers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conferenceId,
          slug,
          isNew,
          speaker: editingSpeaker
        })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to save speaker");

      if (isNew) {
        setSpeakers([...speakers, result.speaker]);
      } else {
        setSpeakers(speakers.map((s) => (s.id === result.speaker.id ? result.speaker : s)));
      }

      setEditingSpeaker(null);
      setIsNew(false);
      setStatus("success");
      setMessage("Speaker saved successfully in database!");
      setTimeout(() => setStatus("idle"), 4000);
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Failed to save speaker");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSpeaker = async (speakerId: string) => {
    if (!confirm("Are you sure you want to delete this speaker?")) return;

    try {
      const res = await fetch(`/api/admin/speakers?id=${speakerId}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Failed to delete speaker");

      setSpeakers(speakers.filter((s) => s.id !== speakerId));
      setStatus("success");
      setMessage("Speaker removed from database.");
      setTimeout(() => setStatus("idle"), 4000);
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Failed to delete speaker");
    }
  };

  return (
    <div className="space-y-6">
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

      {/* Header bar */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Mic2 className="w-5 h-5 text-indigo-600" />
            <span>Keynote Speakers ({speakers.length})</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage keynote speakers, their research topics, organizations, and uploaded portrait photos.
          </p>
        </div>

        {!editingSpeaker && (
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Speaker</span>
          </button>
        )}
      </div>

      {/* Edit / Add Modal or Form */}
      {editingSpeaker && (
        <form
          onSubmit={handleSaveSpeaker}
          className="rounded-2xl bg-white border border-indigo-200 p-6 lg:p-8 shadow-md space-y-6 animate-in fade-in"
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="font-bold text-indigo-700 text-base">
              {isNew ? "Add New Keynote Speaker" : `Edit Speaker: ${editingSpeaker.name}`}
            </h3>
            <span className="text-xs text-slate-400 font-medium">All photos saved in /uploads/speakers</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Full Name *</label>
              <input
                required
                type="text"
                value={editingSpeaker.name || ""}
                onChange={(e) => setEditingSpeaker({ ...editingSpeaker, name: e.target.value })}
                placeholder="e.g. Dr. Amina Rahman"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Professional Role / Title *</label>
              <input
                required
                type="text"
                value={editingSpeaker.role || ""}
                onChange={(e) => setEditingSpeaker({ ...editingSpeaker, role: e.target.value })}
                placeholder="e.g. Chief AI Scientist"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Organization / University *</label>
              <input
                required
                type="text"
                value={editingSpeaker.organizationName || ""}
                onChange={(e) => setEditingSpeaker({ ...editingSpeaker, organizationName: e.target.value })}
                placeholder="e.g. Global Tech Institute"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Keynote Presentation Topic</label>
              <input
                type="text"
                value={editingSpeaker.topic || ""}
                onChange={(e) => setEditingSpeaker({ ...editingSpeaker, topic: e.target.value })}
                placeholder="e.g. Next-Gen Generative Intelligence"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>

            {/* Photo Uploader */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-semibold text-slate-700">Speaker Portrait Photo</label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                  {editingSpeaker.imageAssetId ? (
                    <img
                      src={editingSpeaker.imageAssetId}
                      alt="Speaker portrait"
                      className="w-full h-full object-cover"
                      onError={(e) => ((e.target as HTMLElement).style.display = "none")}
                    />
                  ) : (
                    <User className="w-7 h-7 text-slate-400" />
                  )}
                </div>

                <div className="flex-1 w-full flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={editingSpeaker.imageAssetId || ""}
                    onChange={(e) => setEditingSpeaker({ ...editingSpeaker, imageAssetId: e.target.value })}
                    placeholder="/uploads/speakers/photo.png or https://..."
                    className="flex-1 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                  <label className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer border border-slate-300 transition shrink-0">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    <span>Upload Portrait</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Biography</label>
              <textarea
                rows={3}
                value={editingSpeaker.bio || ""}
                onChange={(e) => setEditingSpeaker({ ...editingSpeaker, bio: e.target.value })}
                placeholder="Brief professional background and achievements..."
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving Speaker..." : "Save Speaker"}</span>
            </button>
          </div>
        </form>
      )}

      {/* Speakers List Table */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Speaker</th>
                <th className="px-5 py-3.5">Organization</th>
                <th className="px-5 py-3.5">Keynote Topic</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {speakers.map((sp) => (
                <tr key={sp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                        {sp.imageAssetId ? (
                          <img
                            src={sp.imageAssetId}
                            alt={sp.name}
                            className="w-full h-full object-cover"
                            onError={(e) => ((e.target as HTMLElement).style.display = "none")}
                          />
                        ) : (
                          <span className="text-xs font-bold text-indigo-600">
                            {sp.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{sp.name}</p>
                        <p className="text-xs text-indigo-600 font-medium">{sp.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-600 font-medium">
                    {sp.organizationName || "N/A"}
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-600 max-w-xs truncate">
                    {sp.topic ? `"${sp.topic}"` : "—"}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(sp)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSpeaker(sp.id)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
