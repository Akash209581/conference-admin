"use client";

import { ConferenceSwitcher } from "@/components/admin/conference-switcher";
import { ShieldCheck, User, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface AdminHeaderProps {
  conferences: Array<{ id: string; name: string; slug: string }>;
  currentSlug: string;
}

export function AdminHeader({ conferences, currentSlug }: AdminHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/conference-admin/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error", err);
    }
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="h-16 px-6 bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Left: Conference Switcher */}
      <div className="flex items-center gap-4">
        <ConferenceSwitcher conferences={conferences} currentSlug={currentSlug} />
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Live & Connected
        </div>
      </div>

      {/* Right: Actions and Admin User Profile */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>Super Admin Access</span>
        </div>

        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm">
          <User className="w-4 h-4" />
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold transition-all"
          title="Sign Out"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
