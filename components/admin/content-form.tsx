"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { safeFetchJson } from "@/lib/fetch-client";
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  LayoutTemplate,
  Clock,
  BookOpen,
  CalendarDays,
  Mic2,
  MapPin,
  Mail,
  Layers,
  Upload,
  Loader2,
  Plus,
  Trash2,
  Edit2,
  User,
  ExternalLink,
  Link2
} from "lucide-react";


interface SectionField {
  badge?: string;
  title?: string;
  titleColor?: string;
  description?: string;
  paragraph1?: string;
  paragraph2?: string;
  ctaText1?: string;
  ctaLink1?: string;
  ctaText2?: string;
  ctaLink2?: string;
  heroImage?: string;
  aboutImage?: string;
  targetDate?: string;
  format?: string;
  mainHall?: string;
  mapLink?: string;
  heroVenue?: string;
  heroDates?: string;
  heroMode?: string;
  [key: string]: string | undefined;
}

interface SectionItem {
  id: string;
  name: string;
  visible?: boolean;
  fields: SectionField;
}

interface LinkItem {
  label: string;
  href: string;
}

interface FooterData {
  tagline?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  footerCopyright?: string;
  quickLinks?: LinkItem[];
  resourceLinks?: LinkItem[];
}

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

interface ContentFormProps {
  initialFaviconUrl?: string;
  conferenceId: string;
  slug: string;
  initialSections: SectionItem[];
  initialFooter: FooterData;
  initialSpeakers?: SpeakerItem[];
}

export function ContentForm({
  conferenceId,
  slug,
  initialSections,
  initialFooter,
  initialSpeakers = [],
  initialFaviconUrl = "/favicon.ico"
}: ContentFormProps) {
  const [sections, setSections] = useState<SectionItem[]>(initialSections);
  const [footerData, setFooterData] = useState<FooterData>({
    tagline: initialFooter?.tagline || "International Conference on Global Innovation and Technology",
    contactEmail: initialFooter?.contactEmail || "secretariat@icgit2026.org",
    contactPhone: initialFooter?.contactPhone || "+971 4 000 2026",
    contactAddress: initialFooter?.contactAddress || "Dubai World Trade Centre, Dubai, United Arab Emirates",
    footerCopyright: initialFooter?.footerCopyright || "© 2026 ICGIT. All rights reserved.",
    quickLinks: initialFooter?.quickLinks || [
      { label: "Home", href: "/#home" },
      { label: "About", href: "/#about" },
      { label: "Brochure", href: "/#brochure" },
      { label: "Sessions", href: "/#sessions" },
      { label: "Speakers", href: "/#speakers" },
      { label: "Venue", href: "/#venue" },
      { label: "Contact Us", href: "/#contact" }
    ],
    resourceLinks: initialFooter?.resourceLinks || [
      { label: "Brochure", href: "/brochure" },
      { label: "Abstract Submission", href: "/abstracts" },
      { label: "Registration", href: "/registration" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" }
    ]
  });

  const [speakers, setSpeakers] = useState<SpeakerItem[]>(initialSpeakers);
  const toast = useToast();
  const [editingSpeaker, setEditingSpeaker] = useState<Partial<SpeakerItem> | null>(null);
  const [isNewSpeaker, setIsNewSpeaker] = useState(false);
  const [uploadingSpeakerPhoto, setUploadingSpeakerPhoto] = useState(false);

  const [activeTab, setActiveTab] = useState<string>("hero");
  const [saving, setSaving] = useState(false);
  const [faviconUrl, setFaviconUrl] = useState(initialFaviconUrl);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const sectionTabs = [
    { id: "hero", label: "Hero Banner", icon: LayoutTemplate },
    { id: "countdown", label: "Countdown Timer", icon: Clock },
    { id: "about", label: "About Conference", icon: BookOpen },
    { id: "sessions", label: "Program & Tracks", icon: CalendarDays },
    { id: "speakers", label: "Speakers Section", icon: Mic2 },
    { id: "venue", label: "Venue & Location", icon: MapPin },
    { id: "contact", label: "Contact Secretariat", icon: Mail },
    { id: "footer", label: "Footer & Legal", icon: Layers }
  ];

  const getSection = (id: string): SectionItem => {
    return (
      sections.find((s) => s.id === id) || {
        id,
        name: id.toUpperCase(),
        visible: true,
        fields: {}
      }
    );
  };

  const updateSectionField = (sectionId: string, fieldKey: string, value: string) => {
    setSections((prev) => {
      const existing = prev.find((s) => s.id === sectionId);
      if (existing) {
        return prev.map((s) =>
          s.id === sectionId
            ? { ...s, fields: { ...s.fields, [fieldKey]: value } }
            : s
        );
      } else {
        return [
          ...prev,
          {
            id: sectionId,
            name: sectionId.toUpperCase(),
            visible: true,
            fields: { [fieldKey]: value }
          }
        ];
      }
    });
  };

  const toggleSectionVisibility = (sectionId: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, visible: s.visible === false ? true : false } : s))
    );
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingHero(true);
    setStatus("idle");

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("folder", "hero");

      const res = await safeFetchJson<{ url: string }>("/conference-admin/api/admin/upload", {
        method: "POST",
        body: data
      });

      if (!res.ok || !res.data) {
        throw new Error(res.error || "Hero image upload failed");
      }

      updateSectionField("hero", "heroImage", res.data.url);
      setStatus("success");
      setMessage(`Hero image uploaded: ${res.data.url}`);
      toast.success("Hero image uploaded successfully!", "Upload Complete");
      setTimeout(() => setStatus("idle"), 4000);
    } catch (err: any) {
      setStatus("error");
      const errText = err.message || "Failed to upload hero image";
      setMessage(errText);
      toast.error(errText, "Upload Error");
    } finally {
      setUploadingHero(false);
    }
  };

  // Speakers inline handlers
  const handleCreateSpeaker = () => {
    setEditingSpeaker({
      name: "",
      role: "",
      topic: "",
      organizationName: "",
      bio: "",
      imageAssetId: null,
      sortOrder: speakers.length
    });
    setIsNewSpeaker(true);
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFavicon(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("conferenceId", conferenceId);
      data.append("category", "branding");

      const res = await safeFetchJson<{ url: string }>("/conference-admin/api/admin/upload", {
        method: "POST",
        body: data
      });

      if (!res.ok || !res.data) {
        throw new Error(res.error || "Failed to upload favicon");
      }

      setFaviconUrl(res.data.url);
      setStatus("success");
      setMessage("Favicon uploaded successfully! Click 'Publish All Section Changes' to save.");
      toast.success("Favicon uploaded successfully!", "Favicon Ready");
    } catch (err: any) {
      setStatus("error");
      const errText = err.message || "Favicon upload failed";
      setMessage(errText);
      toast.error(errText, "Upload Error");
    } finally {
      setUploadingFavicon(false);
    }
  };

  const handleSpeakerPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSpeakerPhoto(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("folder", "speakers");

      const res = await safeFetchJson<{ url: string }>("/conference-admin/api/admin/upload", {
        method: "POST",
        body: data
      });

      if (!res.ok || !res.data) {
        throw new Error(res.error || "Speaker photo upload failed");
      }

      setEditingSpeaker((prev) => ({
        ...prev,
        imageAssetId: res.data!.url
      }));

      setStatus("success");
      setMessage(`Speaker photo uploaded: ${res.data.url}`);
      toast.success("Speaker photo uploaded successfully!", "Photo Uploaded");
      setTimeout(() => setStatus("idle"), 4000);
    } catch (err: any) {
      setStatus("error");
      const errText = err.message || "Failed to upload photo";
      setMessage(errText);
      toast.error(errText, "Photo Error");
    } finally {
      setUploadingSpeakerPhoto(false);
    }
  };

  const handleSaveSpeaker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSpeaker) return;

    try {
      const res = await safeFetchJson<{ speaker: SpeakerItem }>("/conference-admin/api/admin/speakers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conferenceId,
          slug,
          isNew: isNewSpeaker,
          speaker: editingSpeaker
        })
      });

      if (!res.ok || !res.data) {
        throw new Error(res.error || "Failed to save speaker");
      }

      if (isNewSpeaker) {
        setSpeakers([...speakers, res.data.speaker]);
      } else {
        setSpeakers(speakers.map((s) => (s.id === res.data!.speaker.id ? res.data!.speaker : s)));
      }

      setEditingSpeaker(null);
      setIsNewSpeaker(false);
      setStatus("success");
      setMessage("Speaker photo & details saved in database!");
      toast.success("Speaker saved and published successfully!", "Speaker Saved");
      setTimeout(() => setStatus("idle"), 4000);
    } catch (err: any) {
      setStatus("error");
      const errText = err.message || "Failed to save speaker";
      setMessage(errText);
      toast.error(errText, "Speaker Error");
    }
  };

  const handleDeleteSpeaker = async (speakerId: string) => {
    if (!confirm("Are you sure you want to delete this speaker?")) return;

    try {
      const res = await safeFetchJson(`/conference-admin/api/admin/speakers?id=${speakerId}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        throw new Error(res.error || "Failed to delete speaker");
      }

      setSpeakers(speakers.filter((s) => s.id !== speakerId));
      setStatus("success");
      setMessage("Speaker deleted from database.");
      toast.info("Speaker deleted from roster.", "Speaker Removed");
      setTimeout(() => setStatus("idle"), 4000);
    } catch (err: any) {
      setStatus("error");
      const errText = err.message || "Failed to delete speaker";
      setMessage(errText);
      toast.error(errText, "Delete Failed");
    }
  };

  // Footer Link Handlers
  const addQuickLink = () => {
    setFooterData((prev) => ({
      ...prev,
      quickLinks: [...(prev.quickLinks || []), { label: "New Link", href: "/#new" }]
    }));
  };

  const updateQuickLink = (index: number, key: "label" | "href", val: string) => {
    setFooterData((prev) => {
      const list = [...(prev.quickLinks || [])];
      list[index] = { ...list[index], [key]: val };
      return { ...prev, quickLinks: list };
    });
  };

  const removeQuickLink = (index: number) => {
    setFooterData((prev) => ({
      ...prev,
      quickLinks: (prev.quickLinks || []).filter((_, i) => i !== index)
    }));
  };

  const addResourceLink = () => {
    setFooterData((prev) => ({
      ...prev,
      resourceLinks: [...(prev.resourceLinks || []), { label: "New Resource", href: "/resource" }]
    }));
  };

  const updateResourceLink = (index: number, key: "label" | "href", val: string) => {
    setFooterData((prev) => {
      const list = [...(prev.resourceLinks || [])];
      list[index] = { ...list[index], [key]: val };
      return { ...prev, resourceLinks: list };
    });
  };

  const removeResourceLink = (index: number) => {
    setFooterData((prev) => ({
      ...prev,
      resourceLinks: (prev.resourceLinks || []).filter((_, i) => i !== index)
    }));
  };

  const handleFooterFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFooterData({
      ...footerData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus("idle");

    try {
      const res = await safeFetchJson(`/conference-admin/api/admin/content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conferenceId, slug, sections, footer: footerData })
      });

      if (!res.ok) {
        throw new Error(res.error || "Failed to save content");
      }

      setStatus("success");
      const msg = "All page content, venue map settings & footer links published to database successfully!";
      setMessage(msg);
      toast.success(msg, "Changes Published");
      setTimeout(() => setStatus("idle"), 4000);
    } catch (err: any) {
      setStatus("error");
      const errText = err.message || "Failed to save content";
      setMessage(errText);
      toast.error(errText, "Publication Error");
    } finally {
      setSaving(false);
    }
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      {/* Section Switcher Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white border border-slate-200 rounded-2xl overflow-x-auto shadow-sm">
        {sectionTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: HERO */}
      {activeTab === "hero" && (() => {
        const sec = getSection("hero");
        return (
          <div className="rounded-2xl bg-white border border-slate-200 p-6 lg:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-base">
                <LayoutTemplate className="w-5 h-5" />
                <span>Hero Section Configuration</span>
              </div>
              <button
                type="button"
                onClick={() => toggleSectionVisibility("hero")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  sec.visible !== false
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-500 border-slate-200"
                }`}
              >
                {sec.visible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                <span>{sec.visible !== false ? "Section Visible" : "Section Hidden"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Badge Text</label>
                <input
                  type="text"
                  value={sec.fields?.badge || ""}
                  onChange={(e) => updateSectionField("hero", "badge", e.target.value)}
                  placeholder="DECEMBER 8–10, 2026 • DUBAI, UAE"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Hero Main Title</label>
                <input
                  type="text"
                  value={sec.fields?.title || ""}
                  onChange={(e) => updateSectionField("hero", "title", e.target.value)}
                  placeholder="8th International Conference on"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Highlighted Color Subtitle</label>
                <input
                  type="text"
                  value={sec.fields?.titleColor || ""}
                  onChange={(e) => updateSectionField("hero", "titleColor", e.target.value)}
                  placeholder="Global Innovation & Technology"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Description Paragraph</label>
                <textarea
                  rows={3}
                  value={sec.fields?.description || ""}
                  onChange={(e) => updateSectionField("hero", "description", e.target.value)}
                  placeholder="Bringing together 2,000+ visionaries, researchers..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Hero Venue & City Display Tag</label>
                <input
                  type="text"
                  value={sec.fields?.heroVenue || ""}
                  onChange={(e) => updateSectionField("hero", "heroVenue", e.target.value)}
                  placeholder="Dubai World Trade Centre, Dubai"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Hero Dates Display Tag</label>
                <input
                  type="text"
                  value={sec.fields?.heroDates || ""}
                  onChange={(e) => updateSectionField("hero", "heroDates", e.target.value)}
                  placeholder="December 8–10, 2026"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Hero Event Mode Tag</label>
                <input
                  type="text"
                  value={sec.fields?.heroMode || ""}
                  onChange={(e) => updateSectionField("hero", "heroMode", e.target.value)}
                  placeholder="Hybrid Event"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Register CTA Button Text</label>
                <input
                  type="text"
                  value={sec.fields?.ctaText2 || ""}
                  onChange={(e) => updateSectionField("hero", "ctaText2", e.target.value)}
                  placeholder="Register Now"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              {/* Hero Image Field */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-semibold text-slate-700">Hero Section Display Image</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={sec.fields?.heroImage || ""}
                    onChange={(e) => updateSectionField("hero", "heroImage", e.target.value)}
                    placeholder="/uploads/hero/... or https://..."
                    className="flex-1 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                  <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold cursor-pointer border border-indigo-200/80 transition shadow-sm shrink-0">
                    {uploadingHero ? <Loader2 className="w-4 h-4 animate-spin text-indigo-600" /> : <Upload className="w-4 h-4" />}
                    <span>Upload New Hero Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleHeroImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* TAB 2: COUNTDOWN */}
      {activeTab === "countdown" && (() => {
        const sec = getSection("countdown");
        return (
          <div className="rounded-2xl bg-white border border-slate-200 p-6 lg:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-base">
                <Clock className="w-5 h-5" />
                <span>Countdown Timer Section</span>
              </div>
              <button
                type="button"
                onClick={() => toggleSectionVisibility("countdown")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  sec.visible !== false
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-500 border-slate-200"
                }`}
              >
                {sec.visible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span>{sec.visible !== false ? "Section Visible" : "Section Hidden"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Badge Text</label>
                <input
                  type="text"
                  value={sec.fields?.badge || ""}
                  onChange={(e) => updateSectionField("countdown", "badge", e.target.value)}
                  placeholder="⏳ Conference Begins In"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Heading Title</label>
                <input
                  type="text"
                  value={sec.fields?.title || ""}
                  onChange={(e) => updateSectionField("countdown", "title", e.target.value)}
                  placeholder="Don't Miss This Global Event"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
            </div>
          </div>
        );
      })()}

      {/* TAB 3: ABOUT */}
      {activeTab === "about" && (() => {
        const sec = getSection("about");
        return (
          <div className="rounded-2xl bg-white border border-slate-200 p-6 lg:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-base">
                <BookOpen className="w-5 h-5" />
                <span>About Conference Section</span>
              </div>
              <button
                type="button"
                onClick={() => toggleSectionVisibility("about")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  sec.visible !== false
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-500 border-slate-200"
                }`}
              >
                {sec.visible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span>{sec.visible !== false ? "Section Visible" : "Section Hidden"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Badge</label>
                <input
                  type="text"
                  value={sec.fields?.badge || ""}
                  onChange={(e) => updateSectionField("about", "badge", e.target.value)}
                  placeholder="About the Conference"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Title</label>
                <input
                  type="text"
                  value={sec.fields?.title || ""}
                  onChange={(e) => updateSectionField("about", "title", e.target.value)}
                  placeholder="Shaping the Future Together"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Paragraph 1</label>
                <textarea
                  rows={3}
                  value={sec.fields?.paragraph1 || ""}
                  onChange={(e) => updateSectionField("about", "paragraph1", e.target.value)}
                  placeholder="Detailed overview..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Paragraph 2</label>
                <textarea
                  rows={3}
                  value={sec.fields?.paragraph2 || ""}
                  onChange={(e) => updateSectionField("about", "paragraph2", e.target.value)}
                  placeholder="Additional event details..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
            </div>
          </div>
        );
      })()}

      {/* TAB 4: SESSIONS */}
      {activeTab === "sessions" && (() => {
        const sec = getSection("sessions");
        return (
          <div className="rounded-2xl bg-white border border-slate-200 p-6 lg:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-base">
                <CalendarDays className="w-5 h-5" />
                <span>Sessions & Tracks Section</span>
              </div>
              <button
                type="button"
                onClick={() => toggleSectionVisibility("sessions")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  sec.visible !== false
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-500 border-slate-200"
                }`}
              >
                {sec.visible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span>{sec.visible !== false ? "Section Visible" : "Section Hidden"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Badge</label>
                <input
                  type="text"
                  value={sec.fields?.badge || ""}
                  onChange={(e) => updateSectionField("sessions", "badge", e.target.value)}
                  placeholder="🎯 Conference Program"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Heading Title</label>
                <input
                  type="text"
                  value={sec.fields?.title || ""}
                  onChange={(e) => updateSectionField("sessions", "title", e.target.value)}
                  placeholder="Sessions, Tracks & Key Dates"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  value={sec.fields?.description || ""}
                  onChange={(e) => updateSectionField("sessions", "description", e.target.value)}
                  placeholder="Explore the multifaceted agenda..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
            </div>
          </div>
        );
      })()}

      {/* TAB 5: SPEAKERS (WITH INLINE SPEAKER MANAGEMENT & PHOTO UPLOAD) */}
      {activeTab === "speakers" && (() => {
        const sec = getSection("speakers");
        return (
          <div className="space-y-6">
            {/* Section Heading Card */}
            <div className="rounded-2xl bg-white border border-slate-200 p-6 lg:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2 text-indigo-700 font-bold text-base">
                  <Mic2 className="w-5 h-5" />
                  <span>Featured Speakers Section Header</span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSectionVisibility("speakers")}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    sec.visible !== false
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-slate-100 text-slate-500 border-slate-200"
                  }`}
                >
                  {sec.visible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  <span>{sec.visible !== false ? "Section Visible" : "Section Hidden"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Badge</label>
                  <input
                    type="text"
                    value={sec.fields?.badge || ""}
                    onChange={(e) => updateSectionField("speakers", "badge", e.target.value)}
                    placeholder="Visionary Thought Leaders"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Heading Title</label>
                  <input
                    type="text"
                    value={sec.fields?.title || ""}
                    onChange={(e) => updateSectionField("speakers", "title", e.target.value)}
                    placeholder="World-Class Keynotes & Panelists"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Description</label>
                  <textarea
                    rows={2}
                    value={sec.fields?.description || ""}
                    onChange={(e) => updateSectionField("speakers", "description", e.target.value)}
                    placeholder="Hear from the foremost minds..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Inline Speakers Photo & Name Manager */}
            <div className="rounded-2xl bg-white border border-slate-200 p-6 lg:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-600" />
                    <span>Manage Speaker Profiles & Photos ({speakers.length})</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload speaker portrait photos, names, titles, organizations, and keynote topics directly.
                  </p>
                </div>

                {!editingSpeaker && (
                  <button
                    type="button"
                    onClick={handleCreateSpeaker}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Speaker</span>
                  </button>
                )}
              </div>

              {/* Speaker Edit Form Modal / Box */}
              {editingSpeaker && (
                <div className="p-6 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-indigo-100">
                    <h4 className="font-bold text-indigo-900 text-sm">
                      {isNewSpeaker ? "Add Keynote Speaker" : `Edit Speaker: ${editingSpeaker.name}`}
                    </h4>
                    <span className="text-xs text-slate-500">Saved to /uploads/speakers</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Full Name *</label>
                      <input
                        type="text"
                        value={editingSpeaker.name || ""}
                        onChange={(e) => setEditingSpeaker({ ...editingSpeaker, name: e.target.value })}
                        placeholder="e.g. Dr. Amina Rahman"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-indigo-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Professional Role / Title *</label>
                      <input
                        type="text"
                        value={editingSpeaker.role || ""}
                        onChange={(e) => setEditingSpeaker({ ...editingSpeaker, role: e.target.value })}
                        placeholder="e.g. Chief AI Scientist"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-indigo-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Organization / University *</label>
                      <input
                        type="text"
                        value={editingSpeaker.organizationName || ""}
                        onChange={(e) => setEditingSpeaker({ ...editingSpeaker, organizationName: e.target.value })}
                        placeholder="e.g. Global Tech Institute"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-indigo-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Presentation Topic</label>
                      <input
                        type="text"
                        value={editingSpeaker.topic || ""}
                        onChange={(e) => setEditingSpeaker({ ...editingSpeaker, topic: e.target.value })}
                        placeholder="e.g. Next-Gen Generative Intelligence"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-indigo-600"
                      />
                    </div>

                    {/* Photo Uploader */}
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Speaker Portrait Photo</label>
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-white border border-slate-300 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                          {editingSpeaker.imageAssetId ? (
                            <img
                              src={editingSpeaker.imageAssetId}
                              alt="Portrait"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-6 h-6 text-slate-400" />
                          )}
                        </div>

                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            value={editingSpeaker.imageAssetId || ""}
                            onChange={(e) => setEditingSpeaker({ ...editingSpeaker, imageAssetId: e.target.value })}
                            placeholder="/uploads/speakers/photo.png or https://..."
                            className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-indigo-600"
                          />
                          <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-semibold cursor-pointer border border-slate-300 shrink-0 shadow-sm transition">
                            {uploadingSpeakerPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                            <span>Upload Photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleSpeakerPhotoUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-indigo-100">
                    <button
                      type="button"
                      onClick={() => setEditingSpeaker(null)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200/60"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveSpeaker}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Speaker Profile</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Speakers Grid / Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {speakers.map((sp) => (
                  <div
                    key={sp.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between hover:border-indigo-200 transition"
                  >
                    <div className="space-y-3">
                      <div className="aspect-square rounded-xl bg-white border border-slate-200 overflow-hidden relative flex items-center justify-center">
                        {sp.imageAssetId ? (
                          <img
                            src={sp.imageAssetId}
                            alt={sp.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="size-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                            {sp.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm leading-snug">{sp.name}</h4>
                        <p className="text-xs text-indigo-600 font-medium mt-0.5">{sp.role}</p>
                        <p className="text-[11px] text-slate-500">{sp.organizationName}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSpeaker({ ...sp });
                          setIsNewSpeaker(false);
                        }}
                        className="p-1.5 rounded-lg bg-white hover:bg-slate-200 text-slate-700 border border-slate-200"
                        title="Edit Speaker"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSpeaker(sp.id)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200"
                        title="Delete Speaker"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* TAB 6: VENUE (WITH GOOGLE MAP LOCATION LINK / SEARCH QUERY ACCESSIBILITY) */}
      {activeTab === "venue" && (() => {
        const sec = getSection("venue");
        return (
          <div className="rounded-2xl bg-white border border-slate-200 p-6 lg:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-base">
                <MapPin className="w-5 h-5" />
                <span>Venue & Interactive Google Map Location</span>
              </div>
              <button
                type="button"
                onClick={() => toggleSectionVisibility("venue")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  sec.visible !== false
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-500 border-slate-200"
                }`}
              >
                {sec.visible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span>{sec.visible !== false ? "Section Visible" : "Section Hidden"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Badge Text</label>
                <input
                  type="text"
                  value={sec.fields?.badge || ""}
                  onChange={(e) => updateSectionField("venue", "badge", e.target.value)}
                  placeholder="EVENT LOCATION"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Title Heading</label>
                <input
                  type="text"
                  value={sec.fields?.title || ""}
                  onChange={(e) => updateSectionField("venue", "title", e.target.value)}
                  placeholder="Hosted in the Heart of"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Venue Description</label>
                <textarea
                  rows={2}
                  value={sec.fields?.description || ""}
                  onChange={(e) => updateSectionField("venue", "description", e.target.value)}
                  placeholder="Dubai World Trade Centre, situated at the crossroads..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              {/* Map Location Link / Coordinates Input */}
              <div className="md:col-span-2 space-y-2 p-4 rounded-xl bg-indigo-50/50 border border-indigo-200/80">
                <label className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                  <Link2 className="w-4 h-4 text-indigo-600" />
                  <span>Google Map Pointing Location Link / Search Query / Coordinates</span>
                </label>
                <input
                  type="text"
                  value={sec.fields?.mapLink || ""}
                  onChange={(e) => updateSectionField("venue", "mapLink", e.target.value)}
                  placeholder="e.g. Dubai World Trade Centre, Dubai OR https://maps.google.com/?q=... OR https://maps.google.com/maps?..."
                  className="w-full px-3.5 py-2.5 bg-white border border-indigo-200 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Enter any location name, address, Google Maps link, or coordinate string. The map and &ldquo;Open in Maps ↗&rdquo; button will automatically point to this exact location.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Format Card Label</label>
                <input
                  type="text"
                  value={sec.fields?.format || ""}
                  onChange={(e) => updateSectionField("venue", "format", e.target.value)}
                  placeholder="Hybrid (Onsite & Online)"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Main Hall Name</label>
                <input
                  type="text"
                  value={sec.fields?.mainHall || ""}
                  onChange={(e) => updateSectionField("venue", "mainHall", e.target.value)}
                  placeholder="Sheikh Maktoum Hall"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
            </div>
          </div>
        );
      })()}

      {/* TAB 7: CONTACT */}
      {activeTab === "contact" && (() => {
        const sec = getSection("contact");
        return (
          <div className="rounded-2xl bg-white border border-slate-200 p-6 lg:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-base">
                <Mail className="w-5 h-5" />
                <span>Contact Secretariat Section</span>
              </div>
              <button
                type="button"
                onClick={() => toggleSectionVisibility("contact")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  sec.visible !== false
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-500 border-slate-200"
                }`}
              >
                {sec.visible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span>{sec.visible !== false ? "Section Visible" : "Section Hidden"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Badge</label>
                <input
                  type="text"
                  value={sec.fields?.badge || ""}
                  onChange={(e) => updateSectionField("contact", "badge", e.target.value)}
                  placeholder="✉ Contact Secretariat"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Heading Title</label>
                <input
                  type="text"
                  value={sec.fields?.title || ""}
                  onChange={(e) => updateSectionField("contact", "title", e.target.value)}
                  placeholder="Get in Touch"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  value={sec.fields?.description || ""}
                  onChange={(e) => updateSectionField("contact", "description", e.target.value)}
                  placeholder="Questions on registration, submission, or corporate sponsorship? Send us an inquiry below..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
            </div>
          </div>
        );
      })()}

      {/* TAB 8: FOOTER (FULL ACCESS: QUICK LINKS, RESOURCE LINKS, CONTACTS & COPYRIGHT) */}
      {activeTab === "footer" && (
        <div className="rounded-2xl bg-white border border-slate-200 p-6 lg:p-8 shadow-sm space-y-8">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-base pb-4 border-b border-slate-100">
            <Layers className="w-5 h-5" />
            <span>Footer Complete Customizer (Links, Contacts & Branding)</span>
          </div>

          {/* Conference Tagline */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Conference Tagline / Subtitle in Footer</label>
            <input
              type="text"
              name="tagline"
              value={footerData?.tagline || ""}
              onChange={handleFooterFieldChange}
              placeholder="International Conference on Global Innovation and Technology 2026"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>

          {/* Quick Links Manager */}
          <div className="space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Quick Navigation Links ({footerData.quickLinks?.length || 0})</h4>
                <p className="text-xs text-slate-500">Edit label and target URL for each footer navigation link.</p>
              </div>
              <button
                type="button"
                onClick={addQuickLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Quick Link</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {footerData.quickLinks?.map((link, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => updateQuickLink(idx, "label", e.target.value)}
                    placeholder="Link Label (e.g. Speakers)"
                    className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-indigo-600"
                  />
                  <input
                    type="text"
                    value={link.href}
                    onChange={(e) => updateQuickLink(idx, "href", e.target.value)}
                    placeholder="URL / Anchor (e.g. /#speakers)"
                    className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-indigo-600"
                  />
                  <button
                    type="button"
                    onClick={() => removeQuickLink(idx)}
                    className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200"
                    title="Remove Link"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Resource Links Manager */}
          <div className="space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Resource Links ({footerData.resourceLinks?.length || 0})</h4>
                <p className="text-xs text-slate-500">Edit brochure, submission, registration, terms, and privacy links.</p>
              </div>
              <button
                type="button"
                onClick={addResourceLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Resource Link</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {footerData.resourceLinks?.map((link, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => updateResourceLink(idx, "label", e.target.value)}
                    placeholder="Resource Label (e.g. Abstract Submission)"
                    className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-indigo-600"
                  />
                  <input
                    type="text"
                    value={link.href}
                    onChange={(e) => updateResourceLink(idx, "href", e.target.value)}
                    placeholder="URL (e.g. /abstracts)"
                    className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-indigo-600"
                  />
                  <button
                    type="button"
                    onClick={() => removeResourceLink(idx)}
                    className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200"
                    title="Remove Link"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Secretariat Official Email</label>
              <input
                type="email"
                name="contactEmail"
                value={footerData?.contactEmail || ""}
                onChange={handleFooterFieldChange}
                placeholder="secretariat@icgit2026.org"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Secretariat Phone</label>
              <input
                type="text"
                name="contactPhone"
                value={footerData?.contactPhone || ""}
                onChange={handleFooterFieldChange}
                placeholder="+971 4 000 2026"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Secretariat Physical Address</label>
              <input
                type="text"
                name="contactAddress"
                value={footerData?.contactAddress || ""}
                onChange={handleFooterFieldChange}
                placeholder="Dubai World Trade Centre, Dubai, United Arab Emirates"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Footer Copyright Text</label>
              <input
                type="text"
                name="footerCopyright"
                value={footerData?.footerCopyright || ""}
                onChange={handleFooterFieldChange}
                placeholder="© 2026 ICGIT. All rights reserved."
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
          </div>
        </div>
      )}

      {/* Save Button Bar */}
      <div className="flex items-center justify-between sticky bottom-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-xl">
        <p className="text-xs text-slate-500 font-medium">
          Editing <span className="font-semibold text-slate-900">{sectionTabs.find((t) => t.id === activeTab)?.label}</span>
        </p>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Publishing Changes..." : "Publish All Section Changes"}</span>
        </button>
      </div>
    </form>
  );
}
