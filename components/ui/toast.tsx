"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toast: {
    success: (message: string, title?: string, duration?: number) => void;
    error: (message: string, title?: string, duration?: number) => void;
    warning: (message: string, title?: string, duration?: number) => void;
    info: (message: string, title?: string, duration?: number) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, title?: string, duration: number = 4000) => {
      const id = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastItem = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toastMethods = {
    success: (msg: string, title?: string, dur?: number) => addToast("success", msg, title, dur),
    error: (msg: string, title?: string, dur?: number) => addToast("error", msg, title, dur),
    warning: (msg: string, title?: string, dur?: number) => addToast("warning", msg, title, dur),
    info: (msg: string, title?: string, dur?: number) => addToast("info", msg, title, dur)
  };

  return (
    <ToastContext.Provider value={{ toast: toastMethods }}>
      {children}
      {/* Toast Container */}
      <div
        aria-live="assertive"
        className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((t) => {
          let styles = {
            bg: "bg-white",
            border: "border-slate-200",
            iconColor: "text-indigo-600",
            titleColor: "text-slate-900",
            icon: Info
          };

          if (t.type === "success") {
            styles = {
              bg: "bg-emerald-50",
              border: "border-emerald-200",
              iconColor: "text-emerald-600",
              titleColor: "text-emerald-900",
              icon: CheckCircle2
            };
          } else if (t.type === "error") {
            styles = {
              bg: "bg-rose-50",
              border: "border-rose-200",
              iconColor: "text-rose-600",
              titleColor: "text-rose-900",
              icon: AlertCircle
            };
          } else if (t.type === "warning") {
            styles = {
              bg: "bg-amber-50",
              border: "border-amber-200",
              iconColor: "text-amber-600",
              titleColor: "text-amber-900",
              icon: AlertTriangle
            };
          }

          const IconComponent = styles.icon;

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3.5 p-4 rounded-2xl border shadow-xl transition-all animate-in fade-in slide-in-from-top-4 duration-300 ${styles.bg} ${styles.border}`}
            >
              <div className={`p-1 shrink-0 ${styles.iconColor}`}>
                <IconComponent className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0 pr-1">
                {t.title && (
                  <h4 className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${styles.titleColor}`}>
                    {t.title}
                  </h4>
                )}
                <p className="text-sm font-medium text-slate-700 leading-snug break-words">
                  {t.message}
                </p>
              </div>

              <button
                onClick={() => removeToast(t.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors shrink-0"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context.toast;
}
