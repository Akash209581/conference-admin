"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Building2, Check } from "lucide-react";

interface ConferenceSwitcherProps {
  conferences: Array<{ id: string; name: string; slug: string }>;
  currentSlug: string;
}

export function ConferenceSwitcher({
  conferences,
  currentSlug
}: ConferenceSwitcherProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const currentConf = conferences.find((c) => c.slug === currentSlug) || conferences[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/70 border border-slate-200 text-slate-800 text-sm font-semibold transition-all shadow-sm"
      >
        <Building2 className="w-4 h-4 text-indigo-600" />
        <span>{currentConf?.name || "Select Conference"}</span>
        <ChevronDown className="w-4 h-4 text-slate-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
              Active Conferences
            </div>
            <div className="py-1 space-y-0.5">
              {conferences.map((conf) => {
                const isSelected = conf.slug === currentSlug;
                return (
                  <button
                    key={conf.id}
                    onClick={() => {
                      setOpen(false);
                      router.push(`/${conf.slug}`);
                    }}
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors ${
                      isSelected
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span>{conf.name}</span>
                    {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
