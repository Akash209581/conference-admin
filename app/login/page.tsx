"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { safeFetchJson } from "@/lib/fetch-client";
import "./login.css";

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


  return <main className="admin-login"><section className="login-card" aria-labelledby="login-title"><div className="login-brand">HANSCI NOVUM<span>ADMIN PORTAL</span></div><div className="login-eyebrow">CONFERENCE MANAGEMENT</div><h1 id="login-title">Welcome back.</h1><p className="login-intro">Sign in to manage your conference.</p><form onSubmit={handleLogin} aria-busy={loading}>{error&&<p className="login-error" role="alert">{error}</p>}<label htmlFor="admin-email">Email address</label><input id="admin-email" name="email" type="email" autoComplete="username" required maxLength={180} value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@hanscinovum.com" disabled={loading}/><label htmlFor="admin-password">Password</label><input id="admin-password" name="password" type="password" autoComplete="current-password" required maxLength={1024} value={password} onChange={e=>setPassword(e.target.value)} disabled={loading}/><button disabled={loading} type="submit">{loading?'Signing in...':'Sign in'}</button></form><p className="login-footer">Private administrator workspace</p></section></main>;
}
