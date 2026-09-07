"use client";

import { usePathname, useParams } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Globe2,
  FileCheck2,
  Users,
  DollarSign,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  History
} from "lucide-react";
import LinkComponent from "next/link";

interface AdminSidebarProps {
  slug: string;
}

export function AdminSidebar({ slug }: AdminSidebarProps) {
  const pathname = usePathname();
  const params = useParams();
  const activeSlug = (params?.slug as string) || slug;

  const navItems = [
    {
      name: "Overview",
      href: `/${activeSlug}`,
      icon: LayoutDashboard,
      exact: true
    },
    {
      name: "Website Content",
      href: `/${activeSlug}/content`,
      icon: FileText
    },
    {
      name: "SEO & Metadata",
      href: `/${activeSlug}/seo`,
      icon: Globe2
    },
    {
      name: "Abstract Submissions",
      href: `/${activeSlug}/submissions`,
      icon: FileCheck2
    },
    {
      name: "Attendees & Registrations",
      href: `/${activeSlug}/registrations`,
      icon: Users
    },
    {
      name: "Revenue & Payments",
      href: `/${activeSlug}/revenue`,
      icon: DollarSign
    },
    {
      name: "Activity History",
      href: `/${activeSlug}/history`,
      icon: History
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 shrink-0 select-none shadow-sm">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-200">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/20">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-slate-900 text-base tracking-tight leading-none">Super Admin</h1>
          <p className="text-[11px] text-slate-500 font-medium tracking-wide mt-1">Multi-Conference Portal</p>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Conference Management
        </div>

        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href || pathname.endsWith(item.href)
            : pathname.includes(item.href);

          const Icon = item.icon;

          return (
            <LinkComponent
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? "bg-indigo-50 text-indigo-700 font-semibold shadow-sm border border-indigo-100/80"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-600"
                  }`}
                />
                <span>{item.name}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-indigo-600" />}
            </LinkComponent>
          );
        })}
      </div>

      {/* Public Site Link */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/50">
        <a
          href="http://localhost:3000/ICGIT"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-white border border-slate-200/80 shadow-sm transition-all"
        >
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            View Public Website
          </span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </aside>
  );
}
