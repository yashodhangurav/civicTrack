"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    } else {
      // The /dashboard route will handle role-based redirection
      window.location.href = "/dashboard";
    }
  };

  const quickLogin = async (demoEmail: string) => {
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email: demoEmail,
      password: "password123",
      redirect: false,
    });
    if (res?.error) {
      setError("Demo login failed. Ensure seed data exists.");
      setLoading(false);
    } else {
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 text-white relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]" />

      <div className="relative w-full max-w-md">
        {/* Back to home */}
        <Link href="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mb-8 group">
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          Back to Home
        </Link>

        <form onSubmit={handleLogin} className="w-full p-8 bg-white/[0.03] border border-white/10 rounded-3xl space-y-6 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center font-bold text-2xl mx-auto mb-4 shadow-lg shadow-indigo-500/20">C</div>
            <h2 className="text-2xl font-bold tracking-tight">Welcome Back</h2>
            <p className="text-gray-400 mt-1 text-sm">Sign in to access your CivicTrack dashboard</p>
          </div>
          
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm text-center flex items-center justify-center gap-2">
              <span>Error:</span> {error}
            </div>
          )}
          
          {/* Form fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
              <input 
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-white placeholder:text-gray-600 transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <input 
                type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-white placeholder:text-gray-600 transition-all" 
              />
            </div>
          </div>

          <button disabled={loading} type="submit" className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40">
            {loading ? "Signing in..." : "Sign In"}
          </button>

          {/* Quick Login */}
          <div className="border-t border-white/5 pt-5 mt-5">
            <p className="text-xs text-gray-500 text-center mb-3 font-medium uppercase tracking-wider">Quick Demo Login</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Citizen", email: "citizen@test.com", color: "bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20" },
                { label: "Field Worker", email: "worker@test.com", color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20" },
                { label: "Supervisor", email: "supervisor@test.com", color: "bg-orange-500/10 border-orange-500/20 text-orange-400 hover:bg-orange-500/20" },
                { label: "Admin", email: "admin@test.com", color: "bg-purple-500/10 border-purple-500/20 text-purple-400 hover:bg-purple-500/20" },
              ].map(demo => (
                <button 
                  key={demo.email} type="button" disabled={loading}
                  onClick={() => quickLogin(demo.email)}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all disabled:opacity-50 ${demo.color}`}
                >
                  {demo.label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-4">
            Don&apos;t have an account? <Link href="/register" className="text-indigo-400 hover:underline">Create one</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
