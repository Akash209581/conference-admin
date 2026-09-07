import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  variant?: "indigo" | "emerald" | "amber" | "violet" | "rose";
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "indigo"
}: StatCardProps) {
  const variantStyles = {
    indigo: {
      iconBg: "bg-indigo-50 text-indigo-600 border border-indigo-200/60",
      accent: "text-indigo-600"
    },
    emerald: {
      iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-200/60",
      accent: "text-emerald-600"
    },
    amber: {
      iconBg: "bg-amber-50 text-amber-600 border border-amber-200/60",
      accent: "text-amber-600"
    },
    violet: {
      iconBg: "bg-violet-50 text-violet-600 border border-violet-200/60",
      accent: "text-violet-600"
    },
    rose: {
      iconBg: "bg-rose-50 text-rose-600 border border-rose-200/60",
      accent: "text-rose-600"
    }
  };

  const style = variantStyles[variant];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-5 shadow-sm transition-all hover:shadow-md hover:border-slate-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <p className="mt-2 text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-slate-500 font-medium">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${style.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500">
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}
