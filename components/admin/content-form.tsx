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
  Link2,
  Users,
  Compass,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  Coins,
  FileCheck,
  Shield,
  Tag,
  Sparkles
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

export interface CommitteeMemberItem {
  id: string;
  name: string;
  role: string;
  group: string;
  affiliation: string;
  country: string;
  expertise: string;
  bio: string;
  placeholder: boolean;
  published: boolean;
  photo?: string | null;
}

export interface TrackItem {
  id: string;
  name: string;
  category: string;
  summary: string;
  topics: string[];
  published: boolean;
}

export interface PricingSettings {
  label: string;
  note: string;
  student: { EUR: number; USD: number; GBP: number };
  academic: { EUR: number; USD: number; GBP: number };
  industry: { EUR: number; USD: number; GBP: number };
  accommodation: {
    single: { EUR: number; USD: number; GBP: number };
    double: { EUR: number; USD: number; GBP: number };
  };
}

export interface AbstractSettings {
  minWords: number;
  maxWords: number;
  maxFileMB: number;
  guidelinesNote?: string;
}

export interface PolicySettings {
  privacy: string;
  terms: string;
}

export interface BrandingSettings {
  logoUrl?: string;
  logoText?: string;
  brandName?: string;
  brandSubtitle?: string;
  faviconUrl?: string;
}

export const DEFAULT_COMMITTEE: CommitteeMemberItem[] = [
  {
    id: "chair",
    name: "Dr. Alistair Vance",
    role: "Conference Chair",
    group: "Conference leadership",
    affiliation: "International Technology Institute",
    country: "United Kingdom",
    expertise: "Global Innovation & Technology Policy",
    bio: "Professor of Emerging Technologies with over 20 years leading interdisciplinary science initiatives.",
    placeholder: false,
    published: true,
    photo: null
  },
  {
    id: "cochair",
    name: "Prof. Elena Rostova",
    role: "Conference Co-Chair",
    group: "Conference leadership",
    affiliation: "Zurich Innovation Labs",
    country: "Switzerland",
    expertise: "Computational Systems & AI",
    bio: "Head of Distributed AI Architecture and international scientific consortium lead.",
    placeholder: false,
    published: true,
    photo: null
  },
  {
    id: "scientific-chair",
    name: "Dr. Marcus Chen",
    role: "Scientific Committee Chair",
    group: "Scientific committee",
    affiliation: "Singapore Technology Research",
    country: "Singapore",
    expertise: "Applied Machine Intelligence",
    bio: "Chief Scientist overseeing peer review workflows and programmatic research track standards.",
    placeholder: false,
    published: true,
    photo: null
  },
  {
    id: "steering-1",
    name: "Dr. Fatima Al-Mansoor",
    role: "Steering Committee Member",
    group: "Steering committee",
    affiliation: "Dubai Technology & Science Authority",
    country: "United Arab Emirates",
    expertise: "Smart Cities & Digital Governance",
    bio: "Strategic director steering global academic partnerships and municipal innovation hubs.",
    placeholder: false,
    published: true,
    photo: null
  },
  {
    id: "local-chair",
    name: "Eng. Tariq Al-Hashimi",
    role: "Local Organizing Chair",
    group: "Local organizing team",
    affiliation: "Dubai World Trade Centre Operations",
    country: "United Arab Emirates",
    expertise: "Host Venue & Delegate Experience",
    bio: "Operations lead for high-capacity hybrid international congresses and summits.",
    placeholder: false,
    published: true,
    photo: null
  }
];

export const DEFAULT_TRACKS: TrackItem[] = [
  {
    id: "01",
    name: "Artificial Intelligence & Autonomous Systems",
    category: "Technology & AI",
    summary: "Breakthrough machine learning, agentic models, and deep reasoning systems.",
    topics: ["Foundational LLMs", "Robotics & Perception", "Autonomous Decisioning", "AI Safety & Ethics"],
    published: true
  },
  {
    id: "02",
    name: "Cloud Architectures & Distributed Systems",
    category: "Computing Systems",
    summary: "High-scale resilient distributed backends, microservices, and edge computing.",
    topics: ["Edge Compute", "Kubernetes & Orchestration", "Fault-tolerant Systems", "Multi-cloud Resilience"],
    published: true
  },
  {
    id: "03",
    name: "Cybersecurity, Zero Trust & Cryptography",
    category: "Security",
    summary: "Next-gen threat intelligence, cryptographic protocols, and infrastructure security.",
    topics: ["Post-quantum Cryptography", "Zero Trust Architecture", "Cloud Security", "Vulnerability Research"],
    published: true
  },
  {
    id: "04",
    name: "FinTech, Blockchain & Digital Economy",
    category: "Economics & Tech",
    summary: "Decentralized consensus, financial intelligence, and digital currency infrastructure.",
    topics: ["Algorithmic Finance", "Smart Contracts", "Payment Protocols", "DeFi Compliance"],
    published: true
  },
  {
    id: "05",
    name: "Biomedical Engineering & Digital Health",
    category: "Health & Life Sciences",
    summary: "Clinical informatics, genomic computations, and medical robotics.",
    topics: ["Clinical AI", "Medical Imaging", "Wearable Health Sensors", "Health Data Privacy"],
    published: true
  },
  {
    id: "06",
    name: "Sustainable Energy & Smart Urban Mobility",
    category: "Sustainability",
    summary: "Renewable energy distribution, smart grids, and autonomous transit solutions.",
    topics: ["Grid Decarbonization", "Electric Vehicle Networks", "Smart City Logistics", "IoT Sensor Grids"],
    published: true
  }
];

export const DEFAULT_PRICING: PricingSettings = {
  label: "Early-bird delegate rates",
  note: "All delegate tiers include digital proceedings, hybrid stream access, and conference certificate.",
  student: { EUR: 199, USD: 219, GBP: 179 },
  academic: { EUR: 399, USD: 439, GBP: 359 },
  industry: { EUR: 499, USD: 549, GBP: 449 },
  accommodation: {
    single: { EUR: 120, USD: 135, GBP: 105 },
    double: { EUR: 160, USD: 180, GBP: 140 }
  }
};

export const DEFAULT_ABSTRACT_SETTINGS: AbstractSettings = {
  minWords: 250,
  maxWords: 500,
  maxFileMB: 5,
  guidelinesNote: "All submitted abstracts undergo double-blind peer review by the scientific committee."
};

export const DEFAULT_POLICIES: PolicySettings = {
  privacy: "Your personal details will be processed exclusively for conference management, registration, and certification in compliance with international privacy protocols.",
  terms: "All accepted abstracts and registered delegates are subject to conference code of conduct, peer review guidelines, and attendance conditions."
};

interface ContentFormProps {
  initialFaviconUrl?: string;
  initialBranding?: BrandingSettings;
  conferenceId: string;
  slug: string;
  initialSections: SectionItem[];
  initialFooter: FooterData;
  initialSpeakers?: SpeakerItem[];
  initialNavbar?: LinkItem[];
  initialCommittee?: CommitteeMemberItem[];
  initialTracks?: TrackItem[];
  initialPricing?: PricingSettings;
  initialAbstractSettings?: AbstractSettings;
  initialPolicies?: PolicySettings;
}

export const DEFAULT_NAVBAR: LinkItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/#about" },
  { label: "Brochure", href: "/brochure" },
  { label: "Tracks", href: "/sessions" },
  { label: "Committee", href: "/#committee" },
  { label: "Speakers", href: "/#speakers" },
  { label: "Abstracts", href: "/abstracts" },
  { label: "Registration", href: "/registration" },
  { label: "Contact Us", href: "/#contact" }
];

const DEFAULT_SECTIONS: SectionItem[] = [
  {
    id: "hero",
    name: "HERO",
    visible: true,
    fields: {
      badge: "DECEMBER 8–10, 2026 • DUBAI, UAE",
      title: "50 TH INTERNATIONAL CONFERENCE",
      titleColor: "Global Innovation & Technology",
      description: "Theme: The Global Intersection of Science, Tech, and Impact",
      heroVenue: "Dubai World Trade Centre, Dubai",
      heroDates: "December 8–10, 2026",
      heroMode: "Hybrid Event",
      ctaText1: "Submit Abstract",
      ctaLink1: "/abstracts",
      ctaText2: "Register Now",
      ctaLink2: "/registration",
      heroImage: ""
    }
  },
  {
    id: "countdown",
    name: "COUNTDOWN",
    visible: true,
    fields: {
      badge: "⏳ Conference Begins In",
      title: "Don't Miss This Global Event",
      targetDate: "2026-12-08T09:00:00"
    }
  },
  {
    id: "about",
    name: "ABOUT",
    visible: true,
    fields: {
      badge: "About the Conference",
      title: "Pioneering the Next Era of",
      titleColor: "Technological Breakthroughs",
      paragraph1: "The International Conference on Global Innovation and Technology brings together leading academic scientists, researchers, and scholars to exchange and share their experiences and research results on all aspects of Technology and Innovation.\n\nIt also provides a premier interdisciplinary platform for researchers, practitioners, and educators to present and discuss the most recent innovations, trends, and concerns as well as practical challenges encountered.",
      aboutImage: "/about_banner.avif",
      aboutVenueCaption: "📍 Dubai World Trade Centre, Dubai",
      milestonesTitle: "Key Milestones & Dates",
      m1_title: "Abstract Submission Opens",
      m1_date: "July 15, 2026",
      m1_status: "Open",
      m2_title: "Abstract Submission Deadline",
      m2_date: "October 1, 2026",
      m2_status: "Upcoming",
      m3_title: "Acceptance Notification",
      m3_date: "November 1, 2026",
      m3_status: "Upcoming",
      m4_title: "Camera Ready Deadline",
      m4_date: "November 15, 2026",
      m4_status: "Upcoming",
      stat1Number: "4",
      stat1Label: "RESEARCH TRACKS",
      stat2Number: "4+",
      stat2Label: "KEYNOTE SPEAKERS"
    }
  },
  {
    id: "sessions",
    name: "SESSIONS",
    visible: true,
    fields: {
      badge: "🎯 Conference Program",
      title: "Sessions, Tracks & Key Dates",
      description: "Explore the multifaceted agenda designed to cover breakthrough advancements across artificial intelligence, cloud architectures, cybersecurity, and future computing paradigms."
    }
  },
  {
    id: "committee",
    name: "COMMITTEE",
    visible: true,
    fields: {
      badge: "ORGANIZING LEADERSHIP",
      title: "Conference Organizing Committee",
      description: "Distinguished academic leaders, steering committee members, and international co-chairs stewarding excellence in global technology innovation.",
      ctaText1: "View Full Committee",
      ctaLink1: "/committee"
    }
  },
  {
    id: "speakers",
    name: "SPEAKERS",
    visible: true,
    fields: {
      badge: "Visionary Thought Leaders",
      title: "World-Class Keynotes & Panelists",
      description: "Hear from the foremost minds in academia and industry shaping tomorrow's technology landscape."
    }
  },
  {
    id: "venue",
    name: "VENUE",
    visible: true,
    fields: {
      badge: "EVENT LOCATION",
      title: "Hosted in the Heart of Dubai",
      description: "Dubai World Trade Centre, situated at the crossroads of the world, provides state-of-the-art facilities for hybrid participation, networking lounges, and interactive exhibition halls.",
      format: "Hybrid (Onsite & Online)",
      mainHall: "Sheikh Maktoum Hall",
      mapLink: "Dubai World Trade Centre, Dubai"
    }
  },
  {
    id: "contact",
    name: "CONTACT",
    visible: true,
    fields: {
      badge: "✉ Contact Secretariat",
      title: "Get in Touch",
      description: "Questions on registration, submission, or corporate sponsorship? Send us an inquiry below and our conference committee will assist you promptly."
    }
  }
];

function buildMergedSections(initial: SectionItem[]): SectionItem[] {
  if (!initial || !Array.isArray(initial) || initial.length === 0) {
    return DEFAULT_SECTIONS;
  }

  const result: SectionItem[] = [];

  for (const def of DEFAULT_SECTIONS) {
    const existing = initial.find((s) => s.id === def.id);
    if (existing) {
      const mergedFields = {
        ...def.fields,
        ...(existing.fields || {})
      };

      if (def.id === "about" && existing.fields?.paragraph2) {
        const p1 = existing.fields.paragraph1 || "";
        const p2 = existing.fields.paragraph2;
        if (!p1.includes(p2)) {
          mergedFields.paragraph1 = p1 ? `${p1}\n\n${p2}` : p2;
        }
      }

      result.push({
        ...def,
        ...existing,
        visible: existing.visible !== undefined ? existing.visible : def.visible,
        fields: mergedFields
      });
    } else {
      result.push(def);
    }
  }

  for (const custom of initial) {
    if (!DEFAULT_SECTIONS.some((d) => d.id === custom.id)) {
      result.push(custom);
    }
  }

  return result;
}

export function ContentForm({
  conferenceId,
  slug,
  initialSections,
  initialFooter,
  initialSpeakers = [],
  initialFaviconUrl = "/favicon.ico",
  initialBranding,
  initialNavbar,
  initialCommittee,
  initialTracks,
  initialPricing,
  initialAbstractSettings,
  initialPolicies
}: ContentFormProps) {
  const [sections, setSections] = useState<SectionItem[]>(() => buildMergedSections(initialSections));

  const [brandingData, setBrandingData] = useState<BrandingSettings>(() => ({
    logoUrl: initialBranding?.logoUrl || "",
    logoText: initialBranding?.logoText || "ICGIT",
    brandName: initialBranding?.brandName || "ICGIT 2026",
    brandSubtitle: initialBranding?.brandSubtitle || "GLOBAL INNOVATION & TECHNOLOGY",
    faviconUrl: initialFaviconUrl || initialBranding?.faviconUrl || "/favicon.ico"
  }));
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingAboutImage, setUploadingAboutImage] = useState(false);

  const [navbarItems, setNavbarItems] = useState<LinkItem[]>(() => {
    if (initialNavbar && Array.isArray(initialNavbar) && initialNavbar.length > 0) {
      return initialNavbar;
    }
    return DEFAULT_NAVBAR;
  });

  const [committeeMembers, setCommitteeMembers] = useState<CommitteeMemberItem[]>(() => {
    if (initialCommittee && Array.isArray(initialCommittee) && initialCommittee.length > 0) {
      return initialCommittee;
    }
    return DEFAULT_COMMITTEE;
  });
  const [editingMember, setEditingMember] = useState<Partial<CommitteeMemberItem> | null>(null);
  const [isNewMember, setIsNewMember] = useState(false);

  const [tracksList, setTracksList] = useState<TrackItem[]>(() => {
    if (initialTracks && Array.isArray(initialTracks) && initialTracks.length > 0) {
      return initialTracks;
    }
    return DEFAULT_TRACKS;
  });
  const [editingTrack, setEditingTrack] = useState<Partial<TrackItem> | null>(null);
  const [isNewTrack, setIsNewTrack] = useState(false);

  const [pricingData, setPricingData] = useState<PricingSettings>(() => {
    return initialPricing || DEFAULT_PRICING;
  });

  const [abstractData, setAbstractData] = useState<AbstractSettings>(() => {
    return initialAbstractSettings || DEFAULT_ABSTRACT_SETTINGS;
  });

  const [policiesData, setPoliciesData] = useState<PolicySettings>(() => {
    return initialPolicies || DEFAULT_POLICIES;
  });

  const [footerData, setFooterData] = useState<FooterData>({
    tagline: initialFooter?.tagline || "International Conference on Global Innovation and Technology",
    contactEmail: initialFooter?.contactEmail || "secretariat@icgit2026.org",
    contactPhone: initialFooter?.contactPhone || "+971 4 000 2026",
    contactAddress: initialFooter?.contactAddress || "Dubai World Trade Centre, Dubai, United Arab Emirates",
    footerCopyright: initialFooter?.footerCopyright || "© 2026 ICGIT. All rights reserved.",
    quickLinks: initialFooter?.quickLinks || [
      { label: "Home", href: "/#home" },
      { label: "About", href: "/#about" },
      { label: "Brochure", href: "/brochure" },
      { label: "Sessions", href: "/#sessions" },
      { label: "Committee", href: "/#committee" },
      { label: "Speakers", href: "/#speakers" },
      { label: "Contact Us", href: "/#contact" }
    ],
    resourceLinks: initialFooter?.resourceLinks || [
      { label: "Brochure", href: "/brochure" },
      { label: "Abstract Submission", href: "/abstracts" },
      { label: "Registration", href: "/registration" },
      { label: "Committee", href: "/committee" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" }
    ]
  });

  const [speakers, setSpeakers] = useState<SpeakerItem[]>(initialSpeakers);
  const toast = useToast();
  const [editingSpeaker, setEditingSpeaker] = useState<Partial<SpeakerItem> | null>(null);
  const [isNewSpeaker, setIsNewSpeaker] = useState(false);
  const [uploadingSpeakerPhoto, setUploadingSpeakerPhoto] = useState(false);

  const [activeTab, setActiveTab] = useState<string>("navigation");
  const [saving, setSaving] = useState(false);
  const [faviconUrl, setFaviconUrl] = useState(initialFaviconUrl);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const sectionTabs = [
    { id: "navigation", label: "Navigation Bar", icon: Compass },
    { id: "hero", label: "Hero Banner", icon: LayoutTemplate },
    { id: "countdown", label: "Countdown Timer", icon: Clock },
    { id: "about", label: "About Conference", icon: BookOpen },
    { id: "committee", label: "Organizing Committee", icon: Users },
    { id: "speakers", label: "Keynote Speakers", icon: Mic2 },
    { id: "sessions", label: "Tracks & Sessions", icon: CalendarDays },
    { id: "pricing", label: "Pricing & Hotel", icon: Coins },
    { id: "abstract", label: "Abstract Rules", icon: FileCheck },
    { id: "venue", label: "Venue & Location", icon: MapPin },
    { id: "contact", label: "Contact Secretariat", icon: Mail },
    { id: "policies", label: "Policies & Terms", icon: Shield },
    { id: "footer", label: "Footer & Legal", icon: Layers }
  ];

  // Committee Handlers
  const moveCommitteeMember = (index: number, direction: "up" | "down") => {
    setCommitteeMembers((prev) => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const handleCreateMember = () => {
    setEditingMember({
      id: `member-${Date.now()}`,
      name: "",
      role: "Committee Member",
      group: "Conference leadership",
      affiliation: "",
      country: "",
      expertise: "",
      bio: "",
      photo: null,
      placeholder: false,
      published: true
    });
    setIsNewMember(true);
  };

  const handleSaveMember = () => {
    if (!editingMember || !editingMember.role) {
      toast.error("Role is required.", "Validation Error");
      return;
    }
    const memberToSave: CommitteeMemberItem = {
      id: editingMember.id || `member-${Date.now()}`,
      name: editingMember.name || "Untitled Member",
      role: editingMember.role,
      group: editingMember.group || "Organizing committee",
      affiliation: editingMember.affiliation || "",
      country: editingMember.country || "",
      expertise: editingMember.expertise || "",
      bio: editingMember.bio || "",
      photo: editingMember.photo || null,
      placeholder: !!editingMember.placeholder,
      published: editingMember.published !== false
    };

    if (isNewMember) {
      setCommitteeMembers((prev) => [...prev, memberToSave]);
      toast.success("New committee member added to list.", "Member Added");
    } else {
      setCommitteeMembers((prev) =>
        prev.map((m) => (m.id === memberToSave.id ? memberToSave : m))
      );
      toast.success("Committee member profile updated.", "Member Updated");
    }
    setEditingMember(null);
  };

  const handleDeleteMember = (id: string) => {
    setCommitteeMembers((prev) => prev.filter((m) => m.id !== id));
    toast.info("Member removed from committee roster.", "Member Deleted");
  };

  // Tracks Handlers
  const moveTrack = (index: number, direction: "up" | "down") => {
    setTracksList((prev) => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const handleCreateTrack = () => {
    setEditingTrack({
      id: `${String(tracksList.length + 1).padStart(2, "0")}`,
      name: "",
      category: "General",
      summary: "",
      topics: [],
      published: true
    });
    setIsNewTrack(true);
  };

  const handleSaveTrack = () => {
    if (!editingTrack || !editingTrack.name) {
      toast.error("Track title is required.", "Validation Error");
      return;
    }
    const trackToSave: TrackItem = {
      id: editingTrack.id || `${String(tracksList.length + 1).padStart(2, "0")}`,
      name: editingTrack.name,
      category: editingTrack.category || "General",
      summary: editingTrack.summary || "",
      topics: Array.isArray(editingTrack.topics) ? editingTrack.topics : [],
      published: editingTrack.published !== false
    };

    if (isNewTrack) {
      setTracksList((prev) => [...prev, trackToSave]);
      toast.success("New track added to conference programme.", "Track Added");
    } else {
      setTracksList((prev) =>
        prev.map((t) => (t.id === trackToSave.id ? trackToSave : t))
      );
      toast.success("Research track updated.", "Track Updated");
    }
    setEditingTrack(null);
  };

  const handleDeleteTrack = (id: string) => {
    setTracksList((prev) => prev.filter((t) => t.id !== id));
    toast.info("Track removed from conference programme.", "Track Deleted");
  };

  // Navigation Bar Handlers
  const moveNavItem = (index: number, direction: "up" | "down") => {
    setNavbarItems((prev) => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const addNavItem = (preset?: { label: string; href: string }) => {
    setNavbarItems((prev) => [
      ...prev,
      preset || { label: "New Link", href: "/#" }
    ]);
  };

  const updateNavItem = (index: number, key: "label" | "href", val: string) => {
    setNavbarItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [key]: val };
      return copy;
    });
  };

  const removeNavItem = (index: number) => {
    setNavbarItems((prev) => {
      if (prev.length <= 1) {
        toast.error("Navigation bar must have at least one link.", "Cannot Delete");
        return prev;
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const resetNavbarToDefault = () => {
    setNavbarItems(DEFAULT_NAVBAR);
    toast.info("Reset navbar items to default conference structure.", "Reset Navigation");
  };

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

  const handleBrandLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("folder", "branding");

      const res = await safeFetchJson<{ url: string }>("/conference-admin/api/admin/upload", {
        method: "POST",
        body: data
      });

      if (!res.ok || !res.data) {
        throw new Error(res.error || "Logo upload failed");
      }

      setBrandingData((prev) => ({ ...prev, logoUrl: res.data!.url }));
      toast.success("Brand logo uploaded successfully!", "Upload Complete");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload logo", "Upload Error");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleAboutImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAboutImage(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("folder", "about");

      const res = await safeFetchJson<{ url: string }>("/conference-admin/api/admin/upload", {
        method: "POST",
        body: data
      });

      if (!res.ok || !res.data) {
        throw new Error(res.error || "About banner upload failed");
      }

      updateSectionField("about", "aboutImage", res.data.url);
      toast.success("About banner image uploaded successfully!", "Upload Complete");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload banner image", "Upload Error");
    } finally {
      setUploadingAboutImage(false);
    }
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

  const handleSaveSpeaker = async () => {
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
      // Include faviconUrl so it persists to DB along with sections & footer
      const res = await safeFetchJson(`/conference-admin/api/admin/content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conferenceId,
          slug,
          sections,
          footer: footerData,
          navigation: navbarItems,
          committee: committeeMembers,
          tracks: tracksList,
          pricing: pricingData,
          abstractSettings: abstractData,
          policies: policiesData,
          faviconUrl,
          branding: {
            ...brandingData,
            faviconUrl
          }
        })
      });

      if (!res.ok) {
        throw new Error(res.error || "Failed to save content");
      }

      setStatus("success");
      const msg = "All navigation, committee members, tracks, pricing, policies & website content published successfully!";
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

      {/* TAB 0: NAVIGATION BAR */}
      {activeTab === "navigation" && (
        <div className="rounded-2xl bg-white border border-slate-200 p-6 lg:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-base">
                <Compass className="w-5 h-5" />
                <span>Public Website Navigation Bar Editor</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Customize header menu items. Change positions (move up/down), create new links, edit labels/URLs, or delete items.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={resetNavbarToDefault}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                title="Reset to recommended conference navigation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>
              <button
                type="button"
                onClick={() => addNavItem()}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Nav Link</span>
              </button>
            </div>
          </div>

          {/* Header Brand Identity & Logo Card */}
          <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Header Navbar Branding &amp; Logo (Image &amp; Text)</span>
              </div>
              <span className="text-[11px] font-semibold text-indigo-600 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 shadow-2xs">
                Navbar Brand Identity
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Logo Box */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>Brand Logo Image (Square / Icon)</span>
                  {brandingData.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setBrandingData((prev) => ({ ...prev, logoUrl: "" }))}
                      className="text-[11px] text-rose-600 hover:underline cursor-pointer"
                    >
                      Remove Logo &amp; Use Text Badge
                    </button>
                  )}
                </label>
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-md shadow-violet-600/20 overflow-hidden">
                    {brandingData.logoUrl ? (
                      <img
                        src={brandingData.logoUrl}
                        alt="Logo preview"
                        className="w-full h-full object-contain"
                        onError={(e) => ((e.target as HTMLElement).style.display = "none")}
                      />
                    ) : (
                      <span>{brandingData.logoText || "ICGIT"}</span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={brandingData.logoUrl || ""}
                    onChange={(e) => setBrandingData((prev) => ({ ...prev, logoUrl: e.target.value }))}
                    placeholder="/uploads/branding/logo.png or https://..."
                    className="flex-1 w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-100"
                  />
                  <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-sm shrink-0 transition-all">
                    {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Upload className="w-4 h-4" />}
                    <span>Upload Logo Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBrandLogoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Logo Icon Text */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Logo Text (Fallback badge text if no image)</label>
                <input
                  type="text"
                  value={brandingData.logoText || ""}
                  onChange={(e) => setBrandingData((prev) => ({ ...prev, logoText: e.target.value }))}
                  placeholder="ICGIT"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-100"
                />
              </div>

              {/* Brand Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Brand Title (Heading)</label>
                <input
                  type="text"
                  value={brandingData.brandName || ""}
                  onChange={(e) => setBrandingData((prev) => ({ ...prev, brandName: e.target.value }))}
                  placeholder="ICGIT 2026"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm font-semibold placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-100"
                />
              </div>

              {/* Brand Subtitle */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Brand Subtitle (Upper Tagline)</label>
                <input
                  type="text"
                  value={brandingData.brandSubtitle || ""}
                  onChange={(e) => setBrandingData((prev) => ({ ...prev, brandSubtitle: e.target.value }))}
                  placeholder="GLOBAL INNOVATION & TECHNOLOGY"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm uppercase placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-100"
                />
              </div>
            </div>
          </div>

          {/* Quick-Add Presets */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                1-Click Quick-Add Conference Pages &amp; Sections:
              </span>
              <span className="text-[11px] text-slate-400">Click to append to navbar</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Home", href: "/" },
                { label: "About", href: "/#about" },
                { label: "Brochure", href: "/brochure" },
                { label: "Tracks", href: "/sessions" },
                { label: "Committee", href: "/#committee" },
                { label: "Speakers", href: "/#speakers" },
                { label: "Abstracts", href: "/abstracts" },
                { label: "Registration", href: "/registration" },
                { label: "Venue", href: "/#venue" },
                { label: "Contact Us", href: "/#contact" }
              ].map((preset) => {
                const alreadyExists = navbarItems.some((n) => n.href === preset.href);
                return (
                  <button
                    key={preset.href}
                    type="button"
                    onClick={() => addNavItem(preset)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      alreadyExists
                        ? "bg-slate-200/70 text-slate-600 hover:bg-slate-200"
                        : "bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50 shadow-2xs"
                    }`}
                  >
                    <Plus className="w-3 h-3 text-indigo-500" />
                    <span>{preset.label}</span>
                    <span className="text-[10px] text-slate-400">({preset.href})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Preview Mockup */}
          <div className="p-4 rounded-xl bg-slate-900 text-white shadow-inner space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              <span>Live Header Navigation Mockup</span>
              <span>{navbarItems.length} Links Active</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto py-2 px-1">
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold text-[10px] flex items-center justify-center overflow-hidden shadow-sm">
                  {brandingData.logoUrl ? (
                    <img src={brandingData.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <span>{brandingData.logoText || "ICGIT"}</span>
                  )}
                </div>
                <div>
                  <span className="block font-bold text-xs text-white leading-tight">
                    {brandingData.brandName || "ICGIT 2026"}
                  </span>
                  <span className="block text-[8px] font-semibold text-slate-400 uppercase tracking-wider leading-tight">
                    {brandingData.brandSubtitle || "GLOBAL INNOVATION & TECHNOLOGY"}
                  </span>
                </div>
              </div>
              <div className="h-5 w-px bg-slate-700 shrink-0 mx-1" />
              {navbarItems.map((item, idx) => (
                <span
                  key={`preview-${idx}`}
                  className="px-2.5 py-1 rounded-md text-xs font-medium text-slate-300 bg-slate-800/80 whitespace-nowrap border border-slate-700/50"
                >
                  {item.label || "Untitled"}
                </span>
              ))}
              <span className="ml-auto px-3 py-1 rounded-md bg-indigo-600 text-white text-xs font-bold shrink-0">
                Register Now →
              </span>
            </div>
          </div>

          {/* Nav Items Table / List */}
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-3 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <div className="col-span-1 text-center">Pos</div>
              <div className="col-span-2 text-center">Change Order</div>
              <div className="col-span-4">Display Label</div>
              <div className="col-span-4">Target Link / URL</div>
              <div className="col-span-1 text-center">Delete</div>
            </div>

            {navbarItems.map((item, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === navbarItems.length - 1;

              return (
                <div
                  key={`nav-row-${idx}`}
                  className="grid grid-cols-12 gap-3 items-center p-3 rounded-xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200 transition-all"
                >
                  {/* Position Badge */}
                  <div className="col-span-1 flex justify-center">
                    <span className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                  </div>

                  {/* Move Up / Move Down */}
                  <div className="col-span-2 flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      disabled={isFirst}
                      onClick={() => moveNavItem(idx, "up")}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-xs font-medium disabled:opacity-25 disabled:pointer-events-none transition-colors cursor-pointer"
                      title="Move Up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                      <span>Up</span>
                    </button>
                    <button
                      type="button"
                      disabled={isLast}
                      onClick={() => moveNavItem(idx, "down")}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-xs font-medium disabled:opacity-25 disabled:pointer-events-none transition-colors cursor-pointer"
                      title="Move Down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                      <span>Down</span>
                    </button>
                  </div>

                  {/* Label */}
                  <div className="col-span-4">
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => updateNavItem(idx, "label", e.target.value)}
                      placeholder="e.g. Committee"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-100"
                    />
                  </div>

                  {/* Href / Target */}
                  <div className="col-span-4 flex items-center gap-2">
                    <input
                      type="text"
                      value={item.href}
                      onChange={(e) => updateNavItem(idx, "href", e.target.value)}
                      placeholder="e.g. /#committee or /sessions"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs font-mono placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-100"
                    />
                    <span
                      className={`text-[10px] font-semibold px-2 py-1 rounded-md shrink-0 uppercase tracking-wider ${
                        item.href.startsWith("/#")
                          ? "bg-amber-100 text-amber-800"
                          : item.href.startsWith("http")
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {item.href.startsWith("/#") ? "Anchor" : item.href.startsWith("http") ? "External" : "Page"}
                    </span>
                  </div>

                  {/* Delete */}
                  <div className="col-span-1 flex justify-center">
                    <button
                      type="button"
                      onClick={() => removeNavItem(idx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
                <label className="text-xs font-semibold text-slate-700">Theme</label>
                <textarea
                  rows={2}
                  value={sec.fields?.description || ""}
                  onChange={(e) => updateSectionField("hero", "description", e.target.value)}
                  placeholder="e.g. Theme: The Global Intersection of Science, Tech, and Impact"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
                <p className="text-[11px] text-slate-500">
                  Sets the conference theme/description shown directly below the hero title on the homepage.
                </p>
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

              {/* Button 1 (Abstract Button - First) */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Button 1 (Abstract Button)</span>
                  <span className="text-[10px] uppercase font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">Shown First</span>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-600">Button 1 Text</label>
                  <input
                    type="text"
                    value={sec.fields?.ctaText1 !== undefined ? sec.fields.ctaText1 : "Submit Abstract"}
                    onChange={(e) => updateSectionField("hero", "ctaText1", e.target.value)}
                    placeholder="Submit Abstract"
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-100 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-600">Button 1 Link / Target</label>
                  <input
                    type="text"
                    value={sec.fields?.ctaLink1 !== undefined ? sec.fields.ctaLink1 : "/abstracts"}
                    onChange={(e) => updateSectionField("hero", "ctaLink1", e.target.value)}
                    placeholder="/abstracts"
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm font-mono placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-100 transition-all"
                  />
                </div>
              </div>

              {/* Button 2 (Register Button - Second) */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Button 2 (Register Button)</span>
                  <span className="text-[10px] uppercase font-semibold text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded border border-slate-200">Shown Second</span>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-600">Button 2 Text</label>
                  <input
                    type="text"
                    value={sec.fields?.ctaText2 !== undefined ? sec.fields.ctaText2 : "Register Now"}
                    onChange={(e) => updateSectionField("hero", "ctaText2", e.target.value)}
                    placeholder="Register Now"
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-100 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-600">Button 2 Link / Target</label>
                  <input
                    type="text"
                    value={sec.fields?.ctaLink2 !== undefined ? sec.fields.ctaLink2 : "/registration"}
                    onChange={(e) => updateSectionField("hero", "ctaLink2", e.target.value)}
                    placeholder="/registration"
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm font-mono placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-100 transition-all"
                  />
                </div>
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

              {/* Favicon Upload Field */}
              <div className="md:col-span-2 space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                  <span>🌐 Browser Tab Favicon</span>
                  {faviconUrl && (
                    <img
                      src={faviconUrl}
                      alt="Current favicon"
                      className="w-5 h-5 rounded object-contain bg-white border border-slate-200"
                      onError={(e) => ((e.target as HTMLElement).style.display = "none")}
                    />
                  )}
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={faviconUrl}
                    onChange={(e) => setFaviconUrl(e.target.value)}
                    placeholder="/favicon.ico or /uploads/favicon/..."
                    className="flex-1 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                  <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer border border-slate-300 transition shadow-sm shrink-0">
                    {uploadingFavicon ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    <span>Upload Favicon</span>
                    <input
                      type="file"
                      accept="image/*,.ico"
                      onChange={handleFaviconUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-[11px] text-slate-500">Changes are saved when you click &quot;Publish All Section Changes&quot; below.</p>
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

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Countdown Target Date &amp; Time (ISO or YYYY-MM-DDTHH:mm)</label>
                <input
                  type="datetime-local"
                  value={sec.fields?.targetDate ? sec.fields.targetDate.slice(0, 16) : "2026-12-08T09:00"}
                  onChange={(e) => updateSectionField("countdown", "targetDate", e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
                <p className="text-[11px] text-slate-500">
                  The live countdown clock on the homepage calculates remaining days, hours, minutes, and seconds until this exact conference start time.
                </p>
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
                <label className="text-xs font-semibold text-slate-700">Title Accent / Highlight (Colored Second Part)</label>
                <input
                  type="text"
                  value={sec.fields?.titleColor || ""}
                  onChange={(e) => updateSectionField("about", "titleColor", e.target.value)}
                  placeholder="e.g. Technological Breakthroughs"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              {/* Single unified textarea for multi-paragraph about description */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">About Content (Multiple Paragraphs Supported)</label>
                <textarea
                  rows={8}
                  value={sec.fields?.paragraph1 || ""}
                  onChange={(e) => {
                    updateSectionField("about", "paragraph1", e.target.value);
                    updateSectionField("about", "paragraph2", "");
                  }}
                  placeholder="Write your conference description here. Separate paragraphs with an empty line. Spacing and paragraph structure are preserved exactly on the live website..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all leading-relaxed"
                />
                <p className="text-[11px] text-slate-500">
                  Write freely in this single box. Any empty line between text creates a separate paragraph formatted cleanly on the public website.
                </p>
              </div>

              {/* About Venue Banner & Location Caption */}
              <div className="md:col-span-2 p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs uppercase tracking-wider">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    <span>About Section Venue Banner &amp; Location Tag</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">Shown below about text</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-semibold text-slate-700">Venue Banner Image</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={sec.fields?.aboutImage || ""}
                        onChange={(e) => updateSectionField("about", "aboutImage", e.target.value)}
                        placeholder="/about_banner.avif or /uploads/about/... or https://..."
                        className="flex-1 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-100"
                      />
                      <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-sm shrink-0 transition-all">
                        {uploadingAboutImage ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Upload className="w-4 h-4" />}
                        <span>Upload Banner Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAboutImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Venue Location Overlay Tag</label>
                    <input
                      type="text"
                      value={sec.fields?.aboutVenueCaption || ""}
                      onChange={(e) => updateSectionField("about", "aboutVenueCaption", e.target.value)}
                      placeholder="📍 Dubai World Trade Centre, Dubai"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-100"
                    />
                  </div>
                </div>
              </div>

              {/* Key Milestones & Dates Section */}
              <div className="md:col-span-2 p-5 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs uppercase tracking-wider">
                    <CalendarDays className="w-4 h-4 text-indigo-600" />
                    <span>Key Milestones &amp; Important Dates Card</span>
                  </div>
                  <span className="text-[10px] font-semibold text-indigo-600 bg-white px-2 py-0.5 rounded border border-indigo-200">
                    Right Column
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Milestones Card Heading Title</label>
                  <input
                    type="text"
                    value={sec.fields?.milestonesTitle !== undefined ? sec.fields.milestonesTitle : "Key Milestones & Dates"}
                    onChange={(e) => updateSectionField("about", "milestonesTitle", e.target.value)}
                    placeholder="Key Milestones & Dates"
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm font-semibold placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-100"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {[
                    { key: "m1", defaultTitle: "Abstract Submission Opens", defaultDate: "July 15, 2026", defaultStatus: "Open" },
                    { key: "m2", defaultTitle: "Abstract Submission Deadline", defaultDate: "October 1, 2026", defaultStatus: "Upcoming" },
                    { key: "m3", defaultTitle: "Acceptance Notification", defaultDate: "November 1, 2026", defaultStatus: "Upcoming" },
                    { key: "m4", defaultTitle: "Camera Ready Deadline", defaultDate: "November 15, 2026", defaultStatus: "Upcoming" }
                  ].map((m, idx) => (
                    <div key={m.key} className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase">
                        <span>Milestone #{idx + 1}</span>
                        <input
                          type="text"
                          value={sec.fields?.[`${m.key}_status`] !== undefined ? sec.fields[`${m.key}_status`] : m.defaultStatus}
                          onChange={(e) => updateSectionField("about", `${m.key}_status`, e.target.value)}
                          placeholder="e.g. Open / Upcoming"
                          className="w-24 px-2 py-0.5 text-[11px] font-bold text-right bg-slate-50 border border-slate-200 rounded text-indigo-700 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-slate-500">Title</label>
                        <input
                          type="text"
                          value={sec.fields?.[`${m.key}_title`] !== undefined ? sec.fields[`${m.key}_title`] : m.defaultTitle}
                          onChange={(e) => updateSectionField("about", `${m.key}_title`, e.target.value)}
                          placeholder={m.defaultTitle}
                          className="w-full px-2.5 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-slate-500">Date Display</label>
                        <input
                          type="text"
                          value={sec.fields?.[`${m.key}_date`] !== undefined ? sec.fields[`${m.key}_date`] : m.defaultDate}
                          onChange={(e) => updateSectionField("about", `${m.key}_date`, e.target.value)}
                          placeholder={m.defaultDate}
                          className="w-full px-2.5 py-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* The 2 Stat Highlight Boxes Below Milestones */}
              <div className="md:col-span-2 p-5 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-950 font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>The 2 Highlight Stat Boxes (Below Milestones)</span>
                  </div>
                  <span className="text-[10px] text-amber-800 font-semibold bg-white px-2 py-0.5 rounded border border-amber-200">
                    2 Highlight Boxes
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Box 1 */}
                  <div className="p-4 rounded-xl bg-white border border-amber-200/80 shadow-2xs space-y-2">
                    <span className="text-xs font-bold text-slate-800 block">Box 1 (Left Highlight Box)</span>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-500">Stat / Number</label>
                      <input
                        type="text"
                        value={sec.fields?.stat1Number !== undefined ? sec.fields.stat1Number : "4"}
                        onChange={(e) => updateSectionField("about", "stat1Number", e.target.value)}
                        placeholder="4"
                        className="w-full px-3 py-1.5 text-base font-extrabold text-indigo-950 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-500">Label (Uppercase Subtext)</label>
                      <input
                        type="text"
                        value={sec.fields?.stat1Label !== undefined ? sec.fields.stat1Label : "RESEARCH TRACKS"}
                        onChange={(e) => updateSectionField("about", "stat1Label", e.target.value)}
                        placeholder="RESEARCH TRACKS"
                        className="w-full px-3 py-1.5 text-xs font-bold uppercase text-slate-700 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                  </div>

                  {/* Box 2 */}
                  <div className="p-4 rounded-xl bg-white border border-amber-200/80 shadow-2xs space-y-2">
                    <span className="text-xs font-bold text-slate-800 block">Box 2 (Right Highlight Box)</span>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-500">Stat / Number</label>
                      <input
                        type="text"
                        value={sec.fields?.stat2Number !== undefined ? sec.fields.stat2Number : "4+"}
                        onChange={(e) => updateSectionField("about", "stat2Number", e.target.value)}
                        placeholder="4+"
                        className="w-full px-3 py-1.5 text-base font-extrabold text-indigo-950 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-500">Label (Uppercase Subtext)</label>
                      <input
                        type="text"
                        value={sec.fields?.stat2Label !== undefined ? sec.fields.stat2Label : "KEYNOTE SPEAKERS"}
                        onChange={(e) => updateSectionField("about", "stat2Label", e.target.value)}
                        placeholder="KEYNOTE SPEAKERS"
                        className="w-full px-3 py-1.5 text-xs font-bold uppercase text-slate-700 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
                      />
                    </div>
                  </div>
                </div>
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

            {/* Scientific Tracks Roster Manager */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Research Tracks &amp; Sessions Catalog ({tracksList.length} tracks)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Add, edit, reorder, and configure session topics for all tracks displayed on the homepage and at /sessions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCreateTrack}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Scientific Track</span>
                </button>
              </div>

              {/* Edit / Add Track Drawer Box */}
              {editingTrack && (
                <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-indigo-200/80">
                    <h5 className="font-bold text-indigo-950 text-sm">
                      {isNewTrack ? "Create New Scientific Track" : `Edit Track #${editingTrack.id}: ${editingTrack.name}`}
                    </h5>
                    <button
                      type="button"
                      onClick={() => setEditingTrack(null)}
                      className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Track Title *</label>
                      <input
                        type="text"
                        value={editingTrack.name || ""}
                        onChange={(e) => setEditingTrack({ ...editingTrack, name: e.target.value })}
                        placeholder="e.g. Artificial Intelligence & Autonomous Systems"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs font-medium focus:outline-none focus:border-indigo-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Research Category / Discipline</label>
                      <input
                        type="text"
                        value={editingTrack.category || ""}
                        onChange={(e) => setEditingTrack({ ...editingTrack, category: e.target.value })}
                        placeholder="e.g. Technology & AI"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs font-medium focus:outline-none focus:border-indigo-600"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Track Summary / Description</label>
                      <textarea
                        rows={2}
                        value={editingTrack.summary || ""}
                        onChange={(e) => setEditingTrack({ ...editingTrack, summary: e.target.value })}
                        placeholder="Concise overview of this track's scope and research domains..."
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-indigo-600"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Session Topics (one per line)</label>
                      <textarea
                        rows={4}
                        value={(editingTrack.topics || []).join("\n")}
                        onChange={(e) =>
                          setEditingTrack({
                            ...editingTrack,
                            topics: e.target.value.split("\n").filter((t) => t.trim() !== "")
                          })
                        }
                        placeholder="Topic 1&#10;Topic 2&#10;Topic 3"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs font-mono focus:outline-none focus:border-indigo-600"
                      />
                    </div>

                    <div className="md:col-span-2 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="track-published"
                        checked={editingTrack.published !== false}
                        onChange={(e) => setEditingTrack({ ...editingTrack, published: e.target.checked })}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor="track-published" className="text-xs font-semibold text-slate-700 cursor-pointer">
                        Publish this track on public website
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-indigo-200/80">
                    <button
                      type="button"
                      onClick={() => setEditingTrack(null)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveTrack}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition cursor-pointer"
                    >
                      Save Track
                    </button>
                  </div>
                </div>
              )}

              {/* Tracks List */}
              <div className="space-y-2.5">
                {tracksList.map((track, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === tracksList.length - 1;

                  return (
                    <div
                      key={track.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 hover:bg-white hover:shadow-xs transition"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                          #{String(idx + 1).padStart(2, "0")}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h5 className="font-bold text-slate-900 text-xs sm:text-sm truncate">{track.name}</h5>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                              {track.category}
                            </span>
                            {track.published === false && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                                Draft
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 truncate mt-0.5">{track.summary}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {track.topics?.length || 0} subtopics configured
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                        <button
                          type="button"
                          disabled={isFirst}
                          onClick={() => moveTrack(idx, "up")}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-indigo-600 hover:bg-slate-50 disabled:opacity-25 transition cursor-pointer"
                          title="Move Up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={isLast}
                          onClick={() => moveTrack(idx, "down")}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-indigo-600 hover:bg-slate-50 disabled:opacity-25 transition cursor-pointer"
                          title="Move Down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTrack(track);
                            setIsNewTrack(false);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 text-xs font-semibold transition cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTrack(track.id)}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Delete track"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* TAB: ORGANIZING COMMITTEE (Positioned right above Speakers) */}
      {activeTab === "committee" && (() => {
        const sec = getSection("committee");
        return (
          <div className="rounded-2xl bg-white border border-slate-200 p-6 lg:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-base">
                <Users className="w-5 h-5" />
                <span>Organizing Committee Section Configuration</span>
              </div>
              <button
                type="button"
                onClick={() => toggleSectionVisibility("committee")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  sec.visible !== false
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-500 border-slate-200"
                }`}
              >
                {sec.visible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                <span>{sec.visible !== false ? "Section Visible" : "Section Hidden"}</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <span className="font-bold text-amber-700 uppercase tracking-wider shrink-0 mt-0.5">Layout Note:</span>
              <p>
                The Organizing Committee section is positioned <strong>directly above the Featured Speakers section</strong> on the public homepage. Delegates can also explore the dedicated <a href="/committee" target="_blank" className="underline font-semibold text-amber-800">/committee</a> page.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Badge Text</label>
                <input
                  type="text"
                  value={sec.fields?.badge || ""}
                  onChange={(e) => updateSectionField("committee", "badge", e.target.value)}
                  placeholder="ORGANIZING LEADERSHIP"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Heading Title</label>
                <input
                  type="text"
                  value={sec.fields?.title || ""}
                  onChange={(e) => updateSectionField("committee", "title", e.target.value)}
                  placeholder="Conference Organizing Committee"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Section Subtitle / Description</label>
                <textarea
                  rows={2}
                  value={sec.fields?.description || ""}
                  onChange={(e) => updateSectionField("committee", "description", e.target.value)}
                  placeholder="Distinguished academic leaders, steering committee members, and international co-chairs stewarding excellence in global technology innovation."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Primary CTA Button Text</label>
                <input
                  type="text"
                  value={sec.fields?.ctaText1 || ""}
                  onChange={(e) => updateSectionField("committee", "ctaText1", e.target.value)}
                  placeholder="View Full Committee"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Primary CTA Button Link</label>
                <input
                  type="text"
                  value={sec.fields?.ctaLink1 || ""}
                  onChange={(e) => updateSectionField("committee", "ctaLink1", e.target.value)}
                  placeholder="/committee"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
            </div>

            {/* Committee Member Roster Manager */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Organizing Committee Members Roster ({committeeMembers.length} members)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Add, edit, reorder, and configure committee members displayed on the homepage and at /committee.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCreateMember}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Committee Member</span>
                </button>
              </div>

              {/* Edit / Add Member Drawer Box */}
              {editingMember && (
                <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-indigo-200/80">
                    <h5 className="font-bold text-indigo-950 text-sm">
                      {isNewMember ? "Add New Committee Member" : `Edit Member: ${editingMember.name || editingMember.role}`}
                    </h5>
                    <button
                      type="button"
                      onClick={() => setEditingMember(null)}
                      className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Full Name *</label>
                      <input
                        type="text"
                        value={editingMember.name || ""}
                        onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                        placeholder="e.g. Dr. Alistair Vance"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs font-medium focus:outline-none focus:border-indigo-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Committee Role *</label>
                      <input
                        type="text"
                        value={editingMember.role || ""}
                        onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })}
                        placeholder="e.g. Conference Chair, Scientific Chair, Steering Committee"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs font-medium focus:outline-none focus:border-indigo-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Committee Group</label>
                      <select
                        value={editingMember.group || "Organizing committee"}
                        onChange={(e) => setEditingMember({ ...editingMember, group: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs font-medium focus:outline-none focus:border-indigo-600"
                      >
                        <option value="Conference leadership">Conference leadership</option>
                        <option value="Scientific committee">Scientific committee</option>
                        <option value="Steering committee">Steering committee</option>
                        <option value="Organizing committee">Organizing committee</option>
                        <option value="Local organizing team">Local organizing team</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Institution / Affiliation</label>
                      <input
                        type="text"
                        value={editingMember.affiliation || ""}
                        onChange={(e) => setEditingMember({ ...editingMember, affiliation: e.target.value })}
                        placeholder="e.g. International Technology Institute"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs font-medium focus:outline-none focus:border-indigo-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Country</label>
                      <input
                        type="text"
                        value={editingMember.country || ""}
                        onChange={(e) => setEditingMember({ ...editingMember, country: e.target.value })}
                        placeholder="e.g. United Kingdom, UAE"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs font-medium focus:outline-none focus:border-indigo-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Areas of Expertise</label>
                      <input
                        type="text"
                        value={editingMember.expertise || ""}
                        onChange={(e) => setEditingMember({ ...editingMember, expertise: e.target.value })}
                        placeholder="e.g. Global Tech Policy, Distributed AI"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs font-medium focus:outline-none focus:border-indigo-600"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Biography / Overview</label>
                      <textarea
                        rows={3}
                        value={editingMember.bio || ""}
                        onChange={(e) => setEditingMember({ ...editingMember, bio: e.target.value })}
                        placeholder="Full academic biography and contributions..."
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-indigo-600"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Photo URL / File path</label>
                      <input
                        type="text"
                        value={editingMember.photo || ""}
                        onChange={(e) => setEditingMember({ ...editingMember, photo: e.target.value })}
                        placeholder="/uploads/committee/photo.png or https://..."
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-indigo-600"
                      />
                    </div>

                    <div className="md:col-span-2 flex flex-wrap gap-4 pt-2">
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingMember.published !== false}
                          onChange={(e) => setEditingMember({ ...editingMember, published: e.target.checked })}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Publish on website</span>
                      </label>

                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!editingMember.placeholder}
                          onChange={(e) => setEditingMember({ ...editingMember, placeholder: e.target.checked })}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Placeholder profile — appointment not confirmed</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-indigo-200/80">
                    <button
                      type="button"
                      onClick={() => setEditingMember(null)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveMember}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition cursor-pointer"
                    >
                      Save Member
                    </button>
                  </div>
                </div>
              )}

              {/* Members List */}
              <div className="space-y-2.5">
                {committeeMembers.map((member, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === committeeMembers.length - 1;

                  return (
                    <div
                      key={member.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 hover:bg-white hover:shadow-xs transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden">
                          {member.photo ? (
                            <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>{member.role ? member.role.slice(0, 2).toUpperCase() : "CM"}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h5 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                              {member.name || member.role}
                            </h5>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {member.role}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                              {member.group}
                            </span>
                            {member.placeholder && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                                Pending
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {member.affiliation ? `${member.affiliation}, ${member.country}` : member.country}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                        <button
                          type="button"
                          disabled={isFirst}
                          onClick={() => moveCommitteeMember(idx, "up")}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-indigo-600 hover:bg-slate-50 disabled:opacity-25 transition cursor-pointer"
                          title="Move Up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={isLast}
                          onClick={() => moveCommitteeMember(idx, "down")}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-indigo-600 hover:bg-slate-50 disabled:opacity-25 transition cursor-pointer"
                          title="Move Down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingMember(member);
                            setIsNewMember(false);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 text-xs font-semibold transition cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMember(member.id)}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Delete member"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
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

      {/* TAB: PRICING & HOTEL ACCOMMODATION */}
      {activeTab === "pricing" && (
        <div className="rounded-2xl bg-white border border-slate-200 p-6 lg:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-base">
              <Coins className="w-5 h-5" />
              <span>Registration &amp; Hotel Accommodation Pricing</span>
            </div>
            <span className="text-xs text-slate-500 font-medium">Multi-Currency Rates (EUR / USD / GBP)</span>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Pricing Tier Badge / Label</label>
              <input
                type="text"
                value={pricingData.label || ""}
                onChange={(e) => setPricingData({ ...pricingData, label: e.target.value })}
                placeholder="e.g. Early-bird delegate rates"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Pricing Conditions Note</label>
              <textarea
                rows={2}
                value={pricingData.note || ""}
                onChange={(e) => setPricingData({ ...pricingData, note: e.target.value })}
                placeholder="All delegate tiers include digital proceedings and access to all hybrid tracks..."
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-indigo-600"
              />
            </div>

            {/* Delegate Tiers Grid */}
            <div className="pt-4 border-t border-slate-100">
              <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
                Delegate Registration Rates
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(["student", "academic", "industry"] as const).map((category) => {
                  const catTitle =
                    category === "academic"
                      ? "Academic Delegate"
                      : category === "industry"
                      ? "Industry Delegate"
                      : "Student Delegate";

                  return (
                    <div key={category} className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">{catTitle}</span>
                        <Tag className="w-3.5 h-3.5 text-indigo-500" />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {(["EUR", "USD", "GBP"] as const).map((curr) => (
                          <div key={curr} className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500">{curr}</label>
                            <input
                              type="number"
                              min={0}
                              step={1}
                              value={pricingData[category]?.[curr] ?? 0}
                              onChange={(e) =>
                                setPricingData({
                                  ...pricingData,
                                  [category]: {
                                    ...pricingData[category],
                                    [curr]: Number(e.target.value)
                                  }
                                })
                              }
                              className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs font-mono font-bold focus:outline-none focus:border-indigo-600"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Accommodation Grid */}
            <div className="pt-4 border-t border-slate-100">
              <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
                Hotel Accommodation Rates (Per Room / Night)
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(["single", "double"] as const).map((room) => {
                  const roomTitle = room === "single" ? "Single Occupancy Room" : "Double / Twin Room";

                  return (
                    <div key={room} className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
                      <span className="font-bold text-slate-900 text-xs block">{roomTitle}</span>
                      <div className="grid grid-cols-3 gap-2">
                        {(["EUR", "USD", "GBP"] as const).map((curr) => (
                          <div key={curr} className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500">{curr}</label>
                            <input
                              type="number"
                              min={0}
                              step={1}
                              value={pricingData.accommodation?.[room]?.[curr] ?? 0}
                              onChange={(e) =>
                                setPricingData({
                                  ...pricingData,
                                  accommodation: {
                                    ...pricingData.accommodation,
                                    [room]: {
                                      ...pricingData.accommodation[room],
                                      [curr]: Number(e.target.value)
                                    }
                                  }
                                })
                              }
                              className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs font-mono font-bold focus:outline-none focus:border-indigo-600"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: ABSTRACT SUBMISSION RULES */}
      {activeTab === "abstract" && (
        <div className="rounded-2xl bg-white border border-slate-200 p-6 lg:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-base">
              <FileCheck className="w-5 h-5" />
              <span>Abstract Submission Guidelines &amp; Constraints</span>
            </div>
            <a href="/abstracts" target="_blank" className="text-xs font-semibold text-indigo-600 hover:underline">
              Preview Form ↗
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Minimum Abstract Words</label>
              <input
                type="number"
                min={50}
                max={5000}
                value={abstractData.minWords ?? 250}
                onChange={(e) => setAbstractData({ ...abstractData, minWords: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm font-mono focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Maximum Abstract Words</label>
              <input
                type="number"
                min={100}
                max={10000}
                value={abstractData.maxWords ?? 500}
                onChange={(e) => setAbstractData({ ...abstractData, maxWords: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm font-mono focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Maximum Upload File Size (MB)</label>
              <input
                type="number"
                min={1}
                max={50}
                value={abstractData.maxFileMB ?? 5}
                onChange={(e) => setAbstractData({ ...abstractData, maxFileMB: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm font-mono focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Review Guidelines Note</label>
              <textarea
                rows={3}
                value={abstractData.guidelinesNote || ""}
                onChange={(e) => setAbstractData({ ...abstractData, guidelinesNote: e.target.value })}
                placeholder="Guidelines displayed to authors submitting abstracts..."
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>
        </div>
      )}

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

      {/* TAB: POLICIES & TERMS */}
      {activeTab === "policies" && (
        <div className="rounded-2xl bg-white border border-slate-200 p-6 lg:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-base">
              <Shield className="w-5 h-5" />
              <span>Policies, Privacy &amp; Legal Terms</span>
            </div>
            <div className="flex items-center gap-3">
              <a href="/privacy" target="_blank" className="text-xs font-semibold text-indigo-600 hover:underline">
                View /privacy ↗
              </a>
              <a href="/terms" target="_blank" className="text-xs font-semibold text-indigo-600 hover:underline">
                View /terms ↗
              </a>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Privacy Notice / Policy</label>
              <textarea
                rows={7}
                value={policiesData.privacy || ""}
                onChange={(e) => setPoliciesData({ ...policiesData, privacy: e.target.value })}
                placeholder="Full text of privacy notice..."
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Registration &amp; Abstract Submission Terms &amp; Conditions
              </label>
              <textarea
                rows={7}
                value={policiesData.terms || ""}
                onChange={(e) => setPoliciesData({ ...policiesData, terms: e.target.value })}
                placeholder="Full text of conference terms and participant conditions..."
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>
        </div>
      )}

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
