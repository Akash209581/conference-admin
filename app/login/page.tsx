"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { safeFetchJson } from "@/lib/fetch-client";
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await safeFetchJson<{ success: boolean; error?: string }>("/conference-admin/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok || !res.data?.success) {
        throw new Error(res.error || res.data?.error || "Invalid login credentials");
      }

      toast.success("Welcome back, Super Admin!", "Login Successful");
      router.push("/");
      router.refresh();
    } catch (err: any) {
      const errMsg = err.message || "Failed to log in. Please try again.";
      setError(errMsg);
      toast.error(errMsg, "Authentication Failed");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
      {/* Ambient background blur elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 mb-4 shadow-xl">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Super Admin Portal</h1>
          <p className="text-sm text-slate-400 mt-1.5">
            Multi-Conference Management System
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="flex items-center gap-3 p-3.5 mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Admin Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@hanscinovum.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Password</label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-600 mt-6">
          Authorized personnel only. &copy; {new Date().getFullYear()} Hansci Novum.
        </p>
      </div>
    </div>
  );
}
