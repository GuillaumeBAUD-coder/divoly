"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Leaf } from "lucide-react";
import { DivolyWordmark } from "@/components/DivolyLogo";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password.");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#07070f" }}>
      <div className="w-full max-w-sm">
        <Link href="/" className="flex justify-center mb-10">
          <DivolyWordmark height={40} />
        </Link>

        <div className="glass rounded-3xl p-8">
          <div className="flex items-center gap-2 mb-1">
            <Leaf size={15} className="text-emerald-400" />
            <h1 className="text-xl font-bold text-white">Welcome back to divoly</h1>
          </div>
          <p className="text-white/40 text-sm mb-7">Sign in to contribute answers</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider block mb-2">Email</label>
              <input
                type="email"
                className="search-input w-full rounded-xl px-4 py-3 text-sm"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase tracking-wider block mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  className="search-input w-full rounded-xl px-4 py-3 text-sm pr-11"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 rounded-xl font-semibold text-sm disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="text-center text-sm text-white/40 mt-6">
            No account?{" "}
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
